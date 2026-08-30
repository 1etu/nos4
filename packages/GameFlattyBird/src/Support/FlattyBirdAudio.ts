import { Sounds, type SoundName } from 'CoreGraphics'
import { avActivateSession, avAudioContext, avSessionIsActive } from 'AVFoundation'

export const FlattyBirdSound = {
  die: 'sfx_die',
  hit: 'sfx_hit',
  point: 'sfx_point',
  swooshing: 'sfx_swooshing',
  wing: 'sfx_wing'
} as const

export type FlattyBirdSoundValue = (typeof FlattyBirdSound)[keyof typeof FlattyBirdSound]

const buffers = new Map<FlattyBirdSoundValue, AudioBuffer>()
const failed = new Set<FlattyBirdSoundValue>()

const sourceURL = (sound: FlattyBirdSoundValue): string =>
  `${import.meta.env.BASE_URL}${Sounds[sound as SoundName]}`

const decode = async (
  engine: BaseAudioContext,
  sound: FlattyBirdSoundValue
): Promise<void> => {
  try {
    const response = await fetch(sourceURL(sound))
    if (!response.ok) throw new Error(response.statusText)
    buffers.set(sound, await engine.decodeAudioData(await response.arrayBuffer()))
  } catch {
    failed.add(sound)
  }
}

export const flattyBirdLoadSounds = async (): Promise<void> => {
  const engine = avAudioContext()
  if (!engine) return
  const names = Object.values(FlattyBirdSound)
  await Promise.all(names.map((sound) => decode(engine, sound)))
}

export const flattyBirdPlaySound = (sound: FlattyBirdSoundValue): void => {
  const engine = avAudioContext()
  if (!engine || failed.has(sound)) return
  if (!avSessionIsActive()) void avActivateSession()

  const buffer = buffers.get(sound)
  if (!buffer) return

  const node = engine.createBufferSource()
  node.buffer = buffer
  node.connect(engine.destination)
  node.start()
}
