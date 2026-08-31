import { For, Show } from 'solid-js'
import { CGImage, assetURL, type AssetName } from 'CoreGraphics'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import { AppStoreTabs, type AppStoreTab } from '../Support/AppStoreTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const assetFor = (tab: AppStoreTab): AssetName => `${tab.replace(' ', '_')}_Store` as AssetName

const iconWidth = (tab: AppStoreTab): number => {
  if (tab === 'Search') return AppStoreMetrics.tabIconWidthSearch
  if (tab === 'Featured') return AppStoreMetrics.tabIconWidthFeatured
  return AppStoreMetrics.tabIconWidth
}

const TabIcon = (props: { tab: AppStoreTab; selected: boolean }) => {
  const mask = () => {
    const url = `url(${assetURL(assetFor(props.tab))})`
    return {
      '-webkit-mask-image': url,
      'mask-image': url,
      '-webkit-mask-repeat': 'no-repeat',
      'mask-repeat': 'no-repeat',
      '-webkit-mask-position': 'center bottom',
      'mask-position': 'center bottom',
      '-webkit-mask-size': 'contain',
      'mask-size': 'contain'
    }
  }

  return (
    <Show
      when={props.selected && props.tab === 'Featured'}
      fallback={
        <div
          class="relative shrink-0"
          style={{
            width: `${iconWidth(props.tab)}px`,
            height: `${AppStoreMetrics.tabIconHeight}px`
          }}
        >
          <Show when={props.selected}>
            <div
              class="absolute inset-0"
              style={{ ...mask(), background: AppStorePalette.tabIconRim }}
            />
          </Show>
          <div
            class="absolute inset-0"
            style={{
              ...mask(),
              background: props.selected
                ? AppStorePalette.tabIconActive
                : AppStorePalette.tabIconIdle,
              filter: props.selected
                ? 'brightness(1.095) drop-shadow(0 2.5px 2.5px rgba(0,0,0,0.6))'
                : 'drop-shadow(0 -1px 0 rgba(0,0,0,0.75))'
            }}
          />
        </div>
      }
    >
      <div
        class="relative flex shrink-0 items-end justify-center"
        style={{
          width: `${AppStoreMetrics.tabIconFeaturedSelectedWidth}px`,
          height: `${AppStoreMetrics.tabIconHeight}px`
        }}
      >
        <CGImage
          name="UITabBarFeaturedSelected2"
          style={{
            width: `${AppStoreMetrics.tabIconFeaturedSelectedWidth}px`,
            height: `${AppStoreMetrics.tabIconFeaturedSelectedHeight}px`,
            'object-fit': 'contain'
          }}
        />
      </div>
    </Show>
  )
}

export const AppStoreTabBar = (props: {
  width: number
  selected: AppStoreTab
  onSelect: (tab: AppStoreTab) => void
}) => (
  <div
    class="relative flex shrink-0 items-end"
    style={{ height: `${AppStoreMetrics.tabBarHeight}px`, background: AppStorePalette.tabBar }}
  >
    <div class="flex w-full" style={{ height: `${AppStoreMetrics.tabRowHeight}px` }}>
      <For each={AppStoreTabs}>
        {(tab) => (
          <button
            type="button"
            class="relative flex flex-1 items-center justify-center"
            style={{ height: `${AppStoreMetrics.tabRowHeight}px` }}
            onClick={() => props.onSelect(tab)}
          >
            <Show when={props.selected === tab}>
              <div
                class="absolute"
                style={{
                  width: `${props.width / AppStoreTabs.length - AppStoreMetrics.tabSelectionInset}px`,
                  height: `${AppStoreMetrics.tabSelectionHeight}px`,
                  'border-radius': `${AppStoreMetrics.tabSelectionRadius}px`,
                  background: AppStorePalette.tabSelection,
                  'mix-blend-mode': 'screen'
                }}
              />
            </Show>

            <div
              class="relative flex flex-col items-center"
              style={{ gap: `${AppStoreMetrics.tabLabelGap}px` }}
            >
              <TabIcon tab={tab} selected={props.selected === tab} />
              <span
                class="text-center"
                style={{
                  'max-width': `${props.width / AppStoreTabs.length - AppStoreMetrics.tabSelectionInset}px`,
                  'font-family': HelveticaNeue,
                  'font-size': `${AppStoreMetrics.tabLabelFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  'white-space': 'nowrap',
                  color: props.selected === tab ? 'white' : AppStorePalette.tabLabelIdle
                }}
              >
                {tab}
              </span>
            </div>
          </button>
        )}
      </For>
    </div>
  </div>
)
