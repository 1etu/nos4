import { createSignal, For } from 'solid-js'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface CalendarWheelSpec {
  readonly values: readonly string[]
  readonly highlighted: number
  readonly selected: number
  readonly grow: number
  readonly align: 'center' | 'right' | 'left'
  readonly onSelect: (index: number) => void
}

export const CalendarWheel = (props: { wheel: CalendarWheelSpec }) => {
  const [drag, setDrag] = createSignal(0)
  let origin: number | undefined

  const offset = () =>
    CalendarMetrics.pickerHeight / 2 -
    CalendarMetrics.pickerRowHeight / 2 -
    props.wheel.selected * CalendarMetrics.pickerRowHeight +
    drag()

  const settle = () => {
    if (origin === undefined) return
    const travelled = drag()
    origin = undefined
    setDrag(0)
    const moved = Math.round(-travelled / CalendarMetrics.pickerRowHeight)
    const next = Math.max(
      0,
      Math.min(props.wheel.values.length - 1, props.wheel.selected + moved)
    )
    if (next !== props.wheel.selected) props.wheel.onSelect(next)
  }

  return (
    <div
      class="relative h-full touch-none overflow-hidden"
      style={{ 'flex-grow': props.wheel.grow, 'flex-basis': '0' }}
      onPointerDown={(event) => {
        origin = event.clientY
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (origin === undefined) return
        setDrag(event.clientY - origin)
      }}
      onPointerUp={settle}
      onPointerCancel={settle}
    >
      <div class="absolute inset-x-0 top-0" style={{ transform: `translateY(${offset()}px)` }}>
        <For each={props.wheel.values}>
          {(value, index) => (
            <div
              class="flex w-full items-center"
              style={{
                height: `${CalendarMetrics.pickerRowHeight}px`,
                padding: `0 ${CalendarMetrics.pickerRowInsetX}px`,
                'justify-content':
                  props.wheel.align === 'center'
                    ? 'center'
                    : props.wheel.align === 'right'
                      ? 'flex-end'
                      : 'flex-start'
              }}
              onClick={() => props.wheel.onSelect(index())}
            >
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${CalendarMetrics.pickerFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  'white-space': 'nowrap',
                  color:
                    index() === props.wheel.highlighted
                      ? CalendarPalette.pickerToday
                      : CalendarPalette.pickerText
                }}
              >
                {value}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
