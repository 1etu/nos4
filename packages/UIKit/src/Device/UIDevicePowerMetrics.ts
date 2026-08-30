export const UIDevicePowerMetrics = {
  screenOnHours: 7,
  standbyHours: 200,
  chargeHours: 2,
  sessionTimeScale: 12,
  tickMilliseconds: 5000,
  frozenLevel: 0.63
} as const

export const UIDeviceBatteryState = {
  unplugged: 'M_PWR_BAT_UNPLUGGED',
  charging: 'M_PWR_BAT_CHARGING',
  full: 'M_PWR_BAT_FULL'
} as const

export type UIDeviceBatteryStateValue =
  (typeof UIDeviceBatteryState)[keyof typeof UIDeviceBatteryState]
