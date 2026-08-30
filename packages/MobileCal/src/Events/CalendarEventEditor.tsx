import { createSignal, Show } from 'solid-js'
import {
  UIBarButton,
  UINavigationBar,
  UIPinstripeBackground,
  UIScrollView,
  UITableGroup,
  UITableMetrics,
  UITablePalette,
  UITableRow
} from 'UIKit'
import { UIKeyboardStandard, UIKeyboardView } from 'TextInput'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'
import { clockLabel, longDateLabel, meridiem } from '../Support/CalendarDates'
import type { CalendarEvent } from '../Support/CalendarStore'
import { CalendarStartEnd } from './CalendarStartEnd'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

type CalendarField = 'title' | 'location'

const spanLabel = (event: CalendarEvent): string => {
  const start = new Date(event.start)
  if (event.allDay) return `${longDateLabel(start)}  all-day`
  return `${longDateLabel(start)}  ${clockLabel(start)} ${meridiem(start.getHours())}`
}

const FieldRow = (props: {
  value: string
  placeholder: string
  focused: boolean
  onFocus: () => void
}) => (
  <button
    type="button"
    class="flex h-full w-full items-center"
    style={{ padding: `0 ${UITableMetrics.rowInsetX}px` }}
    onClick={props.onFocus}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${CalendarMetrics.editorFontSize}px`,
        'font-weight': props.value === '' ? '400' : '700',
        color: props.value === '' ? CalendarPalette.editorPlaceholder : 'black'
      }}
    >
      {props.value === '' ? props.placeholder : props.value}
    </span>
    <Show when={props.focused}>
      <div
        style={{
          width: `${CalendarMetrics.caretWidth}px`,
          height: `${CalendarMetrics.caretHeight}px`,
          'margin-left': `${CalendarMetrics.caretGap}px`,
          background: CalendarPalette.pickerToday
        }}
      />
    </Show>
  </button>
)

export const CalendarEventEditor = (props: {
  draft: CalendarEvent
  editing: boolean
  today: Date
  width: number
  onChange: (draft: CalendarEvent) => void
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
}) => {
  const [field, setField] = createSignal<CalendarField | undefined>()
  const [schedule, setSchedule] = createSignal(false)

  const write = (next: string) => {
    const target = field()
    if (target === 'title') props.onChange({ ...props.draft, title: next })
    if (target === 'location') props.onChange({ ...props.draft, location: next })
  }

  const current = () => {
    const target = field()
    if (target === 'title') return props.draft.title
    if (target === 'location') return props.draft.location
    return ''
  }

  return (
    <Show
      when={!schedule()}
      fallback={
        <CalendarStartEnd
          start={new Date(props.draft.start)}
          end={new Date(props.draft.end)}
          allDay={props.draft.allDay}
          today={props.today}
          onChange={(start, end, allDay) =>
            props.onChange({ ...props.draft, start: start.getTime(), end: end.getTime(), allDay })
          }
          onDone={() => setSchedule(false)}
          onCancel={() => setSchedule(false)}
        />
      }
    >
      <div class="relative flex h-full w-full flex-col overflow-hidden">
        <UINavigationBar
          title={props.editing ? 'Edit' : 'Add Event'}
          leading={<UIBarButton title="Cancel" tone="gray" onClick={props.onCancel} />}
          trailing={<UIBarButton title="Done" tone="blue" onClick={props.onSave} />}
        />

        <div class="min-h-0 flex-1">
          <UIPinstripeBackground>
            <UIScrollView class="h-full w-full">
              <div style={{ height: `${UITableMetrics.topSpacing}px` }} />
              <UITableGroup>
                <UITableRow separator={true}>
                  <FieldRow
                    value={props.draft.title}
                    placeholder="Title"
                    focused={field() === 'title'}
                    onFocus={() => setField('title')}
                  />
                </UITableRow>
                <UITableRow>
                  <FieldRow
                    value={props.draft.location}
                    placeholder="Location"
                    focused={field() === 'location'}
                    onFocus={() => setField('location')}
                  />
                </UITableRow>
              </UITableGroup>

              <div style={{ height: `${UITableMetrics.sectionSpacing}px` }} />

              <UITableGroup>
                <UITableRow>
                  <button
                    type="button"
                    class="flex h-full w-full items-center justify-between"
                    style={{ padding: `0 ${UITableMetrics.rowInsetX}px` }}
                    onClick={() => {
                      setField(undefined)
                      setSchedule(true)
                    }}
                  >
                    <span
                      style={{
                        'font-family': HelveticaNeue,
                        'font-size': `${CalendarMetrics.editorFontSize}px`,
                        'font-weight': '700',
                        color: 'black'
                      }}
                    >
                      Starts
                    </span>
                    <span
                      style={{
                        'font-family': HelveticaNeue,
                        'font-size': `${CalendarMetrics.editorFontSize}px`,
                        'font-weight': '700',
                        color: UITablePalette.rowValue
                      }}
                    >
                      {spanLabel(props.draft)}
                    </span>
                  </button>
                </UITableRow>
              </UITableGroup>

              <Show when={props.editing}>
                <div style={{ height: `${UITableMetrics.sectionSpacing}px` }} />
                <UITableGroup>
                  <UITableRow>
                    <button
                      type="button"
                      class="flex h-full w-full items-center justify-center"
                      onClick={props.onDelete}
                    >
                      <span
                        style={{
                          'font-family': HelveticaNeue,
                          'font-size': `${CalendarMetrics.editorFontSize}px`,
                          'font-weight': '700',
                          color: CalendarPalette.destructive
                        }}
                      >
                        Delete Event
                      </span>
                    </button>
                  </UITableRow>
                </UITableGroup>
              </Show>

              <div style={{ height: `${CalendarMetrics.editorBottomInset}px` }} />
            </UIScrollView>
          </UIPinstripeBackground>
        </div>

        <UIKeyboardView
          visible={field() !== undefined}
          width={props.width}
          configuration={UIKeyboardStandard}
          onInsert={(text) => write(current() + text)}
          onDelete={() => write(current().slice(0, -1))}
          onReturn={() => setField(undefined)}
        />
      </div>
    </Show>
  )
}
