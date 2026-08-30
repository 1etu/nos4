import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { uiScreenSceneStaged } from '../Screen/UIScreen'
import {
  UIDeviceBatteryState,
  UIDevicePowerMetrics,
  type UIDeviceBatteryStateValue
} from './UIDevicePowerMetrics'
import {
  UIDeviceBatteryLevelDidChange,
  UIDeviceBatteryStateDidChange,
  UIDeviceIdentifier
} from './UIDeviceNotifications'

const BatteryKey = 'batteryLevel'
const HourMilliseconds = 3600 * 1000

interface StoredBattery {
  readonly level: number
  readonly at: number
}

const ratePerMillisecond = (hours: number, scale: number): number =>
  scale / (hours * HourMilliseconds)

const SessionScale = UIDevicePowerMetrics.sessionTimeScale
const ScreenOnRate = ratePerMillisecond(UIDevicePowerMetrics.screenOnHours, SessionScale)
const StandbyRate = ratePerMillisecond(UIDevicePowerMetrics.standbyHours, SessionScale)
const ChargeRate = ratePerMillisecond(UIDevicePowerMetrics.chargeHours, SessionScale)
const AwayRate = ratePerMillisecond(UIDevicePowerMetrics.standbyHours, 1)

const clamp = (value: number): number => Math.max(0, Math.min(1, value))

const restore = (): number => {
  if (uiScreenSceneStaged()) return UIDevicePowerMetrics.frozenLevel
  const stored = NSUserDefaults.object<StoredBattery>(BatteryKey)
  if (!stored || typeof stored.level !== 'number' || typeof stored.at !== 'number') return 1
  const away = Math.max(0, Date.now() - stored.at)
  return clamp(stored.level - away * AwayRate)
}

const [level, setLevel] = createSignal(restore())
const [state, setState] = createSignal<UIDeviceBatteryStateValue>(
  UIDeviceBatteryState.unplugged
)

export const uiDeviceBatteryLevel = level
export const uiDeviceBatteryState = state

let pluggedIn = false
let screenOn = true
let lastTick = 0
let timer: ReturnType<typeof setInterval> | undefined

const persist = () => {
  NSUserDefaults.setObject<StoredBattery>(BatteryKey, { level: level(), at: Date.now() })
}

const applyState = () => {
  const next = !pluggedIn
    ? UIDeviceBatteryState.unplugged
    : level() >= 1
      ? UIDeviceBatteryState.full
      : UIDeviceBatteryState.charging
  if (state() === next) return
  setState(next)
  NSNotificationCenter.post(UIDeviceBatteryStateDidChange, UIDeviceIdentifier, { state: next })
}

const applyLevel = (next: number) => {
  const clamped = clamp(next)
  if (Math.round(clamped * 100) !== Math.round(level() * 100)) {
    setLevel(clamped)
    NSNotificationCenter.post(UIDeviceBatteryLevelDidChange, UIDeviceIdentifier, {
      level: clamped
    })
    persist()
    applyState()
    return
  }
  setLevel(clamped)
  applyState()
}

const drainRate = (): number => {
  if (pluggedIn) return -ChargeRate
  return screenOn ? ScreenOnRate : StandbyRate
}

const tick = () => {
  const now = Date.now()
  const elapsed = Math.max(0, now - lastTick)
  lastTick = now
  if (uiScreenSceneStaged()) {
    applyLevel(UIDevicePowerMetrics.frozenLevel)
    return
  }
  applyLevel(level() - elapsed * drainRate())
}

export const uiDeviceSetBatteryMonitoringEnabled = (enabled: boolean): void => {
  if (!enabled) {
    if (!timer) return
    clearInterval(timer)
    timer = undefined
    persist()
    return
  }
  if (timer) return
  lastTick = Date.now()
  applyState()
  timer = setInterval(tick, UIDevicePowerMetrics.tickMilliseconds)
}

export const uiDeviceSetPluggedIn = (value: boolean): void => {
  if (pluggedIn === value) return
  tick()
  pluggedIn = value
  applyState()
}

export const uiDeviceIsPluggedIn = (): boolean => pluggedIn

export const uiDeviceSetScreenOn = (value: boolean): void => {
  if (screenOn === value) return
  tick()
  screenOn = value
}

export const uiDeviceCanPowerOn = (): boolean => level() > 0 || pluggedIn
