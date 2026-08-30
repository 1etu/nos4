import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { isSameDay, longDateLabel } from '../Support/CalendarDates'
import type { CalendarEvent } from '../Support/CalendarStore'
import { CalendarEventRow } from '../Events/CalendarEventRow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

interface CalendarSection {
  readonly day: Date
  readonly events: readonly CalendarEvent[]
}

const groupByDay = (events: readonly CalendarEvent[]): CalendarSection[] => {
  const sections: CalendarSection[] = []
  for (const event of events) {
    const day = new Date(event.start)
    const last = sections[sections.length - 1]
    if (last && isSameDay(last.day, day)) {
      sections[sections.length - 1] = { day: last.day, events: [...last.events, event] }
      continue
    }
    sections.push({ day, events: [event] })
  }
  return sections
}

export const CalendarListView = (props: {
  events: readonly CalendarEvent[]
  onOpen: (event: CalendarEvent) => void
}) => (
  <div class="min-h-0 flex-1" style={{ background: CalendarPalette.list }}>
    <Show
      when={props.events.length > 0}
      fallback={
        <div class="flex h-full w-full items-center justify-center">
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CalendarMetrics.emptyFontSize}px`,
              'font-weight': '700',
              color: CalendarPalette.empty
            }}
          >
            No Events
          </span>
        </div>
      }
    >
      <UIScrollView class="h-full w-full">
        <For each={groupByDay(props.events)}>
          {(section) => (
            <>
              <div
                class="flex shrink-0 items-center"
                style={{
                  height: `${CalendarMetrics.listHeaderHeight}px`,
                  padding: `0 ${CalendarMetrics.eventRowInsetX}px`,
                  background: CalendarPalette.header,
                  'border-bottom': `1px solid ${CalendarPalette.headerBorder}`
                }}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${CalendarMetrics.listHeaderFontSize}px`,
                    'font-weight': '700',
                    color: CalendarPalette.monthTitle,
                    'text-shadow': CalendarPalette.headerTextShadow
                  }}
                >
                  {longDateLabel(section.day)}
                </span>
              </div>
              <For each={section.events}>
                {(event) => <CalendarEventRow event={event} onOpen={() => props.onOpen(event)} />}
              </For>
            </>
          )}
        </For>
      </UIScrollView>
    </Show>
  </div>
)
