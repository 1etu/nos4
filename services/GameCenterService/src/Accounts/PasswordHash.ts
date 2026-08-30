import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import {
  fromBase64Url,
  fromUtf8,
  randomBytes,
  secretsMatch,
  toBase64Url,
  type ByteArray
} from '../Support/SecretBytes.ts'

const Algorithm = 'pbkdf2-sha256'
const FieldSeparator = '$'
const RecordFieldCount = 4

const deriveKey = async (
  password: string,
  salt: ByteArray,
  iterations: number
): Promise<ByteArray> => {
  const key = await crypto.subtle.importKey('raw', fromUtf8(password), 'PBKDF2', false, [
    'deriveBits'
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    GameCenterMetrics.passwordKeyBits
  )
  return new Uint8Array(bits)
}

export const passwordIsAcceptable = (password: string): boolean =>
  password.length >= GameCenterMetrics.passwordMinimumLength &&
  password.length <= GameCenterMetrics.passwordMaximumLength

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(GameCenterMetrics.passwordSaltBytes)
  const derived = await deriveKey(password, salt, GameCenterMetrics.passwordIterations)
  return [
    Algorithm,
    String(GameCenterMetrics.passwordIterations),
    toBase64Url(salt),
    toBase64Url(derived)
  ].join(FieldSeparator)
}

export const passwordMatchesRecord = async (
  password: string,
  record: string
): Promise<boolean> => {
  const fields = record.split(FieldSeparator)
  if (fields.length !== RecordFieldCount) return false

  const [algorithm, iterations, salt, expected] = fields
  if (algorithm !== Algorithm || !iterations || !salt || !expected) return false

  const rounds = Number(iterations)
  if (!Number.isInteger(rounds) || rounds <= 0) return false

  const derived = await deriveKey(password, fromBase64Url(salt), rounds)
  return secretsMatch(derived, fromBase64Url(expected))
}

export const recordNeedsUpgrade = (record: string): boolean =>
  !record.startsWith(
    `${Algorithm}${FieldSeparator}${GameCenterMetrics.passwordIterations}${FieldSeparator}`
  )
