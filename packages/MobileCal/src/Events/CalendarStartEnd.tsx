import { createSignal, Show } from 'solid-js'
import {
  UIBarButton,
  UINavigationBar,
  UIPinstripeBackground,
  UISwitch,
  UITableGroup,
  UITableMetrics,
  UITableRow
} from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { clockLabel, longDateLabel, meridiem } from '../Support/CalendarDates'
import { CalendarDatePicker } from './CalendarDatePicker'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

type CalendarBound = 'start' | 'end'

const stampLabel = (value: Date, withDate: boolean): string => {
  const time = `${clockLabel(value)} ${meridiem(value.getHours())}`
  return withDate ? `${longDateLabel(value)}  ${time}` : time
}

const Label = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${CalendarMetrics.editorFontSize}px`,
      'font-weight': '700',
      color: 'black'
    }}
  >
    {props.text}
  </span>
)

const Value = (props: { text: string; active: boolean }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${CalendarMetrics.editorFontSize}px`,
      'font-weight': '700',
      color: props.active ? CalendarPalette.pickerToday : CalendarPalette.editorValue
    }}
  >
    {props.text}
  </span>
)

export const CalendarStartEnd = (props: {
  start: Date
  end: Date
  allDay: boolean
  today: Date
  onChange: (start: Date, end: Date, allDay: boolean) => void
  onDone: () => void
  onCancel: () => void
}) => {
  const [bound, setBound] = createSignal<CalendarBound>('start')

  const edited = () => (bound() === 'start' ? props.start : props.end)

  const change = (value: Date) => {
    if (bound() === 'start') {
      const span = props.end.getTime() - props.start.getTime()
      props.onChange(value, new Date(value.getTime() + span), props.allDay)
      return
    }
    props.onChange(props.start, value, props.allDay)
  }

  return (
    <div class="flex h-full w-full flex-col overflow-hidden">
      <UINavigationBar
        title="Start & End"
        leading={<UIBarButton title="Cancel" tone="gray" onClick={props.onCancel} />}
        trailing={<UIBarButton title="Done" tone="blue" onClick={props.onDone} />}
      />

      <div class="min-h-0 flex-1">
        <UIPinstripeBackground>
          <div class="flex h-full w-full flex-col">
            <div style={{ height: `${UITableMetrics.topSpacing}px` }} />
            <UITableGroup>
              <UITableRow separator={true}>
                <button
                  type="button"
                  class="flex h-full w-full items-center justify-between"
                  style={{ padding: `0 ${UITableMetrics.rowInsetX}px` }}
                  onClick={() => setBound('start')}
                >
                  <Label text="Starts" />
                  <Value text={stampLabel(props.start, true)} active={bound() === 'start'} />
                </button>
              </UITableRow>
              <UITableRow separator={true}>
                <button
                  type="button"
                  class="flex h-full w-full items-center justify-between"
                  style={{ padding: `0 ${UITableMetrics.rowInsetX}px` }}
                  onClick={() => setBound('end')}
                >
                  <Label text="Ends" />
                  <Value text={stampLabel(props.end, false)} active={bound() === 'end'} />
                </button>
              </UITableRow>
              <UITableRow>
                <div
                  class="flex h-full w-full items-center justify-between"
                  style={{ padding: `0 ${UITableMetrics.rowInsetX}px` }}
                >
                  <Label text="All-day" />
                  <UISwitch
                    on={props.allDay}
                    onChange={(on) => props.onChange(props.start, props.end, on)}
                  />
                </div>
              </UITableRow>
            </UITableGroup>

            <div class="flex-1" />

            <Show when={!props.allDay}>
              <div style={{ 'padding-bottom': `${CalendarMetrics.pickerBottomInset}px` }}>
                <CalendarDatePicker value={edited()} today={props.today} onChange={change} />
              </div>
            </Show>
          </div>
        </UIPinstripeBackground>
      </div>
    </div>
  )
}
