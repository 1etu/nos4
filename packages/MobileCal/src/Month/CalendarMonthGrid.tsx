import { For, Show } from 'solid-js'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { calendarGrid, isSameDay, type CalendarCell } from '../Support/CalendarDates'
import { dayHasEvents } from '../Support/CalendarStore'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const cellFill = (selected: boolean, today: boolean): string => {
  if (selected) return CalendarPalette.daySelected
  if (today) return CalendarPalette.dayToday
  return CalendarPalette.cell
}

const cellBorder = (selected: boolean, today: boolean): string => {
  if (selected) return CalendarPalette.daySelectedBottom
  if (today) return CalendarPalette.dayTodayBottom
  return CalendarPalette.cellSeparator
}

const numberColour = (cell: CalendarCell, highlighted: boolean): string => {
  if (highlighted) return CalendarPalette.dayTextSelected
  return cell.inMonth ? CalendarPalette.dayText : CalendarPalette.dayTextMuted
}

export const CalendarMonthGrid = (props: {
  month: Date
  selected: Date
  today: Date
  onSelect: (date: Date) => void
}) => (
  <div class="relative shrink-0">
    <div class="flex flex-wrap">
      <For each={calendarGrid(props.month)}>
        {(cell) => {
          const selected = () => isSameDay(cell.date, props.selected)
          const today = () => isSameDay(cell.date, props.today)
          const highlighted = () => selected() || today()
          return (
            <button
              type="button"
              class="relative flex flex-col items-center justify-center"
              style={{
                width: `${100 / CalendarMetrics.gridColumns}%`,
                height: `${CalendarMetrics.gridRowHeight}px`,
                background: cellFill(selected(), today()),
                'border-bottom': `${CalendarMetrics.cellSeparator}px solid ${cellBorder(selected(), today())}`,
                'border-right': `${CalendarMetrics.cellSeparator}px solid ${CalendarPalette.cellSeparator}`
              }}
              onClick={() => props.onSelect(cell.date)}
            >
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${CalendarMetrics.dayFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  transform: `translateY(${CalendarMetrics.dayNumberOffsetY}px)`,
                  color: numberColour(cell, highlighted()),
                  'text-shadow': highlighted()
                    ? '0 -1px 0 rgba(0,0,0,0.35)'
                    : CalendarPalette.headerTextShadow
                }}
              >
                {cell.date.getDate()}
              </span>
              <Show when={dayHasEvents(cell.date)}>
                <div
                  class="absolute"
                  style={{
                    width: `${CalendarMetrics.dotSize}px`,
                    height: `${CalendarMetrics.dotSize}px`,
                    bottom: `${CalendarMetrics.dotBottomInset}px`,
                    'border-radius': '50%',
                    background: highlighted() ? CalendarPalette.dotSelected : CalendarPalette.dot
                  }}
                />
              </Show>
            </button>
          )
        }}
      </For>
    </div>
    <div class="pointer-events-none absolute inset-0" style={{ background: CalendarPalette.gridFade }} />
  </div>
)
