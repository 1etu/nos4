import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { avResolveSource } from './AVAudioFormat'
import { avActivateSession, avAudioContext } from '../AudioSession/AVAudioSession'
import { AVPlaybackState, type AVPlaybackStateValue } from '../Support/AVFoundationTypes'
import {
  AVAudioPlayerDidChangeState,
  AVAudioPlayerDidFinish,
  AVFoundationIdentifier
} from '../Support/AVFoundationNotifications'

export interface AVAudioPlayer {
  readonly state: () => AVPlaybackStateValue
  readonly currentTime: () => number
  readonly duration: () => number
  readonly load: (source: string) => void
  readonly play: () => Promise<void>
  readonly pause: () => void
  readonly seek: (seconds: number) => void
  readonly setVolume: (level: number) => void
  readonly onFinish: (handler: () => void) => void
  readonly dispose: () => void
}

export const avMakeAudioPlayer = (): AVAudioPlayer => {
  const [state, setState] = createSignal<AVPlaybackStateValue>(AVPlaybackState.stopped)
  const [currentTime, setCurrentTime] = createSignal(0)
  const [duration, setDuration] = createSignal(0)

  let element: HTMLAudioElement | undefined
  let route: MediaElementAudioSourceNode | undefined
  let gain: GainNode | undefined
  let source = ''
  let finish: (() => void) | undefined
  let volume = 1

  const publish = (next: AVPlaybackStateValue) => {
    if (state() === next) return
    setState(next)
    NSNotificationCenter.post(AVAudioPlayerDidChangeState, AVFoundationIdentifier, {
      state: next,
      source
    })
  }

  const connect = (media: HTMLAudioElement) => {
    const engine = avAudioContext()
    if (!engine || route) return
    route = engine.createMediaElementSource(media)
    gain = engine.createGain()
    gain.gain.value = volume
    route.connect(gain)
    gain.connect(engine.destination)
  }

  const media = (): HTMLAudioElement | undefined => {
    if (typeof Audio === 'undefined') return undefined
    if (element) return element
    element = new Audio()
    element.preload = 'auto'
    element.crossOrigin = 'anonymous'
    element.addEventListener('timeupdate', () => setCurrentTime(element?.currentTime ?? 0))
    element.addEventListener('durationchange', () => {
      const value = element?.duration ?? 0
      setDuration(Number.isFinite(value) ? value : 0)
    })
    element.addEventListener('waiting', () => publish(AVPlaybackState.loading))
    element.addEventListener('playing', () => publish(AVPlaybackState.playing))
    element.addEventListener('pause', () => {
      if (state() === AVPlaybackState.stopped) return
      publish(AVPlaybackState.paused)
    })
    element.addEventListener('ended', () => {
      publish(AVPlaybackState.stopped)
      NSNotificationCenter.post(AVAudioPlayerDidFinish, AVFoundationIdentifier, { source })
      finish?.()
    })
    element.addEventListener('error', () => {
      const code = element?.error?.code
      publish(
        code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
          ? AVPlaybackState.missing
          : AVPlaybackState.failed
      )
    })
    return element
  }

  return {
    state,
    currentTime,
    duration,

    load(next: string) {
      const player = media()
      if (!player) return
      const resolved = avResolveSource(next)
      if (source === resolved) {
        player.currentTime = 0
        return
      }
      source = resolved
      setCurrentTime(0)
      setDuration(0)
      publish(AVPlaybackState.loading)
      player.src = resolved
      player.load()
    },

    async play() {
      const player = media()
      if (!player || !player.src) return
      await avActivateSession()
      connect(player)
      try {
        await player.play()
        publish(AVPlaybackState.playing)
      } catch {
        publish(AVPlaybackState.blocked)
      }
    },

    pause() {
      element?.pause()
      publish(AVPlaybackState.paused)
    },

    seek(seconds: number) {
      const player = element
      if (!player || !player.src) return
      player.currentTime = Math.max(0, seconds)
      setCurrentTime(player.currentTime)
    },

    setVolume(level: number) {
      volume = Math.min(Math.max(level, 0), 1)
      if (gain) {
        gain.gain.value = volume
        return
      }
      if (element) element.volume = volume
    },

    onFinish(handler: () => void) {
      finish = handler
    },

    dispose() {
      element?.pause()
      route?.disconnect()
      gain?.disconnect()
      element = undefined
      route = undefined
      gain = undefined
      publish(AVPlaybackState.stopped)
    }
  }
}
