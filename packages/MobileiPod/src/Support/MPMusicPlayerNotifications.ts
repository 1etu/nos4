import { defineNotification } from 'Foundation'
import type { MPMediaItem } from './MPMediaLibrary'
import type { MPMusicPlaybackState } from './MPMusicPlayerController'

export const MPMusicPlayerIdentifier = 'com.nos4.mobilemusicplayer'

export const MPMusicPlayerControllerNowPlayingItemDidChange = defineNotification<{
  item: MPMediaItem | undefined
}>('MPMusicPlayerControllerNowPlayingItemDidChangeNotification')

export const MPMusicPlayerControllerPlaybackStateDidChange = defineNotification<{
  state: MPMusicPlaybackState
}>('MPMusicPlayerControllerPlaybackStateDidChangeNotification')
