import { NSNotificationCenter } from 'Foundation'
import { GKGameIdentifier } from '../Support/GKMetrics'
import { gkRequest } from '../Support/GKService'
import { gkSessionToken } from '../Player/GKLocalPlayer'
import { GameKitIdentifier, GKScoreDidSubmit } from '../Support/GKNotifications'
import { GKError, type GKGameRun, type GKResult, type GKScore } from '../Support/GKTypes'

interface RunReply {
  readonly run: { id: string; token: string; seed: number }
}

interface ScoreReply {
  readonly entry: { rank: number; score: number; improved: boolean }
  readonly total: number
}

export const gkOpenRun = async (leaderboardId: string): Promise<GKGameRun | undefined> => {
  const token = gkSessionToken()
  if (!token) return undefined

  const reply = await gkRequest<RunReply>(
    'POST',
    `/games/${GKGameIdentifier}/leaderboards/${leaderboardId}/runs`,
    undefined,
    token
  )
  if (!reply.ok) return undefined
  return { runId: reply.value.run.id, token: reply.value.run.token, seed: reply.value.run.seed }
}

export const gkSubmitScore = async (
  run: GKGameRun,
  leaderboardId: string,
  value: number,
  durationMilliseconds: number,
  frameCount: number,
  inputCount: number
): Promise<GKResult<GKScore>> => {
  const token = gkSessionToken()
  if (!token) return { ok: false, error: GKError.notAuthenticated }

  const reply = await gkRequest<ScoreReply>(
    'POST',
    `/runs/${run.runId}/scores`,
    { token: run.token, score: value, durationMilliseconds, frameCount, inputCount },
    token
  )
  if (!reply.ok) return reply

  const score: GKScore = { rank: reply.value.entry.rank, alias: '', value }
  NSNotificationCenter.post(GKScoreDidSubmit, GameKitIdentifier, {
    leaderboardId,
    value,
    rank: score.rank
  })
  return { ok: true, value: score }
}
