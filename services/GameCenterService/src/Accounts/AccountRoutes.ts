import { errorReply, jsonReply, noContentReply, rateLimitedReply } from '../Http/HttpReply.ts'
import { isJsonRequest, readJsonBody, readString } from '../Http/RequestBody.ts'
import { GameCenterErrors, type GameCenterRequestContext } from '../Support/GameCenterTypes.ts'
import { GameCenterRateLimits } from '../Support/GameCenterMetrics.ts'
import { aliasUniquenessForm } from '../Aliases/AliasNormalisation.ts'
import { aliasRejection } from '../Aliases/AliasShape.ts'
import { consumeRateLimit } from '../Database/RateLimitStore.ts'
import type { SqlClient } from '../Database/Connection.ts'
import {
  hashPassword,
  passwordIsAcceptable,
  passwordMatchesRecord,
  recordNeedsUpgrade
} from './PasswordHash.ts'
import { createPlayer, findCredential, findPlayer, upgradePasswordRecord } from './PlayerStore.ts'
import { mintSession, resolveSession, revokeSession } from './SessionStore.ts'

const limitedReply = async (
  client: SqlClient,
  bucket: string,
  budget: number,
  windowSeconds: number
): Promise<Response | undefined> => {
  const verdict = await consumeRateLimit(client, bucket, budget, windowSeconds)
  return verdict.allowed ? undefined : rateLimitedReply(verdict.retryAfterSeconds)
}

export const createAccount = async (
  client: SqlClient,
  request: Request,
  context: GameCenterRequestContext
): Promise<Response> => {
  if (!isJsonRequest(request)) {
    return errorReply(415, GameCenterErrors.unsupportedMediaType)
  }
  const signupLimit = await limitedReply(
    client,
    `signup:${context.address}`,
    GameCenterRateLimits.signup.budget,
    GameCenterRateLimits.signup.windowSeconds
  )
  if (signupLimit) return signupLimit

  const body = await readJsonBody(request)
  if (!body.ok) {
    if (body.failure === 'oversize') return errorReply(413, GameCenterErrors.bodyTooLarge)
    return errorReply(400, GameCenterErrors.malformedBody)
  }

  const alias = readString(body.value, 'alias')?.trim() ?? ''
  const password = readString(body.value, 'password') ?? ''
  const shape = aliasRejection(alias)
  if (shape) return errorReply(400, shape)
  if (!passwordIsAcceptable(password)) return errorReply(400, GameCenterErrors.weakPassword)

  const normalised = aliasUniquenessForm(alias)
  const player = await createPlayer(client, alias, normalised, await hashPassword(password))
  if (!player) return errorReply(409, GameCenterErrors.aliasTaken)

  return jsonReply(201, { player, session: await mintSession(client, player.id) })
}

export const createSession = async (
  client: SqlClient,
  request: Request,
  context: GameCenterRequestContext
): Promise<Response> => {
  if (!isJsonRequest(request)) {
    return errorReply(415, GameCenterErrors.unsupportedMediaType)
  }

  const body = await readJsonBody(request)
  if (!body.ok) {
    if (body.failure === 'oversize') return errorReply(413, GameCenterErrors.bodyTooLarge)
    return errorReply(400, GameCenterErrors.malformedBody)
  }

  const alias = readString(body.value, 'alias')?.trim() ?? ''
  const password = readString(body.value, 'password') ?? ''
  const normalised = aliasUniquenessForm(alias)

  const addressLimit = await limitedReply(
    client,
    `signin:${context.address}`,
    GameCenterRateLimits.signInAddress.budget,
    GameCenterRateLimits.signInAddress.windowSeconds
  )
  if (addressLimit) return addressLimit

  const accountLimit = await limitedReply(
    client,
    `signin:${normalised}`,
    GameCenterRateLimits.signInAccount.budget,
    GameCenterRateLimits.signInAccount.windowSeconds
  )
  if (accountLimit) return accountLimit

  const credential = await findCredential(client, normalised)
  if (!credential || !(await passwordMatchesRecord(password, credential.password_record))) {
    return errorReply(401, GameCenterErrors.invalidCredentials)
  }

  if (recordNeedsUpgrade(credential.password_record)) {
    await upgradePasswordRecord(client, credential.player_id, await hashPassword(password))
  }

  const player = await findPlayer(client, credential.player_id)
  if (!player) return errorReply(500, GameCenterErrors.internalError)

  return jsonReply(200, { player, session: await mintSession(client, player.id) })
}

export const deleteSession = async (client: SqlClient, token: string): Promise<Response> => {
  await revokeSession(client, token)
  return noContentReply()
}

export const authenticate = async (
  client: SqlClient,
  request: Request
): Promise<{ playerId: string; token: string; expiresAt: string } | undefined> => {
  const header = request.headers.get('authorization') ?? ''
  if (!header.startsWith('Bearer ')) return undefined
  const token = header.slice('Bearer '.length).trim()
  if (token === '') return undefined
  const session = await resolveSession(client, token)
  if (!session) return undefined
  return { playerId: session.playerId, token, expiresAt: session.expiresAt }
}
