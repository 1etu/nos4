import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import {
  AVAudioSessionCategory,
  AVSessionState,
  type AVAudioSessionCategoryValue,
  type AVSessionStateValue
} from '../Support/AVFoundationTypes'
import {
  AVAudioSessionDidChange,
  AVFoundationIdentifier,
  AVSystemVolumeDidChange
} from '../Support/AVFoundationNotifications'

const GestureEvents = ['pointerdown', 'keydown', 'touchstart'] as const

export const AVVolumeStep = 1 / 16

const [state, setState] = createSignal<AVSessionStateValue>(AVSessionState.inactive)
const [category, setCategory] = createSignal<AVAudioSessionCategoryValue>(
  AVAudioSessionCategory.playback
)

const [outputVolume, setOutputVolume] = createSignal(0.7)

export const avOutputVolume = outputVolume

export const avSetOutputVolume = (level: number): void => {
  const next = Math.min(Math.max(level, 0), 1)
  if (outputVolume() === next) return
  setOutputVolume(next)
  NSNotificationCenter.post(AVSystemVolumeDidChange, AVFoundationIdentifier, { volume: next })
}

export const avAdjustOutputVolume = (steps: number): void =>
  avSetOutputVolume(
    Math.round((outputVolume() + steps * AVVolumeStep) / AVVolumeStep) * AVVolumeStep
  )

export const avSessionState = state
export const avSessionCategory = category

export const avSessionIsActive = (): boolean => state() === AVSessionState.active

let context: AudioContext | undefined
let listening = false

const publish = (next: AVSessionStateValue) => {
  if (state() === next) return
  setState(next)
  NSNotificationCenter.post(AVAudioSessionDidChange, AVFoundationIdentifier, { state: next })
}

const constructor = (): typeof AudioContext | undefined => {
  const scope = globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
  return scope.AudioContext ?? scope.webkitAudioContext
}

export const avAudioContext = (): AudioContext | undefined => {
  if (context) return context
  const Constructor = constructor()
  if (!Constructor) {
    publish(AVSessionState.unsupported)
    return undefined
  }
  context = new Constructor()
  return context
}

const currentState = (engine: AudioContext): AudioContextState => engine.state

export const avSetSessionCategory = (next: AVAudioSessionCategoryValue): void => {
  setCategory(next)
}

export const avActivateSession = async (): Promise<boolean> => {
  const engine = avAudioContext()
  if (!engine) return false
  if (engine.state === 'running') {
    publish(AVSessionState.active)
    return true
  }
  publish(AVSessionState.pending)
  try {
    await engine.resume()
  } catch {
    publish(AVSessionState.denied)
    return false
  }
  const running = currentState(engine) === 'running'
  publish(running ? AVSessionState.active : AVSessionState.denied)
  return running
}

export const avObserveUserGesture = (): void => {
  if (listening) return
  if (typeof window === 'undefined') return
  listening = true
  const unlock = () => {
    void avActivateSession().then((activated) => {
      if (!activated) return
      for (const event of GestureEvents) window.removeEventListener(event, unlock)
    })
  }
  for (const event of GestureEvents) window.addEventListener(event, unlock, { passive: true })
}
