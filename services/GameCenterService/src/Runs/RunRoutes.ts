import { errorReply, jsonReply, rateLimitedReply } from '../Http/HttpReply.ts'
import { isJsonRequest, readInteger, readJsonBody, readString } from '../Http/RequestBody.ts'
import {
  GameCenterErrors,
  GameCenterRejections,
  type GameCenterRequestContext,
  type GameCenterSubmission
} from '../Support/GameCenterTypes.ts'
import { GameCenterMetrics, GameCenterRateLimits } from '../Support/GameCenterMetrics.ts'
import { consumeRateLimit } from '../Database/RateLimitStore.ts'
import type { SqlClient } from '../Database/Connection.ts'
import { findLeaderboard } from '../Leaderboards/LeaderboardStore.ts'
import { plausibilityRejection } from './PlausibilityCheck.ts'
import {
  acceptRun,
  claimRun,
  countOpenRuns,
  findRun,
  openRun,
  previousSubmission,
  recordReplay,
  rejectRun
} from './RunStore.ts'

export const postRun = async (
  client: SqlClient,
  gameId: string,
  leaderboardId: string,
  playerId: string
): Promise<Response> => {
  const verdict = await consumeRateLimit(
    client,
    `run-open:${playerId}`,
    GameCenterRateLimits.runOpen.budget,
    GameCenterRateLimits.runOpen.windowSeconds
  )
  if (!verdict.allowed) return rateLimitedReply(verdict.retryAfterSeconds)

  const leaderboard = await findLeaderboard(client, gameId, leaderboardId)
  if (!leaderboard) return errorReply(404, GameCenterErrors.leaderboardNotFound)

  if ((await countOpenRuns(client, playerId)) >= GameCenterMetrics.maximumOpenRuns) {
    return errorReply(409, GameCenterErrors.tooManyOpenRuns)
  }

  const run = await openRun(client, playerId, gameId, leaderboardId)
  if (!run) return errorReply(500, GameCenterErrors.internalError)
  return jsonReply(201, { run })
}

export const postScore = async (
  client: SqlClient,
  request: Request,
  runId: string,
  playerId: string,
  context: GameCenterRequestContext
): Promise<Response> => {
  if (!isJsonRequest(request)) {
    return errorReply(415, GameCenterErrors.unsupportedMediaType)
  }

  const verdict = await consumeRateLimit(
    client,
    `score-submit:${playerId}`,
    GameCenterRateLimits.scoreSubmit.budget,
    GameCenterRateLimits.scoreSubmit.windowSeconds
  )
  if (!verdict.allowed) return rateLimitedReply(verdict.retryAfterSeconds)

  const body = await readJsonBody(request)
  if (!body.ok) {
    if (body.failure === 'oversize') return errorReply(413, GameCenterErrors.bodyTooLarge)
    return errorReply(400, GameCenterErrors.malformedBody)
  }

  const token = readString(body.value, 'token') ?? ''
  const score = readInteger(body.value, 'score')
  const durationMilliseconds = readInteger(body.value, 'durationMilliseconds')
  const frameCount = readInteger(body.value, 'frameCount')
  const inputCount = readInteger(body.value, 'inputCount')

  if (
    token === '' ||
    score === undefined ||
    durationMilliseconds === undefined ||
    frameCount === undefined ||
    inputCount === undefined
  ) {
    return errorReply(400, GameCenterErrors.malformedBody)
  }
  if (score < 0 || score > GameCenterMetrics.maximumSubmittableScore) {
    return errorReply(400, GameCenterErrors.scoreOutOfRange)
  }

  const submission: GameCenterSubmission = {
    score,
    durationMilliseconds,
    frameCount,
    inputCount
  }

  const claim = await claimRun(client, runId, token, playerId, submission)
  if (!claim) {
    const summary = await findRun(client, runId, playerId)
    if (!summary) return errorReply(404, GameCenterErrors.runNotFound)
    if (summary.expired) return errorReply(409, GameCenterErrors.runExpired)
    await recordReplay(
      client,
      runId,
      playerId,
      summary.gameId,
      summary.leaderboardId,
      GameCenterRejections.runReplay,
      context.address
    )
    return errorReply(409, GameCenterErrors.runAlreadySubmitted)
  }

  const previous = await previousSubmission(
    client,
    playerId,
    claim.gameId,
    claim.leaderboardId,
    runId
  )
  const rejection = plausibilityRejection(claim, submission, Date.now(), previous)
  if (rejection) {
    await rejectRun(client, runId, playerId, claim, submission, rejection, context.address)
    return errorReply(422, GameCenterErrors.scoreRejected)
  }

  const result = await acceptRun(client, runId, playerId, claim, score)
  return jsonReply(201, {
    entry: { rank: result.rank, score, improved: result.improved },
    total: result.total
  })
}
