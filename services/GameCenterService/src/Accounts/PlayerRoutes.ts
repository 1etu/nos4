import { errorReply, jsonReply } from '../Http/HttpReply.ts'
import { isJsonRequest, readJsonBody, readString } from '../Http/RequestBody.ts'
import { GameCenterErrors } from '../Support/GameCenterTypes.ts'
import { statusIsAcceptable } from '../Aliases/AliasShape.ts'
import type { SqlClient } from '../Database/Connection.ts'
import { findPlayer, updateStatus } from './PlayerStore.ts'
import { rotateSession, sessionNeedsRotation } from './SessionStore.ts'

export const readPlayer = async (
  client: SqlClient,
  playerId: string,
  token: string,
  expiresAt: string
): Promise<Response> => {
  const player = await findPlayer(client, playerId)
  if (!player) return errorReply(401, GameCenterErrors.invalidSession)

  const session = sessionNeedsRotation(expiresAt)
    ? await rotateSession(client, playerId, token)
    : { token, expiresAt }

  return jsonReply(200, { player, session })
}

export const patchPlayer = async (
  client: SqlClient,
  request: Request,
  playerId: string
): Promise<Response> => {
  if (!isJsonRequest(request)) {
    return errorReply(415, GameCenterErrors.unsupportedMediaType)
  }

  const body = await readJsonBody(request)
  if (!body.ok) {
    if (body.failure === 'oversize') return errorReply(413, GameCenterErrors.bodyTooLarge)
    return errorReply(400, GameCenterErrors.malformedBody)
  }

  const status = readString(body.value, 'status') ?? ''
  if (!statusIsAcceptable(status)) return errorReply(400, GameCenterErrors.statusTooLong)

  const player = await updateStatus(client, playerId, status)
  if (!player) return errorReply(401, GameCenterErrors.invalidSession)
  return jsonReply(200, { player })
}
