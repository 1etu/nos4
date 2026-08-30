import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import type { CalendarEvent } from '../Support/CalendarStore'
import { CalendarEventRow } from './CalendarEventRow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CalendarEventList = (props: {
  events: readonly CalendarEvent[]
  onOpen: (event: CalendarEvent) => void
}) => (
  <div class="relative min-h-0 flex-1" style={{ background: CalendarPalette.list }}>
    <div
      class="pointer-events-none absolute inset-x-0 top-0"
      style={{
        height: `${CalendarMetrics.gridShadowHeight}px`,
        background: CalendarPalette.gridShadow
      }}
    />
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
        <For each={props.events}>
          {(event) => <CalendarEventRow event={event} onOpen={() => props.onOpen(event)} />}
        </For>
      </UIScrollView>
    </Show>
  </div>
)
