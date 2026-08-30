export const CELRecorderState = {
  stopped: 'stopped',
  recording: 'recording',
  paused: 'paused'
} as const

export type CELRecorderStateValue = (typeof CELRecorderState)[keyof typeof CELRecorderState]

export const CELAuthorizationStatus = {
  notDetermined: 'notDetermined',
  authorized: 'authorized',
  denied: 'denied',
  restricted: 'restricted'
} as const

export type CELAuthorizationStatusValue =
  (typeof CELAuthorizationStatus)[keyof typeof CELAuthorizationStatus]
