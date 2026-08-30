import { createSignal, For } from 'solid-js'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface ClockWheelSpec {
  readonly values: readonly string[]
  readonly unit: string
  readonly selected: number
  readonly onSelect: (index: number) => void
}

const rowStyle = {
  'font-family': HelveticaNeue,
  'font-size': `${ClockMetrics.wheelFontSize}px`,
  'font-weight': '700',
  'line-height': '1',
  color: ClockPalette.wheelText,
  'text-shadow': '0 1px 0 rgba(255,255,255,0.4)'
} as const

export const ClockWheel = (props: { wheel: ClockWheelSpec }) => {
  const [drag, setDrag] = createSignal(0)
  let origin: number | undefined

  const restIndex = () => props.wheel.selected

  const offset = () =>
    ClockMetrics.wheelHeight / 2 -
    ClockMetrics.wheelRowHeight / 2 -
    restIndex() * ClockMetrics.wheelRowHeight +
    drag()

  const settle = () => {
    if (origin === undefined) return
    const travelled = drag()
    origin = undefined
    setDrag(0)
    const moved = Math.round(-travelled / ClockMetrics.wheelRowHeight)
    const clamped = Math.max(
      0,
      Math.min(props.wheel.values.length - 1, restIndex() + moved)
    )
    if (clamped !== restIndex()) props.wheel.onSelect(clamped)
  }

  return (
    <div
      class="relative h-full flex-1 touch-none overflow-hidden"
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
              class="flex w-full items-center justify-center"
              style={{ height: `${ClockMetrics.wheelRowHeight}px` }}
              onClick={() => props.wheel.onSelect(index())}
            >
              <span style={rowStyle}>{value}</span>
              <span
                style={{
                  ...rowStyle,
                  'margin-left': `${ClockMetrics.wheelUnitGap}px`,
                  visibility: index() === restIndex() ? 'visible' : 'hidden'
                }}
              >
                {props.wheel.unit}
              </span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
