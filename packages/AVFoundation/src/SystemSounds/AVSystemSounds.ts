import { Sounds, type SoundName } from 'CoreGraphics'
import { NSNotificationCenter } from 'Foundation'
import { avAudioContext, avActivateSession, avSessionIsActive } from '../AudioSession/AVAudioSession'
import { avMakeAudioBuffer, avReadPCM } from '../AudioPlayer/AVAudioFile'
import { AVSystemSound, type AVSystemSoundValue } from '../Support/AVFoundationTypes'
import { AVFoundationIdentifier, AVSystemSoundDidPlay } from '../Support/AVFoundationNotifications'

interface AVSystemSoundEntry {
  readonly file: SoundName
  readonly gain: number
}

const entry = (file: SoundName, gain: number): AVSystemSoundEntry => ({ file, gain })

const Registry: Readonly<Record<AVSystemSoundValue, AVSystemSoundEntry>> = {
  M_SND_KEY_TOCK: entry('Tock', 3.513),
  M_SND_UNLOCK: entry('unlock', 1),
  M_SND_VIDEO_BEGIN: entry('begin_video_record', 0.255),
  M_SND_VIDEO_END: entry('end_video_record', 0.248),
  M_SND_DTMF_0: entry('dtmf_0', 0.228),
  M_SND_DTMF_1: entry('dtmf_1', 0.229),
  M_SND_DTMF_2: entry('dtmf_2', 0.228),
  M_SND_DTMF_3: entry('dtmf_3', 0.228),
  M_SND_DTMF_4: entry('dtmf_4', 0.23),
  M_SND_DTMF_5: entry('dtmf_5', 0.231),
  M_SND_DTMF_6: entry('dtmf_6', 0.227),
  M_SND_DTMF_7: entry('dtmf_7', 0.228),
  M_SND_DTMF_8: entry('dtmf_8', 0.23),
  M_SND_DTMF_9: entry('dtmf_9', 0.231),
  M_SND_DTMF_STAR: entry('dtmf_star', 0.228),
  M_SND_DTMF_POUND: entry('dtmf_pound', 0.227)
}

const buffers = new Map<AVSystemSoundValue, AudioBuffer>()
const failed = new Set<AVSystemSoundValue>()
const pending = new Set<AVSystemSoundValue>()

let effectsVolume = 1

export const avSystemSoundURL = (sound: AVSystemSoundValue): string =>
  `${import.meta.env.BASE_URL}${Sounds[Registry[sound].file]}`

const toBuffer = async (
  engine: BaseAudioContext,
  bytes: ArrayBuffer
): Promise<AudioBuffer | undefined> => {
  const pcm = avReadPCM(bytes)
  if (pcm) return avMakeAudioBuffer(engine, pcm)
  return engine.decodeAudioData(bytes)
}

const decode = async (sound: AVSystemSoundValue): Promise<void> => {
  const engine = avAudioContext()
  if (!engine) return
  try {
    const response = await fetch(avSystemSoundURL(sound))
    if (!response.ok) throw new Error(response.statusText)
    const buffer = await toBuffer(engine, await response.arrayBuffer())
    if (!buffer) throw new Error(sound)
    buffers.set(sound, buffer)
  } catch {
    failed.add(sound)
  } finally {
    pending.delete(sound)
  }
}

export const avPreloadSystemSound = (sound: AVSystemSoundValue): void => {
  if (buffers.has(sound) || failed.has(sound) || pending.has(sound)) return
  pending.add(sound)
  void decode(sound)
}

export const avPreloadSystemSounds = (): void => {
  for (const sound of Object.keys(Registry) as AVSystemSoundValue[]) {
    avPreloadSystemSound(sound)
  }
}

export const avSetEffectsVolume = (level: number): void => {
  effectsVolume = Math.min(Math.max(level, 0), 1)
}

export const avPlaySystemSound = (sound: AVSystemSoundValue, volume = 1): void => {
  const engine = avAudioContext()
  if (!engine || failed.has(sound)) return
  if (!avSessionIsActive()) void avActivateSession()

  const buffer = buffers.get(sound)
  if (!buffer) {
    avPreloadSystemSound(sound)
    return
  }

  const node = engine.createBufferSource()
  const gain = engine.createGain()
  node.buffer = buffer
  gain.gain.value = Math.min(Math.max(volume, 0), 1) * Registry[sound].gain * effectsVolume
  node.connect(gain)
  gain.connect(engine.destination)
  node.start()
  NSNotificationCenter.post(AVSystemSoundDidPlay, AVFoundationIdentifier, { sound })
}

export const AVSystemSoundRegistry = Registry
export { AVSystemSound }
