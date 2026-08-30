import { defineNotification } from 'Foundation'
import type { UIDeviceBatteryStateValue } from './UIDevicePowerMetrics'

export const UIDeviceIdentifier = 'com.nos4.uidevice'

export const UIDeviceBatteryLevelDidChange = defineNotification<{ level: number }>(
  'UIDeviceBatteryLevelDidChangeNotification'
)

export const UIDeviceBatteryStateDidChange = defineNotification<{
  state: UIDeviceBatteryStateValue
}>('UIDeviceBatteryStateDidChangeNotification')
