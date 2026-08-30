import { Show } from 'solid-js'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { clockLabel, meridiem } from '../Support/CalendarDates'
import type { CalendarEvent } from '../Support/CalendarStore'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const clipped = {
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
} as const

export const CalendarEventRow = (props: { event: CalendarEvent; onOpen: () => void }) => {
  const start = () => new Date(props.event.start)

  return (
    <button
      type="button"
      class="flex w-full shrink-0 items-center"
      style={{
        height: `${CalendarMetrics.eventRowHeight}px`,
        padding: `0 ${CalendarMetrics.eventRowInsetX}px`,
        background: CalendarPalette.list,
        'border-bottom': `1px solid ${CalendarPalette.listSeparator}`
      }}
      onClick={props.onOpen}
    >
      <div
        class="shrink-0"
        style={{
          width: `${CalendarMetrics.eventDotSize}px`,
          height: `${CalendarMetrics.eventDotSize}px`,
          'border-radius': '50%',
          background: CalendarPalette.eventSwatch
        }}
      />

      <div
        class="flex shrink-0 items-baseline justify-end"
        style={{
          width: `${CalendarMetrics.eventTimeWidth}px`,
          gap: `${CalendarMetrics.eventTextGap}px`,
          'padding-right': `${CalendarMetrics.eventRowInsetX}px`
        }}
      >
        <Show
          when={!props.event.allDay}
          fallback={
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${CalendarMetrics.eventMeridiemFontSize}px`,
                'font-weight': '700',
                color: CalendarPalette.eventTime
              }}
            >
              all-day
            </span>
          }
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CalendarMetrics.eventTimeFontSize}px`,
              'font-weight': '700',
              color: CalendarPalette.eventTime
            }}
          >
            {clockLabel(start())}
          </span>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CalendarMetrics.eventMeridiemFontSize}px`,
              'font-weight': '700',
              color: CalendarPalette.eventLocation
            }}
          >
            {meridiem(start().getHours())}
          </span>
        </Show>
      </div>

      <div class="flex min-w-0 flex-1 flex-col items-start" style={{ gap: `${CalendarMetrics.eventTextGap}px` }}>
        <span
          class="w-full text-left"
          style={{
            ...clipped,
            'font-family': HelveticaNeue,
            'font-size': `${CalendarMetrics.eventTitleFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: CalendarPalette.eventTitle
          }}
        >
          {props.event.title}
        </span>
        <Show when={props.event.location !== ''}>
          <span
            class="w-full text-left"
            style={{
              ...clipped,
              'font-family': HelveticaNeue,
              'font-size': `${CalendarMetrics.eventLocationFontSize}px`,
              'line-height': '1',
              color: CalendarPalette.eventLocation
            }}
          >
            {props.event.location}
          </span>
        </Show>
      </div>
    </button>
  )
}
