import { createSignal, Match, Show, Switch } from 'solid-js'
import { UIBarButton, UINavigationBar, UIStatusBar } from 'UIKit'
import { CalendarToolBar, type CalendarMode } from '../Chrome/CalendarToolBar'
import { CalendarsView } from '../Calendars/CalendarsView'
import { CalendarDayView } from '../Day/CalendarDayView'
import { CalendarListView } from '../List/CalendarListView'
import { CalendarMonthView } from '../Month/CalendarMonthView'
import { CalendarEventEditor } from '../Events/CalendarEventEditor'
import { CalendarMetrics } from '../Support/CalendarMetrics'
import { addMonths, startOfDay } from '../Support/CalendarDates'
import {
  eventsOnDay,
  newEventId,
  removeCalendarEvent,
  saveCalendarEvent,
  upcomingEvents,
  type CalendarEvent
} from '../Support/CalendarStore'

const HourStart = 9
const DefaultSpanHours = 1

const draftFor = (day: Date): CalendarEvent => {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), HourStart)
  return {
    id: newEventId(),
    title: '',
    location: '',
    start: start.getTime(),
    end: start.getTime() + DefaultSpanHours * 3600000,
    allDay: false
  }
}

export const CalendarApp = (props: { width: number }) => {
  const today = startOfDay(new Date())
  const [selected, setSelected] = createSignal(today)
  const [month, setMonth] = createSignal(new Date(today.getFullYear(), today.getMonth(), 1))
  const [mode, setMode] = createSignal<CalendarMode>('Month')
  const [calendars, setCalendars] = createSignal(false)
  const [draft, setDraft] = createSignal<CalendarEvent | undefined>()
  const [editing, setEditing] = createSignal(false)

  const chooseDay = (date: Date) => {
    setSelected(date)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  const goToday = () => {
    chooseDay(today)
    setMode('Month')
  }

  const compose = () => {
    setDraft(draftFor(selected()))
    setEditing(false)
  }

  const open = (event: CalendarEvent) => {
    setDraft(event)
    setEditing(true)
  }

  const save = () => {
    const entry = draft()
    if (!entry) return
    saveCalendarEvent(entry.title === '' ? { ...entry, title: 'New Event' } : entry)
    setDraft(undefined)
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar style="inApp" />

      <div class="relative flex min-h-0 flex-1 flex-col">
        <UINavigationBar
          title="All Calendars"
          leading={<UIBarButton title="Calendars" tone="gray" onClick={() => setCalendars(true)} />}
          trailing={<UIBarButton title="+" tone="gray" onClick={compose} />}
        />

        <Switch>
          <Match when={mode() === 'Month'}>
            <CalendarMonthView
              month={month()}
              selected={selected()}
              today={today}
              events={eventsOnDay(selected())}
              onSelect={chooseDay}
              onShiftMonth={(delta) => setMonth(addMonths(month(), delta))}
              onOpen={open}
            />
          </Match>
          <Match when={mode() === 'Day'}>
            <CalendarDayView
              day={selected()}
              events={eventsOnDay(selected())}
              onSelectDay={chooseDay}
              onOpen={open}
            />
          </Match>
          <Match when={mode() === 'List'}>
            <CalendarListView events={upcomingEvents(today)} onOpen={open} />
          </Match>
        </Switch>

        <CalendarToolBar
          mode={mode()}
          onToday={goToday}
          onSelectMode={setMode}
          onInbox={compose}
        />
      </div>

      <Show when={calendars()}>
        <div class="absolute inset-0" style={{ top: `${CalendarMetrics.statusBarHeight}px` }}>
          <CalendarsView onDone={() => setCalendars(false)} />
        </div>
      </Show>

      <Show when={draft()}>
        {(entry) => (
          <div class="absolute inset-0" style={{ top: `${CalendarMetrics.statusBarHeight}px` }}>
            <CalendarEventEditor
              draft={entry()}
              editing={editing()}
              today={today}
              width={props.width}
              onChange={setDraft}
              onSave={save}
              onDelete={() => {
                removeCalendarEvent(entry().id)
                setDraft(undefined)
              }}
              onCancel={() => setDraft(undefined)}
            />
          </div>
        )}
      </Show>
    </div>
  )
}
