import { defineNotification } from 'Foundation'
import type { AVPlaybackStateValue, AVSessionStateValue, AVSystemSoundValue } from './AVFoundationTypes'

export const AVFoundationIdentifier = 'com.nos4.avfoundation'

export const AVAudioSessionDidChange = defineNotification<{
  state: AVSessionStateValue
}>('AVAudioSessionDidChangeStateNotification')

export const AVAudioPlayerDidChangeState = defineNotification<{
  state: AVPlaybackStateValue
  source: string
}>('AVAudioPlayerDidChangeStateNotification')

export const AVAudioPlayerDidFinish = defineNotification<{
  source: string
}>('AVPlayerItemDidPlayToEndTimeNotification')

export const AVSystemVolumeDidChange = defineNotification<{
  volume: number
}>('AVSystemController_SystemVolumeDidChangeNotification')

export const AVSystemSoundDidPlay = defineNotification<{
  sound: AVSystemSoundValue
}>('AVSystemSoundDidPlayNotification')
