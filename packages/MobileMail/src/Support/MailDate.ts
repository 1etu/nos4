const Day = 86400000

const weekday = (value: Date): string =>
  value.toLocaleDateString('en-US', { weekday: 'long' })

const clockTime = (value: Date): string =>
  value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const shortDate = (value: Date): string =>
  value.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })

const startOfDay = (value: Date): number =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

export const mailRelativeTime = (received: number): string => {
  const value = new Date(received)
  const today = startOfDay(new Date())
  const that = startOfDay(value)
  const daysAgo = Math.round((today - that) / Day)
  if (daysAgo <= 0) return clockTime(value)
  if (daysAgo === 1) return 'Yesterday'
  if (daysAgo <= 7) return weekday(value)
  return shortDate(value)
}

export const mailDetailDate = (received: number): string => {
  const value = new Date(received)
  const month = value.toLocaleDateString('en-US', { month: 'long' })
  return `${month}, ${value.getDate()}, ${value.getFullYear()} ${clockTime(value)}`
}

export const mailUpdatedLabel = (received: number): string => {
  const value = new Date(received)
  return `${shortDate(value)} ${clockTime(value)}`
}

export const mailSplitMeridiem = (
  label: string
): { readonly head: string; readonly meridiem: string } => {
  const match = /\s(AM|PM)$/.exec(label)
  if (!match) return { head: label, meridiem: '' }
  return { head: label.slice(0, match.index), meridiem: match[1] ?? '' }
}
