import { Show, createSignal, onCleanup, type JSX } from 'solid-js'
import { UISliderMetrics, UISliderPalette } from './UISliderMetrics'

export const UISlider = (props: {
  value: number
  minimum?: number
  maximum?: number
  leading?: JSX.Element
  trailing?: JSX.Element
  onInput: (value: number) => void
}) => {
  let track!: HTMLDivElement
  const [dragging, setDragging] = createSignal(false)

  const minimum = () => props.minimum ?? 0
  const maximum = () => props.maximum ?? 1
  const fraction = () =>
    Math.min(Math.max((props.value - minimum()) / (maximum() - minimum()), 0), 1)

  const emit = (clientX: number) => {
    const box = track.getBoundingClientRect()
    const usable = box.width - UISliderMetrics.knobSize
    if (usable <= 0) return
    const offset = clientX - box.left - UISliderMetrics.knobSize / 2
    const share = Math.min(Math.max(offset / usable, 0), 1)
    props.onInput(minimum() + share * (maximum() - minimum()))
  }

  const onMove = (event: PointerEvent) => emit(event.clientX)

  const onUp = () => {
    setDragging(false)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
  }

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary) return
    setDragging(true)
    emit(event.clientX)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  onCleanup(onUp)

  const barStyle = (filled: boolean): JSX.CSSProperties => ({
    height: `${UISliderMetrics.trackHeight}px`,
    'border-radius': `${UISliderMetrics.trackRadius}px`,
    background: filled ? UISliderPalette.fill : UISliderPalette.empty,
    'box-shadow': `${filled ? UISliderPalette.fillInnerShadow : UISliderPalette.emptyInnerShadow}, 0 0 0 ${UISliderMetrics.trackStroke}px ${UISliderPalette.trackStroke}`
  })

  return (
    <div
      class="flex w-full items-center"
      style={{
        height: `${UISliderMetrics.rowHeight}px`,
        gap: `${UISliderMetrics.capGap}px`
      }}
    >
      <Show when={props.leading}>{props.leading}</Show>
      <div
        ref={track}
        class="relative flex-1 select-none"
        style={{ height: `${UISliderMetrics.knobSize}px`, 'touch-action': 'none' }}
        onPointerDown={onDown}
      >
        <div
          class="absolute left-0 flex w-full items-center"
          style={{ top: '0', bottom: '0' }}
        >
          <div
            style={{
              ...barStyle(true),
              width: `calc(${fraction()} * (100% - ${UISliderMetrics.knobSize}px) + ${UISliderMetrics.knobSize / 2}px)`,
              'border-top-right-radius': '0',
              'border-bottom-right-radius': '0'
            }}
          />
          <div
            style={{
              ...barStyle(false),
              flex: '1',
              'border-top-left-radius': '0',
              'border-bottom-left-radius': '0'
            }}
          />
        </div>
        <div
          class="absolute top-0"
          style={{
            left: `calc(${fraction()} * (100% - ${UISliderMetrics.knobSize}px))`,
            width: `${UISliderMetrics.knobSize}px`,
            height: `${UISliderMetrics.knobSize}px`,
            'border-radius': '50%',
            background: UISliderPalette.knob,
            'box-shadow': `${UISliderPalette.knobShadow}, 0 0 0 ${UISliderMetrics.knobStroke}px ${UISliderPalette.knobStroke}`,
            transform: dragging() ? 'scale(1.02)' : 'none'
          }}
        />
      </div>
      <Show when={props.trailing}>{props.trailing}</Show>
    </div>
  )
}
