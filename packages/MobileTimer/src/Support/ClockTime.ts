export interface ClockReading {
  readonly hours: number
  readonly minutes: number
  readonly seconds: number
}

const timeFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

const timeFormatter = (zone: string): Intl.DateTimeFormat => {
  const existing = timeFormatters.get(zone)
  if (existing) return existing
  const created = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  timeFormatters.set(zone, created)
  return created
}

const dateFormatter = (zone: string): Intl.DateTimeFormat => {
  const existing = dateFormatters.get(zone)
  if (existing) return existing
  const created = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  dateFormatters.set(zone, created)
  return created
}

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const clockReading = (zone: string, now: Date): ClockReading => {
  const parts = timeFormatter(zone).formatToParts(now)
  const value = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  return { hours: value('hour') % 24, minutes: value('minute'), seconds: value('second') }
}

export const clockDayLabel = (zone: string, now: Date): string => {
  const there = dateFormatter(zone).format(now)
  const here = dateFormatter(localZone).format(now)
  if (there === here) return 'Today'
  return there > here ? 'Tomorrow' : 'Yesterday'
}

export const clockIsDaylight = (reading: ClockReading): boolean =>
  reading.hours >= 6 && reading.hours < 18

export const clockMeridiem = (hours: number): string => (hours < 12 ? 'AM' : 'PM')

export const clockHour12 = (hours: number): number => {
  const wrapped = hours % 12
  return wrapped === 0 ? 12 : wrapped
}

export const clockPad = (value: number): string => (value < 10 ? `0${value}` : String(value))

export const clockTimeText = (reading: ClockReading): string =>
  `${clockHour12(reading.hours)}:${clockPad(reading.minutes)}`

export const stopwatchText = (elapsed: number): string => {
  const tenths = Math.floor(elapsed / 100) % 10
  const seconds = Math.floor(elapsed / 1000) % 60
  const minutes = Math.floor(elapsed / 60000) % 60
  const hours = Math.floor(elapsed / 3600000)
  const head = hours > 0 ? `${clockPad(hours)}:` : ''
  return `${head}${clockPad(minutes)}:${clockPad(seconds)}.${tenths}`
}

export const countdownText = (remaining: number): string => {
  const total = Math.ceil(remaining / 1000)
  const seconds = total % 60
  const minutes = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3600)
  return `${clockPad(hours)}:${clockPad(minutes)}:${clockPad(seconds)}`
}
