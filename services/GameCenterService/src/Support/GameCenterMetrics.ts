export const GameCenterMetrics = {
  maximumRequestBodyBytes: 4096,

  passwordMinimumLength: 8,
  passwordMaximumLength: 128,
  passwordIterations: 210000,
  passwordSaltBytes: 16,
  passwordKeyBits: 256,

  sessionTokenBytes: 32,
  sessionLifetimeSeconds: 2592000,
  sessionRenewalThresholdSeconds: 604800,

  statusMaximumLength: 90,

  aliasMinimumLength: 3,
  aliasMaximumLength: 15,

  leaderboardPageSize: 25,
  leaderboardMaximumPageSize: 100,
  leaderboardMaximumOffset: 10000,
  leaderboardDefaultRadius: 5,
  leaderboardMaximumRadius: 25,

  runTokenBytes: 32,
  runTokenLifetimeSeconds: 600,
  runSeedBits: 31,
  maximumOpenRuns: 8,
  maximumSubmittableScore: 100000,
  clockToleranceMilliseconds: 2000,

  corsMaximumAgeSeconds: 86400,
  defaultPort: 5175,
  developmentOriginFirstPort: 5173,
  developmentOriginPortCount: 8
} as const

export const GameCenterRateLimits = {
  request: { budget: 600, windowSeconds: 60 },
  signup: { budget: 5, windowSeconds: 3600 },
  signInAddress: { budget: 20, windowSeconds: 300 },
  signInAccount: { budget: 10, windowSeconds: 900 },
  aliasCheck: { budget: 60, windowSeconds: 60 },
  runOpen: { budget: 60, windowSeconds: 3600 },
  scoreSubmit: { budget: 60, windowSeconds: 3600 }
} as const
