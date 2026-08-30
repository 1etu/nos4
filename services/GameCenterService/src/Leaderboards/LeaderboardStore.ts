import { queryRow, queryRows, type SqlClient } from '../Database/Connection.ts'
import type { GameCenterEntry, GameCenterLeaderboard } from '../Support/GameCenterTypes.ts'

interface GameRow {
  readonly id: string
  readonly title: string
}

interface LeaderboardRow {
  readonly game_id: string
  readonly id: string
  readonly title: string
}

interface EntryRow {
  readonly rank: string
  readonly total: string
  readonly alias: string
  readonly score: number
  readonly achieved_at: string
}

interface TotalRow {
  readonly total: string
}

const RankedPage = `
  select
    rank() over (order by s.score desc, s.achieved_at asc) as rank,
    count(*) over () as total,
    p.alias, s.score, s.achieved_at
  from scores s
  join players p on p.id = s.player_id
  where s.game_id = $1 and s.leaderboard_id = $2
  order by s.score desc, s.achieved_at asc
  offset $3 limit $4
`

const RankedAround = `
  with ranked as (
    select
      rank() over (order by s.score desc, s.achieved_at asc) as rank,
      count(*) over () as total,
      p.alias, s.score, s.achieved_at, s.player_id
    from scores s
    join players p on p.id = s.player_id
    where s.game_id = $1 and s.leaderboard_id = $2
  ),
  anchor as (select rank from ranked where player_id = $3)
  select r.rank, r.total, r.alias, r.score, r.achieved_at
  from ranked r
  join anchor a on r.rank between a.rank - $4 and a.rank + $4
  order by r.rank
`

const toEntry = (row: EntryRow): GameCenterEntry => ({
  rank: Number(row.rank),
  alias: row.alias,
  score: Number(row.score),
  achievedAt: new Date(row.achieved_at).toISOString()
})

export const findGame = async (
  client: SqlClient,
  gameId: string
): Promise<GameRow | undefined> =>
  queryRow<GameRow>(client, 'select id, title from games where id = $1', [gameId])

export const listLeaderboards = async (
  client: SqlClient,
  gameId: string
): Promise<GameCenterLeaderboard[]> => {
  const rows = await queryRows<LeaderboardRow>(
    client,
    'select game_id, id, title from leaderboards where game_id = $1 order by title',
    [gameId]
  )
  return rows.map((row) => ({ gameId: row.game_id, id: row.id, title: row.title }))
}

export const findLeaderboard = async (
  client: SqlClient,
  gameId: string,
  leaderboardId: string
): Promise<GameCenterLeaderboard | undefined> => {
  const row = await queryRow<LeaderboardRow>(
    client,
    'select game_id, id, title from leaderboards where game_id = $1 and id = $2',
    [gameId, leaderboardId]
  )
  return row ? { gameId: row.game_id, id: row.id, title: row.title } : undefined
}

export const leaderboardPage = async (
  client: SqlClient,
  gameId: string,
  leaderboardId: string,
  offset: number,
  limit: number
): Promise<{ total: number; entries: GameCenterEntry[] }> => {
  const rows = await queryRows<EntryRow>(client, RankedPage, [
    gameId,
    leaderboardId,
    offset,
    limit
  ])
  const first = rows[0]
  if (!first) return { total: await leaderboardTotal(client, gameId, leaderboardId), entries: [] }
  return { total: Number(first.total), entries: rows.map(toEntry) }
}

export const leaderboardTotal = async (
  client: SqlClient,
  gameId: string,
  leaderboardId: string
): Promise<number> => {
  const row = await queryRow<TotalRow>(
    client,
    'select count(*) as total from scores where game_id = $1 and leaderboard_id = $2',
    [gameId, leaderboardId]
  )
  return row ? Number(row.total) : 0
}

export const leaderboardAround = async (
  client: SqlClient,
  gameId: string,
  leaderboardId: string,
  playerId: string,
  radius: number
): Promise<{ total: number; rank: number | null; entries: GameCenterEntry[] }> => {
  const rows = await queryRows<EntryRow>(client, RankedAround, [
    gameId,
    leaderboardId,
    playerId,
    radius
  ])
  const first = rows[0]
  if (!first) {
    return {
      total: await leaderboardTotal(client, gameId, leaderboardId),
      rank: null,
      entries: []
    }
  }
  const entries = rows.map(toEntry)
  const mine = await queryRow<EntryRow>(
    client,
    `select rank, total, alias, score, achieved_at from (
       select rank() over (order by s.score desc, s.achieved_at asc) as rank,
              count(*) over () as total,
              p.alias, s.score, s.achieved_at, s.player_id
       from scores s join players p on p.id = s.player_id
       where s.game_id = $1 and s.leaderboard_id = $2
     ) ranked where player_id = $3`,
    [gameId, leaderboardId, playerId]
  )
  return {
    total: Number(first.total),
    rank: mine ? Number(mine.rank) : null,
    entries
  }
}
