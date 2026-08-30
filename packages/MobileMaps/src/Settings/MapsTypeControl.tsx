import { For, Show } from 'solid-js'
import { CGResizableImage, assetPointSize, assetURL } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsType, type MapsTypeValue } from '../Support/MapsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

interface TypeOption {
  readonly value: MapsTypeValue
  readonly title: string
}

const Options: readonly TypeOption[] = [
  { value: MapsType.standard, title: 'Map' },
  { value: MapsType.satellite, title: 'Satellite' },
  { value: MapsType.hybrid, title: 'Hybrid' },
  { value: MapsType.list, title: 'List' }
]

export const MapsTypeControl = (props: {
  selected: MapsTypeValue
  width: number
  onSelect: (value: MapsTypeValue) => void
}) => {
  const segmentWidth = () => props.width / Options.length
  const selectedIndex = () => Options.findIndex((option) => option.value === props.selected)
  const texture = assetPointSize('UITexturedButton')

  return (
    <div
      class="relative overflow-hidden"
      style={{
        width: `${props.width}px`,
        height: `${MapsMetrics.panelSegmentHeight}px`,
        'background-image': `url(${assetURL('UITexturedButton')})`,
        'background-size': `${props.width}px ${texture.height}px`,
        'background-repeat': 'no-repeat'
      }}
    >
      <Show when={selectedIndex() >= 0}>
        <CGResizableImage
          name="UISegmentTexturedButtonSelectedCenter"
          width={segmentWidth()}
          height={MapsMetrics.panelSegmentHeight}
          style={{
            position: 'absolute',
            left: `${selectedIndex() * segmentWidth()}px`,
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
              height={MapsMetrics.panelSegmentHeight}
              style={{
                position: 'absolute',
                left: `${(at() + 1) * segmentWidth()}px`,
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
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${MapsMetrics.panelSegmentFontSize}px`,
                  'font-weight': '700',
                  ...(props.selected === option.value
                    ? { color: 'white', 'text-shadow': '0 -0.66px 0 rgba(0,0,0,0.6)' }
                    : {
                        color: MapsPalette.texturedInk,
                        'text-shadow': '0 0.8px 0 rgba(255,255,255,0.28)'
                      })
                }}
              >
                {option.title}
              </span>
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
