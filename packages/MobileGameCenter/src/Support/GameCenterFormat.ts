import { GKError, GKMetrics, type GKErrorValue, type GKLeaderboard } from 'GameKit'

const Locale = 'en-US'

const Messages: Readonly<Record<GKErrorValue, string>> = {
  [GKError.network]: 'Game Center is unavailable. Check your connection and try again.',
  [GKError.timeout]: 'The connection to Game Center timed out. Try again.',
  [GKError.invalidCredential]: 'That nickname or password was incorrect.',
  [GKError.weakPassword]: `Your password must be at least ${GKMetrics.passwordMinimumLength} characters.`,
  [GKError.aliasTaken]: 'That nickname is already taken. Choose another.',
  [GKError.aliasInvalid]: 'That nickname is unavailable. Choose another.',
  [GKError.notAuthenticated]: 'You are no longer signed in to Game Center.',
  [GKError.rateLimited]: 'Too many attempts. Wait a moment and try again.',
  [GKError.server]: 'Game Center is unavailable. Try again later.'
}

export const gkErrorMessage = (error: GKErrorValue): string => Messages[error]

export const gkRankLabel = (board: GKLeaderboard | undefined): string => {
  if (!board || board.localPlayerRank === null) return 'Not ranked yet'
  const rank = board.localPlayerRank.toLocaleString(Locale)
  return `#${rank} of ${board.playerCount.toLocaleString(Locale)}`
}

export const gkBestScoreLabel = (board: GKLeaderboard | undefined): string => {
  if (!board || board.localPlayerScore === null) return 'No score yet'
  return `Best ${board.localPlayerScore.toLocaleString(Locale)}`
}
