import { For } from 'solid-js'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { CalendarWeekdays, monthTitle } from '../Support/CalendarDates'
import { CalendarArrow } from './CalendarArrow'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CalendarMonthHeader = (props: {
  month: Date
  onPrevious: () => void
  onNext: () => void
}) => (
  <div
    class="relative shrink-0"
    style={{
      height: `${CalendarMetrics.headerHeight}px`,
      background: CalendarPalette.header,
      'border-bottom': `1px solid ${CalendarPalette.headerBorder}`
    }}
  >
    <div
      class="flex items-center justify-between"
      style={{
        height: `${CalendarMetrics.monthBarHeight}px`,
        padding: `0 ${CalendarMetrics.arrowInsetX}px`
      }}
    >
      <button type="button" onClick={props.onPrevious}>
        <CalendarArrow back={true} />
      </button>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${CalendarMetrics.monthTitleFontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: CalendarPalette.monthTitle,
          'text-shadow': CalendarPalette.headerTextShadow
        }}
      >
        {monthTitle(props.month)}
      </span>
      <button type="button" onClick={props.onNext}>
        <CalendarArrow back={false} />
      </button>
    </div>

    <div class="flex" style={{ height: `${CalendarMetrics.weekdayBarHeight}px` }}>
      <For each={CalendarWeekdays}>
        {(day) => (
          <span
            class="flex flex-1 items-start justify-center"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CalendarMetrics.weekdayFontSize}px`,
              'font-weight': '700',
              'line-height': '1',
              color: CalendarPalette.weekday,
              'text-shadow': CalendarPalette.headerTextShadow
            }}
          >
            {day}
          </span>
        )}
      </For>
    </div>
  </div>
)
