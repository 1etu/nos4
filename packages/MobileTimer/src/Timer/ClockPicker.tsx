import { For, Show } from 'solid-js'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import { ClockWheel, type ClockWheelSpec } from './ClockWheel'

export const ClockPicker = (props: { wheels: readonly ClockWheelSpec[] }) => (
  <div
    class="relative shrink-0 overflow-hidden"
    style={{
      height: `${ClockMetrics.wheelHeight}px`,
      margin: `0 ${ClockMetrics.wheelInsetX}px`,
      'border-radius': `${ClockMetrics.wheelRadius}px`,
      background: ClockPalette.wheelCylinder,
      border: `1px solid ${ClockPalette.wheelFrame}`,
      'box-shadow': `inset 1px 0 0 ${ClockPalette.wheelInnerEdge}, inset -1px 0 0 ${ClockPalette.wheelInnerEdge}`
    }}
  >
    <div
      class="pointer-events-none absolute inset-x-0"
      style={{
        top: `${(ClockMetrics.wheelHeight - ClockMetrics.wheelBandHeight) / 2}px`,
        height: `${ClockMetrics.wheelBandHeight}px`,
        background: ClockPalette.wheelBand,
        'border-top': `${ClockMetrics.wheelBandEdgeHeight}px solid ${ClockPalette.wheelBandTop}`,
        'border-bottom': `${ClockMetrics.wheelBandEdgeHeight}px solid ${ClockPalette.wheelBandBottom}`
      }}
    />

    <div class="absolute inset-0 flex">
      <For each={props.wheels}>
        {(wheel, index) => (
          <>
            <Show when={index() > 0}>
              <div
                class="shrink-0"
                style={{
                  width: `${ClockMetrics.wheelDividerWidth}px`,
                  background: ClockPalette.wheelDivider,
                  'box-shadow': `-1px 0 0 ${ClockPalette.wheelInnerEdge}, 1px 0 0 ${ClockPalette.wheelInnerEdge}`
                }}
              />
            </Show>
            <ClockWheel wheel={wheel} />
          </>
        )}
      </For>
    </div>
  </div>
)
