import { GameCenterMetrics } from '../Support/GameCenterMetrics.ts'
import {
  GameCenterRejections,
  type GameCenterRejectionReason,
  type GameCenterRunClaim,
  type GameCenterSubmission
} from '../Support/GameCenterTypes.ts'

const MillisecondsPerSecond = 1000

const exceedsElapsed = (
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission,
  nowMilliseconds: number
): boolean => {
  const elapsed = nowMilliseconds - Date.parse(claim.openedAt)
  return submission.durationMilliseconds > elapsed + GameCenterMetrics.clockToleranceMilliseconds
}

const beatsPaceFloor = (claim: GameCenterRunClaim, submission: GameCenterSubmission): boolean => {
  if (submission.score < 1) return false
  const seconds = submission.durationMilliseconds / MillisecondsPerSecond
  const floor =
    claim.policy.minimumFirstPointSeconds +
    (submission.score - 1) * claim.policy.minimumSecondsPerPoint
  return seconds < floor
}

const outsideDurationBounds = (
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission
): boolean =>
  submission.durationMilliseconds < claim.policy.minimumDurationMilliseconds ||
  submission.durationMilliseconds > claim.policy.maximumDurationMilliseconds

const outsideFrameRate = (
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission
): boolean => {
  const seconds = submission.durationMilliseconds / MillisecondsPerSecond
  const rate = submission.frameCount / seconds
  return rate < claim.policy.minimumFramesPerSecond || rate > claim.policy.maximumFramesPerSecond
}

const inconsistentInputs = (
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission
): boolean =>
  submission.inputCount < submission.score * claim.policy.minimumInputsPerPoint ||
  submission.inputCount > submission.frameCount

const repeatsSubmission = (
  submission: GameCenterSubmission,
  previous: GameCenterSubmission | undefined
): boolean =>
  previous !== undefined &&
  previous.score === submission.score &&
  previous.durationMilliseconds === submission.durationMilliseconds &&
  previous.frameCount === submission.frameCount &&
  previous.inputCount === submission.inputCount

export const plausibilityRejection = (
  claim: GameCenterRunClaim,
  submission: GameCenterSubmission,
  nowMilliseconds: number,
  previous: GameCenterSubmission | undefined
): GameCenterRejectionReason | undefined => {
  if (exceedsElapsed(claim, submission, nowMilliseconds)) {
    return GameCenterRejections.durationExceedsElapsed
  }
  if (beatsPaceFloor(claim, submission)) return GameCenterRejections.impossiblePace
  if (outsideDurationBounds(claim, submission)) return GameCenterRejections.implausibleDuration
  if (outsideFrameRate(claim, submission)) return GameCenterRejections.implausibleFrameRate
  if (inconsistentInputs(claim, submission)) return GameCenterRejections.implausibleInputs
  if (repeatsSubmission(submission, previous)) return GameCenterRejections.duplicateSubmission
  return undefined
}
