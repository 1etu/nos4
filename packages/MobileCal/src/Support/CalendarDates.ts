const DaysInWeek = 7
const MinuteMs = 60000
const HourMs = 3600000
const DayMs = 86400000
const NoonHour = 12

const Weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WeekdayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]
const Months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const MonthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export interface CalendarCell {
  readonly date: Date
  readonly inMonth: boolean
}

export const CalendarWeekdays: readonly string[] = Weekdays

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

export const addMonths = (date: Date, months: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + months, 1)

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

export const calendarGrid = (month: Date): CalendarCell[] => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  const span = Math.ceil((last.getDate() + first.getDay()) / DaysInWeek) * DaysInWeek
  return Array.from({ length: span }, (_, index) => {
    const date = addDays(start, index)
    return { date, inMonth: date.getMonth() === month.getMonth() }
  })
}

export const calendarWeeks = (month: Date): number => calendarGrid(month).length / DaysInWeek

export const monthTitle = (month: Date): string =>
  `${Months[month.getMonth()]} ${month.getFullYear()}`

export const weekdayName = (date: Date): string => WeekdayNames[date.getDay()] ?? ''

export const shortDateTitle = (date: Date): string =>
  `${MonthsShort[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`

export const hour12 = (hours: number): number => {
  const wrapped = hours % NoonHour
  return wrapped === 0 ? NoonHour : wrapped
}

export const meridiem = (hours: number): string => (hours < NoonHour ? 'AM' : 'PM')

export const pad = (value: number): string => (value < 10 ? `0${value}` : String(value))

export const hourLabel = (hours: number): string => {
  if (hours === 0) return 'Midnight'
  if (hours === NoonHour) return 'Noon'
  return `${hour12(hours)} ${meridiem(hours)}`
}

export const clockLabel = (date: Date): string =>
  `${hour12(date.getHours())}:${pad(date.getMinutes())}`

export const pickerDateLabel = (date: Date, today: Date): string => {
  if (isSameDay(date, today)) return 'Today'
  return `${Weekdays[date.getDay()]} ${MonthsShort[date.getMonth()]} ${date.getDate()}`
}

export const longDateLabel = (date: Date): string =>
  `${Weekdays[date.getDay()]}, ${MonthsShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

export const minutesOfDay = (date: Date): number => date.getHours() * 60 + date.getMinutes()

export const CalendarSpans = { minute: MinuteMs, hour: HourMs, day: DayMs } as const
