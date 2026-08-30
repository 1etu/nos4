import { For, Show } from 'solid-js'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { addDays, hour12, meridiem, pad, pickerDateLabel, startOfDay } from '../Support/CalendarDates'
import { CalendarWheel, type CalendarWheelSpec } from './CalendarWheel'

const MinuteStep = 5
const MinutesPerHour = 60
const HoursPerHalfDay = 12
const DayRadius = 180

const Hours = Array.from({ length: HoursPerHalfDay }, (_, index) => String(index + 1))
const Minutes = Array.from({ length: MinutesPerHour / MinuteStep }, (_, index) =>
  pad(index * MinuteStep)
)
const Meridiems = ['AM', 'PM']

export const CalendarDatePicker = (props: {
  value: Date
  today: Date
  onChange: (value: Date) => void
}) => {
  const anchor = () => addDays(startOfDay(props.today), -DayRadius)
  const days = () => Array.from({ length: DayRadius * 2 + 1 }, (_, index) => addDays(anchor(), index))
  const dayIndex = () =>
    Math.round((startOfDay(props.value).getTime() - anchor().getTime()) / 86400000)
  const todayIndex = () => DayRadius

  const withParts = (day: number, hour: number, minute: number, pm: number): void => {
    const base = days()[day] ?? props.value
    props.onChange(
      new Date(
        base.getFullYear(),
        base.getMonth(),
        base.getDate(),
        (hour % HoursPerHalfDay) + pm * HoursPerHalfDay,
        minute * MinuteStep
      )
    )
  }

  const hourIndex = () => hour12(props.value.getHours()) - 1
  const minuteIndex = () => Math.round(props.value.getMinutes() / MinuteStep) % Minutes.length
  const meridiemIndex = () => (meridiem(props.value.getHours()) === 'AM' ? 0 : 1)

  const wheels = (): CalendarWheelSpec[] => [
    {
      values: days().map((day) => pickerDateLabel(day, props.today)),
      highlighted: todayIndex(),
      selected: dayIndex(),
      grow: CalendarMetrics.pickerDayGrow,
      align: 'right',
      onSelect: (index) => withParts(index, hourIndex() + 1, minuteIndex(), meridiemIndex())
    },
    {
      values: Hours,
      highlighted: -1,
      selected: hourIndex(),
      grow: CalendarMetrics.pickerHourGrow,
      align: 'center',
      onSelect: (index) => withParts(dayIndex(), index + 1, minuteIndex(), meridiemIndex())
    },
    {
      values: Minutes,
      highlighted: -1,
      selected: minuteIndex(),
      grow: CalendarMetrics.pickerHourGrow,
      align: 'center',
      onSelect: (index) => withParts(dayIndex(), hourIndex() + 1, index, meridiemIndex())
    },
    {
      values: Meridiems,
      highlighted: -1,
      selected: meridiemIndex(),
      grow: CalendarMetrics.pickerHourGrow,
      align: 'center',
      onSelect: (index) => withParts(dayIndex(), hourIndex() + 1, minuteIndex(), index)
    }
  ]

  return (
    <div
      class="relative shrink-0 overflow-hidden"
      style={{
        height: `${CalendarMetrics.pickerHeight}px`,
        margin: `0 ${CalendarMetrics.pickerInsetX}px`,
        'border-radius': `${CalendarMetrics.pickerRadius}px`,
        background: CalendarPalette.pickerFace,
        border: `1px solid ${CalendarPalette.pickerFrame}`
      }}
    >
      <div
        class="pointer-events-none absolute inset-x-0"
        style={{
          top: `${(CalendarMetrics.pickerHeight - CalendarMetrics.pickerBandHeight) / 2}px`,
          height: `${CalendarMetrics.pickerBandHeight}px`,
          background: CalendarPalette.pickerBand,
          'border-top': `1px solid ${CalendarPalette.pickerBandEdge}`,
          'border-bottom': `1px solid ${CalendarPalette.pickerBandEdge}`
        }}
      />

      <div class="absolute inset-0 flex">
        <For each={wheels()}>
          {(wheel, index) => (
            <>
              <Show when={index() > 0}>
                <div
                  class="shrink-0"
                  style={{
                    width: `${CalendarMetrics.pickerDividerWidth}px`,
                    background: CalendarPalette.pickerDivider
                  }}
                />
              </Show>
              <CalendarWheel wheel={wheel} />
            </>
          )}
        </For>
      </div>

      <div
        class="pointer-events-none absolute inset-0"
        style={{ background: CalendarPalette.pickerShade, 'mix-blend-mode': 'multiply' }}
      />
    </div>
  )
}
