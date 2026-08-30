import { For, Show } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type StoreTab = 'Music' | 'Videos' | 'Search' | 'Genius' | 'More'

export const StoreTabs: readonly StoreTab[] = ['Music', 'Videos', 'Search', 'Genius', 'More']

const TabIcon = (props: { tab: StoreTab; selected: boolean }) => {
  const name = () => `${props.tab}_iTunes` as AssetName
  const mask = () => ({
    '-webkit-mask-image': `url(${assetURL(name())})`,
    'mask-image': `url(${assetURL(name())})`,
    '-webkit-mask-repeat': 'no-repeat',
    'mask-repeat': 'no-repeat',
    '-webkit-mask-position': 'center',
    'mask-position': 'center',
    '-webkit-mask-size': 'contain',
    'mask-size': 'contain'
  })

  return (
    <div
      class="relative"
      style={{ width: '34px', height: `${StoreMetrics.tabIconHeight}px` }}
    >
      <Show when={props.selected}>
        <div class="absolute inset-0" style={{ ...mask(), background: StorePalette.tabIconRim }} />
      </Show>
      <div
        class="absolute inset-0"
        style={{
          ...mask(),
          background: props.selected ? StorePalette.tabIconActive : StorePalette.tabIconIdle,
          filter: props.selected
            ? 'brightness(1.095) drop-shadow(0 2.5px 5px rgba(0,0,0,0.6))'
            : 'drop-shadow(0 -1px 0 rgba(0,0,0,0.75))',
          transform: props.selected ? 'scale(0.983)' : 'none'
        }}
      />
    </div>
  )
}

export const StoreTabBar = (props: {
  width: number
  selected: StoreTab
  onSelect: (tab: StoreTab) => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{ height: `${StoreMetrics.tabBarHeight}px`, background: StorePalette.tabChrome }}
  >
    <div class="flex w-full items-end" style={{ height: `${StoreMetrics.tabRowHeight}px` }}>
      <For each={StoreTabs}>
        {(tab) => (
          <button
            type="button"
            class="relative flex flex-1 flex-col items-center justify-end"
            style={{ height: `${StoreMetrics.tabRowHeight}px`, gap: '2px' }}
            onClick={() => props.onSelect(tab)}
          >
            <Show when={props.selected === tab}>
              <div
                class="absolute bottom-0"
                style={{
                  width: `${props.width / StoreTabs.length - 5}px`,
                  height: '51px',
                  'border-radius': '3px',
                  background: 'rgba(255,255,255,0.1)',
                  'mix-blend-mode': 'screen'
                }}
              />
            </Show>
            <div class="relative flex flex-1 items-end pb-0.5">
              <TabIcon tab={tab} selected={props.selected === tab} />
            </div>
            <span
              class="relative"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${StoreMetrics.tabLabelFontSize}px`,
                'font-weight': '700',
                color: props.selected === tab ? 'white' : StorePalette.tabLabelIdle,
                'padding-bottom': '2px'
              }}
            >
              {tab}
            </span>
          </button>
        )}
      </For>
    </div>
  </div>
)
