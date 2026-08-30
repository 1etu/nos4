import { createEffect, createRoot, createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import {
  AVPlaybackState,
  avMakeAudioPlayer,
  avOutputVolume,
  avSetOutputVolume,
  type AVPlaybackStateValue
} from 'AVFoundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { mediaURL, shuffled, type MPMediaItem } from './MPMediaLibrary'
import {
  MPMusicPlayerControllerNowPlayingItemDidChange,
  MPMusicPlayerControllerPlaybackStateDidChange,
  MPMusicPlayerIdentifier
} from './MPMusicPlayerNotifications'

export type MPMusicPlaybackState = AVPlaybackStateValue

export type MPMusicRepeatMode = 'none' | 'one' | 'all'

const RepeatKey = 'ipod_repeat'
const ShuffleKey = 'ipod_shuffle'
const RewindThreshold = 5

const storedRepeat = NSUserDefaults.object<MPMusicRepeatMode>(RepeatKey)
const storedShuffle = NSUserDefaults.object<boolean>(ShuffleKey)

const [queue, setQueue] = createSignal<readonly MPMediaItem[]>([])
const [index, setIndex] = createSignal(0)
const [repeatMode, setRepeatMode] = createSignal<MPMusicRepeatMode>(storedRepeat ?? 'none')
const [shuffleMode, setShuffleMode] = createSignal(storedShuffle ?? false)

const engine = avMakeAudioPlayer()

export const playbackQueue = queue
export const playbackState = engine.state
export const playbackElapsed = engine.currentTime
export const playbackVolume = (): number => avOutputVolume() * 100
export const musicRepeatMode = repeatMode
export const musicShuffleMode = shuffleMode

export const nowPlayingItem = (): MPMediaItem | undefined => queue()[index()]

export const isPlaying = (): boolean => engine.state() === AVPlaybackState.playing

const trackDuration = (): number => {
  const reported = engine.duration()
  if (reported > 0) return reported
  return nowPlayingItem()?.playbackDuration ?? 0
}

const cue = (autoplay: boolean) => {
  const item = nowPlayingItem()
  if (!item) return
  engine.load(mediaURL(item.asset))
  if (autoplay) void engine.play()
}

const advance = () => {
  if (repeatMode() === 'one') {
    cue(true)
    return
  }
  if (index() < queue().length - 1) {
    setIndex(index() + 1)
    cue(true)
    return
  }
  if (repeatMode() === 'all') {
    setIndex(0)
    cue(true)
    return
  }
  engine.pause()
}

engine.onFinish(advance)

createRoot(() => {
  createEffect(() => engine.setVolume(avOutputVolume()))

  createEffect(() => {
    NSNotificationCenter.post(
      MPMusicPlayerControllerNowPlayingItemDidChange,
      MPMusicPlayerIdentifier,
      { item: nowPlayingItem() }
    )
  })

  createEffect(() => {
    NSNotificationCenter.post(
      MPMusicPlayerControllerPlaybackStateDidChange,
      MPMusicPlayerIdentifier,
      { state: engine.state() }
    )
  })
})

export const play = (): void => {
  if (queue().length === 0) return
  void engine.play()
}

export const pause = (): void => engine.pause()

export const togglePlayback = (): void => {
  if (isPlaying()) {
    pause()
    return
  }
  play()
}

export const setPlaybackQueue = (items: readonly MPMediaItem[]): void => {
  setQueue(shuffleMode() ? shuffled(items) : items)
  setIndex(0)
  cue(true)
}

export const skipToNextItem = (): void => {
  const wasPlaying = isPlaying()
  setIndex(index() >= queue().length - 1 ? 0 : index() + 1)
  cue(wasPlaying)
}

export const skipToBeginning = (): void => engine.seek(0)

export const skipToPreviousItem = (): void => {
  if (engine.currentTime() >= RewindThreshold || index() === 0) {
    skipToBeginning()
    return
  }
  const wasPlaying = isPlaying()
  setIndex(index() - 1)
  cue(wasPlaying)
}

export const seekTo = (seconds: number): void => engine.seek(seconds)

export const changeVolume = (value: number): void =>
  avSetOutputVolume(Math.min(Math.max(value, 0), 100) / 100)

export const cycleRepeatMode = (): void => {
  const next: MPMusicRepeatMode =
    repeatMode() === 'none' ? 'all' : repeatMode() === 'all' ? 'one' : 'none'
  setRepeatMode(next)
  NSUserDefaults.setObject(RepeatKey, next)
}

export const toggleShuffleMode = (): void => {
  const next = !shuffleMode()
  setShuffleMode(next)
  NSUserDefaults.setObject(ShuffleKey, next)
  const current = nowPlayingItem()
  if (!current) return
  const reordered = next ? shuffled(queue()) : queue()
  setQueue(reordered)
  setIndex(Math.max(0, reordered.findIndex((item) => item.id === current.id)))
}

export const remaining = (): number => trackDuration() - engine.currentTime()

export const progressRatio = (): number => {
  const total = trackDuration()
  if (total === 0) return 0
  return engine.currentTime() / total
}
