import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import {
  addDays,
  CalendarSpans,
  hourLabel,
  shortDateTitle,
  startOfDay,
  weekdayName
} from '../Support/CalendarDates'
import type { CalendarEvent } from '../Support/CalendarStore'
import { CalendarArrow } from '../Month/CalendarArrow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Hours = Array.from({ length: 24 }, (_, index) => index)
const MinutesPerHour = 60

const clipped = {
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
} as const

const EventBlock = (props: { event: CalendarEvent; day: Date; onOpen: () => void }) => {
  const dayStart = () => startOfDay(props.day).getTime()
  const minutesFromStart = (value: number) =>
    (value - dayStart()) / CalendarSpans.minute / MinutesPerHour
  const top = () => Math.max(0, minutesFromStart(props.event.start)) * CalendarMetrics.hourRowHeight
  const bottom = () =>
    Math.min(minutesFromStart(props.event.end), Hours.length) * CalendarMetrics.hourRowHeight

  return (
    <button
      type="button"
      class="absolute flex flex-col items-start overflow-hidden text-left"
      style={{
        top: `${top()}px`,
        height: `${Math.max(CalendarMetrics.blockMinHeight, bottom() - top())}px`,
        left: `${CalendarMetrics.hourLabelWidth + CalendarMetrics.blockInsetX}px`,
        right: `${CalendarMetrics.blockInsetX}px`,
        padding: `${CalendarMetrics.blockPaddingY}px ${CalendarMetrics.blockPaddingX}px`,
        'border-radius': `${CalendarMetrics.blockRadius}px`,
        background: CalendarPalette.blockFill,
        border: `1px solid ${CalendarPalette.blockStroke}`
      }}
      onClick={() => props.onOpen()}
    >
      <span
        class="w-full"
        style={{
          ...clipped,
          'font-family': HelveticaNeue,
          'font-size': `${CalendarMetrics.blockTitleFontSize}px`,
          'font-weight': '700',
          'line-height': '1.25',
          color: CalendarPalette.blockTitle
        }}
      >
        {props.event.title}
      </span>
      <Show when={props.event.location !== ''}>
        <span
          class="w-full"
          style={{
            ...clipped,
            'font-family': HelveticaNeue,
            'font-size': `${CalendarMetrics.blockLocationFontSize}px`,
            'line-height': '1.25',
            color: CalendarPalette.blockLocation
          }}
        >
          {props.event.location}
        </span>
      </Show>
    </button>
  )
}

export const CalendarDayView = (props: {
  day: Date
  events: readonly CalendarEvent[]
  onSelectDay: (date: Date) => void
  onOpen: (event: CalendarEvent) => void
}) => (
  <div class="flex min-h-0 flex-1 flex-col">
    <div
      class="flex shrink-0 items-center"
      style={{
        height: `${CalendarMetrics.headerHeight}px`,
        padding: `0 ${CalendarMetrics.arrowInsetX}px`,
        gap: `${CalendarMetrics.dayTitleGap}px`,
        background: CalendarPalette.header,
        'border-bottom': `1px solid ${CalendarPalette.headerBorder}`
      }}
    >
      <button type="button" onClick={() => props.onSelectDay(addDays(props.day, -1))}>
        <CalendarArrow back={true} />
      </button>
      <span
        class="flex-1 text-left"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${CalendarMetrics.dayTitleFontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: CalendarPalette.monthTitle,
          'text-shadow': CalendarPalette.headerTextShadow
        }}
      >
        {weekdayName(props.day)}
      </span>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${CalendarMetrics.dayTitleFontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: CalendarPalette.monthTitle,
          'text-shadow': CalendarPalette.headerTextShadow
        }}
      >
        {shortDateTitle(props.day)}
      </span>
      <button type="button" onClick={() => props.onSelectDay(addDays(props.day, 1))}>
        <CalendarArrow back={false} />
      </button>
    </div>

    <UIScrollView class="min-h-0 flex-1" style={{ background: CalendarPalette.list }}>
      <div class="shrink-0" style={{ height: `${CalendarMetrics.hourGridTopInset}px` }} />
      <div class="relative" style={{ height: `${Hours.length * CalendarMetrics.hourRowHeight}px` }}>
        <For each={Hours}>
          {(hour) => (
            <div
              class="absolute inset-x-0"
              style={{
                top: `${hour * CalendarMetrics.hourRowHeight}px`,
                height: `${CalendarMetrics.hourRowHeight}px`,
                'border-top': `1px solid ${CalendarPalette.hourLine}`
              }}
            >
              <span
                class="absolute text-right"
                style={{
                  left: '0',
                  top: '0',
                  width: `${CalendarMetrics.hourLabelWidth - CalendarMetrics.hourInsetRight}px`,
                  'font-family': HelveticaNeue,
                  'font-size': `${CalendarMetrics.hourLabelFontSize}px`,
                  'line-height': '1',
                  transform: 'translateY(-50%)',
                  color: CalendarPalette.hourLabel
                }}
              >
                {hourLabel(hour)}
              </span>
            </div>
          )}
        </For>
        <For each={props.events.filter((event) => !event.allDay)}>
          {(event) => (
            <EventBlock event={event} day={props.day} onOpen={() => props.onOpen(event)} />
          )}
        </For>
      </div>
    </UIScrollView>
  </div>
)
