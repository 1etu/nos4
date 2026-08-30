import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

const ToneKey = 'clock_timer_tone'
const MinuteMs = 60000
const HourMs = 3600000

export const TimerTones: readonly string[] = [
  'Marimba',
  'Alarm',
  'Ascending',
  'Bark',
  'Bell Tower',
  'Blues',
  'Boing',
  'Crickets',
  'Digital',
  'Doorbell',
  'Duck',
  'Harp',
  'Motorcycle',
  'Old Car Horn',
  'Piano Riff',
  'Pinball',
  'Robot',
  'Sci-fi',
  'Sonar',
  'Strum',
  'Timba',
  'Trill',
  'Xylophone'
]

const [hours, setHours] = createSignal(0)
const [minutes, setMinutes] = createSignal(5)
const [deadline, setDeadline] = createSignal(0)
const [running, setRunning] = createSignal(false)
const [tone, setTone] = createSignal(NSUserDefaults.string(ToneKey) ?? 'Marimba')

export const timerHours = hours
export const timerMinutes = minutes
export const timerRunning = running
export const timerTone = tone

export const timerRemaining = (): number => Math.max(0, deadline() - Date.now())

export const timerDuration = (): number => hours() * HourMs + minutes() * MinuteMs

export const setTimerHours = (value: number): void => {
  setHours(value)
}

export const setTimerMinutes = (value: number): void => {
  setMinutes(value)
}

export const setTimerTone = (value: string): void => {
  setTone(value)
  NSUserDefaults.setString(ToneKey, value)
}

export const timerStart = (): void => {
  const span = timerDuration()
  if (span === 0) return
  setDeadline(Date.now() + span)
  setRunning(true)
}

export const timerCancel = (): void => {
  setRunning(false)
  setDeadline(0)
}
