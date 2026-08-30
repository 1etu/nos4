import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'
import { addDays, isSameDay, startOfDay } from './CalendarDates'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly location: string
  readonly start: number
  readonly end: number
  readonly allDay: boolean
}

const StorageKey = 'calendar_events'

const [events, setEvents] = createSignal<CalendarEvent[]>(
  NSUserDefaults.object<CalendarEvent[]>(StorageKey) ?? []
)

export const calendarEvents = events

const persist = (next: CalendarEvent[]): void => {
  const ordered = [...next].sort((a, b) => a.start - b.start)
  setEvents(ordered)
  NSUserDefaults.setObject(StorageKey, ordered)
}

export const saveCalendarEvent = (event: CalendarEvent): void => {
  persist([...events().filter((entry) => entry.id !== event.id), event])
}

export const removeCalendarEvent = (id: string): void => {
  persist(events().filter((entry) => entry.id !== id))
}

export const newEventId = (): string => `event-${Date.now()}`

export const eventsOnDay = (date: Date): CalendarEvent[] => {
  const from = startOfDay(date).getTime()
  const to = addDays(date, 1).getTime()
  return events().filter((entry) => entry.start < to && entry.end > from)
}

export const dayHasEvents = (date: Date): boolean => eventsOnDay(date).length > 0

export const upcomingEvents = (from: Date): CalendarEvent[] => {
  const floor = startOfDay(from).getTime()
  return events().filter((entry) => entry.end >= floor)
}

export const eventStartsOn = (event: CalendarEvent, date: Date): boolean =>
  isSameDay(new Date(event.start), date)
