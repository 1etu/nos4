import { queryRow, type SqlClient } from '../Database/Connection.ts'
import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import type {
  GameCenterRejectionReason,
  GameCenterRunClaim,
  GameCenterSubmission
} from '../Support/GameCenterTypes.ts'
import { fromUtf8, randomBytes, randomInteger, sha256, toBase64Url } from '../Support/SecretBytes.ts'

interface OpenRunRow {
  readonly id: string
  readonly seed: number
  readonly expires_at: string
}

interface OpenCountRow {
  readonly open_runs: string
}

interface ClaimRow {
  readonly game_id: string
  readonly leaderboard_id: string
  readonly opened_at: string
  readonly minimum_first_point_seconds: string
  readonly minimum_seconds_per_point: string
  readonly minimum_duration_milliseconds: number
  readonly maximum_duration_milliseconds: number
  readonly minimum_frames_per_second: string
  readonly maximum_frames_per_second: string
  readonly minimum_inputs_per_point: string
}

interface PreviousRow {
  readonly submitted_score: number
  readonly duration_milliseconds: number
  readonly frame_count: number
  readonly input_count: number
}

interface RankRow {
  readonly rank: string
  readonly total: string
}

export interface OpenedRun {
  readonly id: string
  readonly token: string
  readonly seed: number
  readonly expiresAt: string
}

const digestOf = async (token: string): Promise<Uint8Array> => sha256(fromUtf8(token))

export const countOpenRuns = async (client: SqlClient, playerId: string): Promise<number> => {
  const row = await queryRow<OpenCountRow>(
    client,
    `select count(*) as open_runs from runs
     where player_id = $1 and submitted_at is null and expires_at > now()`,
    [playerId]
  )
  return row ? Number(row.open_runs) : 0
}

export const openRun = async (
  client: SqlClient,
  playerId: string,
  gameId: string,
  leaderboardId: string
): Promise<OpenedRun | undefined> => {
  const token = toBase64Url(randomBytes(GameCenterMetrics.runTokenBytes))
  const row = await queryRow<OpenRunRow>(
    client,
    `insert into runs (game_id, leaderboard_id, player_id, token_hash, seed, expires_at)
     values ($1, $2, $3, $4, $5, now() + make_interval(secs => $6))
     returning id, seed, expires_at`,
    [
      gameId,
      leaderboardId,
      playerId,
      await digestOf(token),
      randomInteger(GameCenterMetrics.runSeedBits),
      GameCenterMetrics.runTokenLifetimeSeconds
    ]
  )
  if (!row) return undefined
  return {
    id: row.id,
    token,
    seed: Number(row.seed),
    expiresAt: new Date(row.expires_at).toISOString()
  }
}

interface RunSummaryRow {
  readonly game_id: string
  readonly leaderboard_id: string
  readonly submitted_at: string | null
  readonly expired: boolean
}

export interface RunSummary {
  readonly gameId: string
  readonly leaderboardId: string
  readonly submitted: boolean
  readonly expired: boolean
}

export const findRun = async (
  client: SqlClient,
  runId: string,
  playerId: string
): Promise<RunSummary | undefined> => {
  const row = await queryRow<RunSummaryRow>(
    client,
    `select game_id, leaderboard_id, submitted_at, expires_at <= now() as expired
     from runs where id = $1 and player_id = $2`,
    [runId, playerId]
  )
  if (!row) return undefined
  return {
    gameId: row.game_id,
    leaderboardId: row.leaderboard_id,
    submitted: row.submitted_at !== null,
    expired: row.expired
  }
}

export const claimRun = async (
  client: SqlClient,
  runId: string,
  token: string,
  playerId: string,
  submission: GameCenterSubmission
): Promise<GameCenterRunClaim | undefined> => {
  const row = await queryRow<ClaimRow>(
    client,
    `update runs r
     set submitted_at = now(), submitted_score = $4, duration_milliseconds = $5,
         frame_count = $6, input_count = $7
     from leaderboards l
     where l.game_id = r.game_id and l.id = r.leaderboard_id
       and r.id = $1 and r.token_hash = $2 and r.player_id = $3
       and r.submitted_at is null and r.expires_at > now()
     returning r.game_id, r.leaderboard_id, r.opened_at,
               l.minimum_first_point_seconds, l.minimum_seconds_per_point,
               l.minimum_duration_milliseconds, l.maximum_duration_milliseconds,
               l.minimum_frames_per_second, l.maximum_frames_per_second,
               l.minimum_inputs_per_point`,
    [
      runId,
      await digestOf(token),
      playerId,
      submission.score,
      submission.durationMilliseconds,
      submission.frameCount,
      submission.inputCount
    ]
  )
  if (!row) return undefined
  return {
    gameId: row.game_id,
    leaderboardId: row.leaderboard_id,
    openedAt: new Date(row.opened_at).toISOString(),
    policy: {
      minimumFirstPointSeconds: Number(row.minimum_first_point_seconds),
      minimumSecondsPerPoint: Number(row.minimum_seconds_per_point),
      minimumDurationMilliseconds: Number(row.minimum_duration_milliseconds),
      maximumDurationMilliseconds: Number(row.maximum_duration_milliseconds),
      minimumFramesPerSecond: Number(row.minimum_frames_per_second),
      maximumFramesPerSecond: Number(row.maximum_frames_per_second),
      minimumInputsPerPoint: Number(row.minimum_inputs_per_point)
    }
  }
}

export const previousSubmission = async (
  client: SqlClient,
  playerId: string,
  gameId: string,
  leaderboardId: string,
  exceptRunId: string
): Promise<GameCenterSubmission | undefined> => {
  const row = await queryRow<PreviousRow>(
    client,
    `select submitted_score, duration_milliseconds, frame_count, input_count
     from runs
     where player_id = $1 and game_id = $2 and leaderboard_id = $3
       and submitted_at is not null and id <> $4
     order by submitted_at desc limit 1`,
    [playerId, gameId, leaderboardId, exceptRunId]
  )
  if (!row) return undefined
  return {
    score: Number(row.submitted_score),
    durationMilliseconds: Number(row.duration_milliseconds),
    frameCount: Number(row.frame_count),
    inputCount: Number(row.input_count)
  }
}

export const acceptRun = async (
  client: SqlClient,
  runId: string,
  playerId: string,
  claim: GameCenterRunClaim,
  score: number
): Promise<{ rank: number; total: number; improved: boolean }> => {
  const saved = await queryRow<{ player_id: string }>(
    client,
    `insert into scores (game_id, leaderboard_id, player_id, score, run_id)
     values ($1, $2, $3, $4, $5)
     on conflict (game_id, leaderboard_id, player_id) do update
       set score = excluded.score, run_id = excluded.run_id, achieved_at = now()
       where excluded.score > scores.score
     returning player_id`,
    [claim.gameId, claim.leaderboardId, playerId, score, runId]
  )

  const row = await queryRow<RankRow>(
    client,
    `select rank, total from (
       select rank() over (order by s.score desc, s.achieved_at asc) as rank,
              count(*) over () as total, s.player_id
       from scores s where s.game_id = $1 and s.leaderboard_id = $2
     ) ranked where player_id = $3`,
    [claim.gameId, claim.leaderboardId, playerId]
  )

  await client.query("update runs set outcome = 'accepted' where id = $1", [runId])
  if (!row) return { rank: 0, total: 0, improved: saved !== undefined }
  return { rank: Number(row.rank), total: Number(row.total), improved: saved !== undefined }
}

export const rejectRun = async (
  client: SqlClient,
  runId: string,
  playerId: string,
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission,
  reason: GameCenterRejectionReason,
  address: string
): Promise<void> => {
  await client.query("update runs set outcome = 'rejected' where id = $1", [runId])
  await client.query(
    `insert into score_rejections
       (run_id, player_id, game_id, leaderboard_id, reason,
        submitted_score, duration_milliseconds, frame_count, input_count, address)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      runId,
      playerId,
      claim.gameId,
      claim.leaderboardId,
      reason,
      submission.score,
      submission.durationMilliseconds,
      submission.frameCount,
      submission.inputCount,
      address
    ]
  )
}

export const recordReplay = async (
  client: SqlClient,
  runId: string,
  playerId: string,
  gameId: string,
  leaderboardId: string,
  reason: GameCenterRejectionReason,
  address: string
): Promise<void> => {
  await client.query(
    `insert into score_rejections (run_id, player_id, game_id, leaderboard_id, reason, address)
     values ($1, $2, $3, $4, $5, $6)`,
    [runId, playerId, gameId, leaderboardId, reason, address]
  )
}
