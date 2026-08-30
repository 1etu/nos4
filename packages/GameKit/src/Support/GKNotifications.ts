import { defineNotification } from 'Foundation'

export const GameKitIdentifier = 'com.nos4.gamekit'

export const GKPlayerAuthenticationDidChange = defineNotification<{
  playerId: string | undefined
}>('GKPlayerAuthenticationDidChangeNotificationName')

export const GKScoreDidSubmit = defineNotification<{
  leaderboardId: string
  value: number
  rank: number
}>('GKScoreDidSubmitNotification')
