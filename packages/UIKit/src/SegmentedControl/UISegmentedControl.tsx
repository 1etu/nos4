import { For, Show } from 'solid-js'
import {
  UISegmentedControlMetrics,
  UISegmentedControlPalette
} from './UISegmentedControlMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const radiusFor = (index: number, count: number): string => {
  const r = UISegmentedControlMetrics.cornerRadius
  if (index === 0) return `${r}px 0 0 ${r}px`
  if (index === count - 1) return `0 ${r}px ${r}px 0`
  return '0'
}

export const UISegmentedControl = (props: {
  segments: readonly string[]
  selected: number
  width: number
  onSelect: (index: number) => void
}) => (
  <div
    class="relative flex"
    style={{
      width: `${props.width}px`,
      height: `${UISegmentedControlMetrics.height}px`,
      'box-shadow': '0 0.8px 0 rgba(255,255,255,0.28)'
    }}
  >
    <For each={props.segments}>
      {(segment, at) => (
        <>
          <button
            type="button"
            class="relative flex flex-1 items-center justify-center"
            style={{
              background:
                props.selected === at()
                  ? UISegmentedControlPalette.selected
                  : UISegmentedControlPalette.unselected,
              'border-radius': radiusFor(at(), props.segments.length),
              'box-shadow': 'inset 0 0.6px 1.64px rgba(0,0,0,0.7)',
              'font-family': HelveticaNeue,
              'font-size': `${UISegmentedControlMetrics.fontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -0.66px 0 rgba(0,0,0,0.6)',
              'white-space': 'nowrap'
            }}
            onClick={() => props.onSelect(at())}
          >
            {segment}
          </button>
          <Show when={at() < props.segments.length - 1}>
            <div
              class="pointer-events-none shrink-0"
              style={{
                width: `${UISegmentedControlMetrics.dividerWidth}px`,
                background: UISegmentedControlPalette.divider
              }}
            />
          </Show>
        </>
      )}
    </For>
  </div>
)
