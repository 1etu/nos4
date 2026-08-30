const DevelopmentOrigin = 'http://127.0.0.1:5175'
const ProductionOrigin = 'https://api.nos4.fun'
const DefaultOrigin = import.meta.env.DEV ? DevelopmentOrigin : ProductionOrigin

export const GKServiceOrigin = import.meta.env.VITE_GAMECENTER_ORIGIN ?? DefaultOrigin

export const GKMetrics = {
  requestTimeoutMilliseconds: 8000,
  passwordMinimumLength: 8,
  aliasMinimumLength: 3,
  aliasMaximumLength: 15,
  leaderboardPageSize: 25
} as const

export const GKGameIdentifier = 'flattybird'
export const GKHighScoreLeaderboard = 'high-score'
