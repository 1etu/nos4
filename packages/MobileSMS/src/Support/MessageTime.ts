const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const Weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DayMs = 86400000
const WeekDays = 7
const NoonHour = 12

const pad = (value: number): string => (value < 10 ? `0${value}` : String(value))

const hour12 = (hours: number): number => {
  const wrapped = hours % NoonHour
  return wrapped === 0 ? NoonHour : wrapped
}

const meridiem = (hours: number): string => (hours < NoonHour ? 'AM' : 'PM')

const clock = (date: Date): string =>
  `${hour12(date.getHours())}:${pad(date.getMinutes())} ${meridiem(date.getHours())}`

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

export const smsStamp = (sent: number): string => {
  const date = new Date(sent)
  return `${Months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${clock(date)}`
}

export const smsListStamp = (sent: number, now: Date): string => {
  const date = new Date(sent)
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DayMs)
  if (days === 0) return clock(date)
  if (days < WeekDays) return Weekdays[date.getDay()] ?? ''
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(2)}`
}
