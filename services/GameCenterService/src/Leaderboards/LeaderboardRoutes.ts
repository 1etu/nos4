import { errorReply, jsonReply } from '../Http/HttpReply.ts'
import { GameCenterErrors } from '../Support/GameCenterTypes.ts'
import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import type { SqlClient } from '../Database/Connection.ts'
import {
  findGame,
  findLeaderboard,
  leaderboardAround,
  leaderboardPage,
  listLeaderboards
} from './LeaderboardStore.ts'

const readCount = (url: URL, key: string, fallback: number, maximum: number): number | undefined => {
  const raw = url.searchParams.get(key)
  if (raw === null) return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 0 || value > maximum) return undefined
  return value
}

export const getLeaderboards = async (
  client: SqlClient,
  gameId: string
): Promise<Response> => {
  const game = await findGame(client, gameId)
  if (!game) return errorReply(404, GameCenterErrors.gameNotFound)
  return jsonReply(200, { game, leaderboards: await listLeaderboards(client, gameId) })
}

export const getScores = async (
  client: SqlClient,
  url: URL,
  gameId: string,
  leaderboardId: string
): Promise<Response> => {
  const leaderboard = await findLeaderboard(client, gameId, leaderboardId)
  if (!leaderboard) return errorReply(404, GameCenterErrors.leaderboardNotFound)

  const limit = readCount(
    url,
    'limit',
    GameCenterMetrics.leaderboardPageSize,
    GameCenterMetrics.leaderboardMaximumPageSize
  )
  const offset = readCount(url, 'offset', 0, GameCenterMetrics.leaderboardMaximumOffset)
  if (limit === undefined || offset === undefined || limit === 0) {
    return errorReply(400, GameCenterErrors.invalidPage)
  }

  const page = await leaderboardPage(client, gameId, leaderboardId, offset, limit)
  return jsonReply(200, { leaderboard, total: page.total, entries: page.entries })
}

export const getScoresAroundMe = async (
  client: SqlClient,
  url: URL,
  gameId: string,
  leaderboardId: string,
  playerId: string
): Promise<Response> => {
  const leaderboard = await findLeaderboard(client, gameId, leaderboardId)
  if (!leaderboard) return errorReply(404, GameCenterErrors.leaderboardNotFound)

  const radius = readCount(
    url,
    'radius',
    GameCenterMetrics.leaderboardDefaultRadius,
    GameCenterMetrics.leaderboardMaximumRadius
  )
  if (radius === undefined) return errorReply(400, GameCenterErrors.invalidPage)

  const page = await leaderboardAround(client, gameId, leaderboardId, playerId, radius)
  return jsonReply(200, {
    leaderboard,
    total: page.total,
    rank: page.rank,
    entries: page.entries
  })
}
