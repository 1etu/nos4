import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface ClockAlarm {
  readonly id: string
  readonly hours: number
  readonly minutes: number
  readonly repeat: string
  readonly label: string
  readonly enabled: boolean
}

const StorageKey = 'clock_alarms'

const Defaults: readonly ClockAlarm[] = [
  { id: 'weekdays', hours: 8, minutes: 30, repeat: 'Weekdays', label: 'Alarm', enabled: false },
  { id: 'weekends', hours: 9, minutes: 0, repeat: 'Weekends', label: 'Alarm', enabled: true }
]

const [alarms, setAlarms] = createSignal<ClockAlarm[]>(
  NSUserDefaults.object<ClockAlarm[]>(StorageKey) ?? [...Defaults]
)

export const clockAlarms = alarms

const persist = (next: ClockAlarm[]): void => {
  setAlarms(next)
  NSUserDefaults.setObject(StorageKey, next)
}

export const addAlarm = (hours: number, minutes: number, repeat: string): void => {
  persist([
    ...alarms(),
    { id: `alarm-${Date.now()}`, hours, minutes, repeat, label: 'Alarm', enabled: true }
  ])
}

export const removeAlarm = (id: string): void => {
  persist(alarms().filter((alarm) => alarm.id !== id))
}

export const setAlarmEnabled = (id: string, enabled: boolean): void => {
  persist(alarms().map((alarm) => (alarm.id === id ? { ...alarm, enabled } : alarm)))
}
