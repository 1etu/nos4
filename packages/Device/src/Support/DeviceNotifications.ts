import { defineNotification } from 'Foundation'

export const DeviceOrientation = {
  portrait: 'portrait',
  landscape: 'landscape'
} as const

export type DeviceOrientationValue =
  (typeof DeviceOrientation)[keyof typeof DeviceOrientation]

export const DeviceIdentifier = 'com.nos4.device'

export const DeviceHomeButtonPressed = defineNotification<{ count: number }>(
  'UIDeviceMenuButtonPressedNotification'
)
export const DeviceHomeButtonDoublePressed = defineNotification<{ count: number }>(
  'UIDeviceMenuButtonDoublePressedNotification'
)
export const DeviceLockButtonPressed = defineNotification<{ locked: boolean }>(
  'UIDeviceLockButtonPressedNotification'
)
export const DeviceOrientationDidChange = defineNotification<{
  orientation: DeviceOrientationValue
}>('UIDeviceOrientationDidChangeNotification')
