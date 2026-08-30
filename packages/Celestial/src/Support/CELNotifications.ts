import { defineNotification } from 'Foundation'
import type { CELAuthorizationStatusValue, CELRecorderStateValue } from './CELTypes'

export const CelestialIdentifier = 'com.nos4.celestial'

export const CELRecorderDidChangeState = defineNotification<{
  state: CELRecorderStateValue
}>('CELRecorderDidChangeStateNotification')

export const CELRecorderDidFinish = defineNotification<{
  duration: number
}>('CELRecorderDidFinishNotification')

export const CELMicrophoneAccessDidChange = defineNotification<{
  status: CELAuthorizationStatusValue
}>('CELMicrophoneAccessDidChangeNotification')
