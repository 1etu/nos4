import { For, Show } from 'solid-js'
import { CGImage, CGResizableImage, assetPointSize, assetURL, type AssetName } from 'CoreGraphics'
import { MapsMetrics } from '../Support/MapsMetrics'
import { MapsTransport, type MapsTransportValue } from '../Support/MapsTypes'

interface TransportOption {
  readonly value: MapsTransportValue
  readonly icon: AssetName
}

const Options: readonly TransportOption[] = [
  { value: MapsTransport.automobile, icon: 'Driving' },
  { value: MapsTransport.transit, icon: 'Transit' },
  { value: MapsTransport.walking, icon: 'Walking' }
]

export const MapsTransportControl = (props: {
  selected: MapsTransportValue
  onSelect: (value: MapsTransportValue) => void
}) => {
  const width = () => MapsMetrics.transportSegmentWidth * Options.length
  const selectedIndex = () => Options.findIndex((option) => option.value === props.selected)
  const texture = assetPointSize('UITexturedButton')

  return (
    <div
      class="relative overflow-hidden"
      style={{
        width: `${width()}px`,
        height: `${MapsMetrics.segmentedHeight}px`,
        'border-radius': `${MapsMetrics.toolBarButtonRadius}px`,
        'background-image': `url(${assetURL('UITexturedButton')})`,
        'background-size': `${width()}px ${texture.height}px`,
        'background-repeat': 'no-repeat',
        'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
      }}
    >
      <Show when={selectedIndex() >= 0}>
        <CGResizableImage
          name="UISegmentTexturedButtonSelectedCenter"
          width={MapsMetrics.transportSegmentWidth}
          height={MapsMetrics.segmentedHeight}
          style={{
            position: 'absolute',
            left: `${selectedIndex() * MapsMetrics.transportSegmentWidth}px`,
            top: '0'
          }}
        />
      </Show>

      <For each={Options}>
        {(_option, at) => (
          <Show when={at() < Options.length - 1}>
            <CGResizableImage
              name={
                at() === selectedIndex() || at() + 1 === selectedIndex()
                  ? 'UISegmentTexturedSelectedDivider'
                  : 'UISegmentTexturedDivider'
              }
              width={MapsMetrics.panelSegmentDividerWidth}
              height={MapsMetrics.segmentedHeight}
              style={{
                position: 'absolute',
                left: `${(at() + 1) * MapsMetrics.transportSegmentWidth}px`,
                top: '0'
              }}
            />
          </Show>
        )}
      </For>

      <div class="relative flex h-full w-full">
        <For each={Options}>
          {(option) => (
            <button
              type="button"
              class="flex flex-1 items-center justify-center"
              onClick={() => props.onSelect(option.value)}
            >
              <CGImage
                name={option.icon}
                style={{
                  width: `${MapsMetrics.transportIconSize}px`,
                  height: `${MapsMetrics.transportIconSize}px`,
                  filter:
                    props.selected === option.value
                      ? 'none'
                      : 'brightness(0.35) contrast(1.2)'
                }}
              />
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
