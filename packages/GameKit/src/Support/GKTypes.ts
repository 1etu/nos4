export const GKAuthenticationState = {
  unauthenticated: 'unauthenticated',
  authenticating: 'authenticating',
  authenticated: 'authenticated'
} as const

export type GKAuthenticationStateValue =
  (typeof GKAuthenticationState)[keyof typeof GKAuthenticationState]

export const GKError = {
  network: 'network',
  timeout: 'timeout',
  invalidCredential: 'invalidCredential',
  weakPassword: 'weakPassword',
  aliasTaken: 'aliasTaken',
  aliasInvalid: 'aliasInvalid',
  notAuthenticated: 'notAuthenticated',
  rateLimited: 'rateLimited',
  server: 'server'
} as const

export type GKErrorValue = (typeof GKError)[keyof typeof GKError]

export type GKResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: GKErrorValue }

export interface GKPlayer {
  readonly playerId: string
  readonly alias: string
  readonly status: string
}

export interface GKScore {
  readonly rank: number
  readonly alias: string
  readonly value: number
}

export interface GKLeaderboard {
  readonly leaderboardId: string
  readonly title: string
  readonly playerCount: number
  readonly scores: readonly GKScore[]
  readonly localPlayerRank: number | null
  readonly localPlayerScore: number | null
}

export interface GKGameRun {
  readonly runId: string
  readonly token: string
  readonly seed: number
}
