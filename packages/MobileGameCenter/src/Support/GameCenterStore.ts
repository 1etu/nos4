import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface GameCenterFriend {
  readonly alias: string
  readonly status: string
  readonly played: string
}

const StatusKey = 'gamecenter_status'

const Friends: readonly GameCenterFriend[] = [
  { alias: 'giooo', status: 'Waiting for the free games. Lol might…', played: 'Played Today: Flight Control' },
  { alias: 'Chrisnathan', status: 'Twitter: Chrisnathan', played: 'Played Today: Real Racing' },
  { alias: 'dAdE1507', status: "A game center? Hope they don't plan…", played: 'Played Today: World Series of Poker…' },
  { alias: 'GiantBombing', status: 'So now what?', played: 'Played Today: WordsWorth' },
  { alias: 'jauger', status: 'No Status', played: 'Never Played' },
  { alias: 'TimReynolds', status: 'We need some games already!', played: 'Never Played' }
]

const [status, setStatus] = createSignal(NSUserDefaults.string(StatusKey) ?? '')

export const gameCenterStatus = status
export const gameCenterFriends = (): readonly GameCenterFriend[] => Friends

export const setGameCenterStatus = (value: string): void => {
  setStatus(value)
  NSUserDefaults.setString(StatusKey, value)
}
