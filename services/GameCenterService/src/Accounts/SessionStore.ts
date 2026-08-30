import { queryRow, type SqlClient } from '../Database/Connection.ts'
import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import type { GameCenterSession } from '../Support/GameCenterTypes.ts'
import { fromUtf8, randomBytes, sha256, toBase64Url } from '../Support/SecretBytes.ts'

interface SessionRow {
  readonly player_id: string
  readonly expires_at: string
}

const digestOf = async (token: string): Promise<Uint8Array> => sha256(fromUtf8(token))

export const mintSession = async (
  client: SqlClient,
  playerId: string
): Promise<GameCenterSession> => {
  const token = toBase64Url(randomBytes(GameCenterMetrics.sessionTokenBytes))
  const row = await queryRow<SessionRow>(
    client,
    `insert into sessions (player_id, token_hash, expires_at)
     values ($1, $2, now() + make_interval(secs => $3))
     returning player_id, expires_at`,
    [playerId, await digestOf(token), GameCenterMetrics.sessionLifetimeSeconds]
  )
  return {
    token,
    expiresAt: row ? new Date(row.expires_at).toISOString() : new Date().toISOString()
  }
}

export const resolveSession = async (
  client: SqlClient,
  token: string
): Promise<{ playerId: string; expiresAt: string } | undefined> => {
  const row = await queryRow<SessionRow>(
    client,
    'select player_id, expires_at from sessions where token_hash = $1 and expires_at > now()',
    [await digestOf(token)]
  )
  if (!row) return undefined
  return { playerId: row.player_id, expiresAt: new Date(row.expires_at).toISOString() }
}

export const revokeSession = async (client: SqlClient, token: string): Promise<void> => {
  await client.query('delete from sessions where token_hash = $1', [await digestOf(token)])
}

export const rotateSession = async (
  client: SqlClient,
  playerId: string,
  token: string
): Promise<GameCenterSession> => {
  const next = await mintSession(client, playerId)
  await revokeSession(client, token)
  return next
}

export const sessionNeedsRotation = (expiresAt: string): boolean => {
  const remaining = Date.parse(expiresAt) - Date.now()
  return remaining < GameCenterMetrics.sessionRenewalThresholdSeconds * 1000
}
