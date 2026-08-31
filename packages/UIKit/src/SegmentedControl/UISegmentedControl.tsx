import { For, Show } from 'solid-js'
import {
  UISegmentedControlMetrics,
  UISegmentedControlPalette
} from './UISegmentedControlMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type UISegmentedControlTone = 'blue' | 'gray'

const radiusFor = (index: number, count: number): string => {
  const r = UISegmentedControlMetrics.cornerRadius
  if (index === 0) return `${r}px 0 0 ${r}px`
  if (index === count - 1) return `0 ${r}px ${r}px 0`
  return '0'
}

const fillFor = (tone: UISegmentedControlTone, selected: boolean): string => {
  if (tone === 'gray') {
    return selected
      ? UISegmentedControlPalette.graySelected
      : UISegmentedControlPalette.grayUnselected
  }
  return selected ? UISegmentedControlPalette.selected : UISegmentedControlPalette.unselected
}

const labelFor = (tone: UISegmentedControlTone, selected: boolean): string => {
  if (tone === 'gray' && !selected) return UISegmentedControlPalette.grayLabel
  return 'white'
}

const labelShadowFor = (tone: UISegmentedControlTone, selected: boolean): string => {
  if (tone !== 'gray') return '0 -0.66px 0 rgba(0,0,0,0.6)'
  return selected
    ? UISegmentedControlPalette.graySelectedLabelShadow
    : UISegmentedControlPalette.grayLabelShadow
}

export const UISegmentedControl = (props: {
  segments: readonly string[]
  selected: number
  width: number
  tone?: UISegmentedControlTone
  onSelect: (index: number) => void
}) => {
  const tone = (): UISegmentedControlTone => props.tone ?? 'blue'

  return (
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
                background: fillFor(tone(), props.selected === at()),
                'border-radius': radiusFor(at(), props.segments.length),
                'box-shadow': 'inset 0 0.6px 1.64px rgba(0,0,0,0.7)',
                'font-family': HelveticaNeue,
                'font-size': `${UISegmentedControlMetrics.fontSize}px`,
                'font-weight': '700',
                color: labelFor(tone(), props.selected === at()),
                'text-shadow': labelShadowFor(tone(), props.selected === at()),
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
                  background:
                    tone() === 'gray'
                      ? UISegmentedControlPalette.grayDivider
                      : UISegmentedControlPalette.divider
                }}
              />
            </Show>
          </>
        )}
      </For>
    </div>
  )
}
