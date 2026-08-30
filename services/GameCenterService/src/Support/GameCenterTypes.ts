export const GameCenterErrors = {
  malformedBody: 'malformed_body',
  unsupportedMediaType: 'unsupported_media_type',
  bodyTooLarge: 'body_too_large',
  originNotAllowed: 'origin_not_allowed',
  notFound: 'not_found',
  methodNotAllowed: 'method_not_allowed',
  internalError: 'internal_error',
  rateLimited: 'rate_limited',
  weakPassword: 'weak_password',
  invalidCredentials: 'invalid_credentials',
  invalidSession: 'invalid_session',
  statusTooLong: 'status_too_long',
  aliasMissing: 'alias_missing',
  aliasShape: 'alias_shape',
  aliasReserved: 'alias_reserved',
  aliasRejected: 'alias_rejected',
  aliasTaken: 'alias_taken',
  gameNotFound: 'game_not_found',
  leaderboardNotFound: 'leaderboard_not_found',
  invalidPage: 'invalid_page',
  tooManyOpenRuns: 'too_many_open_runs',
  runNotFound: 'run_not_found',
  runAlreadySubmitted: 'run_already_submitted',
  runExpired: 'run_expired',
  scoreOutOfRange: 'score_out_of_range',
  scoreRejected: 'score_rejected'
} as const

export type GameCenterErrorCode = (typeof GameCenterErrors)[keyof typeof GameCenterErrors]

export const GameCenterRejections = {
  durationExceedsElapsed: 'duration_exceeds_elapsed',
  impossiblePace: 'impossible_pace',
  implausibleDuration: 'implausible_duration',
  implausibleFrameRate: 'implausible_frame_rate',
  implausibleInputs: 'implausible_inputs',
  duplicateSubmission: 'duplicate_submission',
  runReplay: 'run_replay'
} as const

export type GameCenterRejectionReason =
  (typeof GameCenterRejections)[keyof typeof GameCenterRejections]

export interface GameCenterConfiguration {
  readonly databaseUrl: string
  readonly allowedOrigins: readonly string[]
}

export interface GameCenterPlayer {
  readonly id: string
  readonly alias: string
  readonly status: string
  readonly createdAt: string
}

export interface GameCenterSession {
  readonly token: string
  readonly expiresAt: string
}

export interface GameCenterLeaderboard {
  readonly gameId: string
  readonly id: string
  readonly title: string
}

export interface GameCenterEntry {
  readonly rank: number
  readonly alias: string
  readonly score: number
  readonly achievedAt: string
}

export interface GameCenterRunPolicy {
  readonly minimumFirstPointSeconds: number
  readonly minimumSecondsPerPoint: number
  readonly minimumDurationMilliseconds: number
  readonly maximumDurationMilliseconds: number
  readonly minimumFramesPerSecond: number
  readonly maximumFramesPerSecond: number
  readonly minimumInputsPerPoint: number
}

export interface GameCenterRunClaim {
  readonly gameId: string
  readonly leaderboardId: string
  readonly openedAt: string
  readonly policy: GameCenterRunPolicy
}

export interface GameCenterSubmission {
  readonly score: number
  readonly durationMilliseconds: number
  readonly frameCount: number
  readonly inputCount: number
}

export interface GameCenterRequestContext {
  readonly address: string
  readonly origin: string | undefined
}
