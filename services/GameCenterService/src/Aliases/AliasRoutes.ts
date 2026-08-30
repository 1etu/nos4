import { errorReply, jsonReply, rateLimitedReply } from '../Http/HttpReply.ts'
import { GameCenterErrors, type GameCenterRequestContext } from '../Support/GameCenterTypes.ts'
import { GameCenterRateLimits } from '../Support/GameCenterMetrics.ts'
import { consumeRateLimit } from '../Database/RateLimitStore.ts'
import type { SqlClient } from '../Database/Connection.ts'
import { aliasExists } from './AliasStore.ts'
import { aliasUniquenessForm } from './AliasNormalisation.ts'
import { aliasRejection } from './AliasShape.ts'

export const checkAlias = async (
  client: SqlClient,
  url: URL,
  context: GameCenterRequestContext
): Promise<Response> => {
  const value = url.searchParams.get('value')
  if (value === null) return errorReply(400, GameCenterErrors.aliasMissing)

  const verdict = await consumeRateLimit(
    client,
    `alias-check:${context.address}`,
    GameCenterRateLimits.aliasCheck.budget,
    GameCenterRateLimits.aliasCheck.windowSeconds
  )
  if (!verdict.allowed) return rateLimitedReply(verdict.retryAfterSeconds)

  const shape = aliasRejection(value)
  if (shape) return jsonReply(200, { value, available: false, reason: shape })

  const taken = await aliasExists(client, aliasUniquenessForm(value))
  return jsonReply(200, {
    value,
    available: !taken,
    reason: taken ? GameCenterErrors.aliasTaken : null
  })
}
