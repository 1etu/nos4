import { For, Show } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { HelveticaNeue } from './MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'

export type MusicTab = 'Playlists' | 'Artists' | 'Songs' | 'Videos' | 'More'

export const MusicTabs: readonly MusicTab[] = [
  'Playlists',
  'Artists',
  'Songs',
  'Videos',
  'More'
]

const iconWidth = (tab: MusicTab, selected: boolean): number => {
  if (tab === 'Songs') {
    return selected
      ? MobileiPodMetrics.tabIconWidthNarrowSelected
      : MobileiPodMetrics.tabIconWidthNarrow
  }
  if (tab === 'Artists') return MobileiPodMetrics.tabIconWidthWide
  return selected ? MobileiPodMetrics.tabIconWidthSelected : MobileiPodMetrics.tabIconWidth
}

const TabIcon = (props: { tab: MusicTab; selected: boolean }) => {
  const name = () => `${props.tab}_iPod` as AssetName
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
      style={{
        width: `${iconWidth(props.tab, props.selected)}px`,
        height: `${props.selected ? MobileiPodMetrics.tabIconHeightSelected : MobileiPodMetrics.tabIconHeight}px`
      }}
    >
      <Show when={props.selected}>
        <div
          class="absolute inset-0"
          style={{ ...mask(), background: MobileiPodPalette.tabIconRim }}
        />
      </Show>
      <div
        class="absolute inset-0"
        style={{
          ...mask(),
          background: props.selected
            ? props.tab === 'More'
              ? MobileiPodPalette.tabIconActiveFlat
              : MobileiPodPalette.tabIconActive
            : MobileiPodPalette.tabIconIdle,
          filter: props.selected
            ? 'brightness(1.095) drop-shadow(0 2.5px 5px rgba(0,0,0,0.6))'
            : 'drop-shadow(0 -1px 0 rgba(0,0,0,0.75))',
          transform: props.selected ? 'scale(0.983)' : 'none'
        }}
      />
    </div>
  )
}

export const MusicTabBar = (props: {
  width: number
  selected: MusicTab
  onSelect: (tab: MusicTab) => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${MobileiPodMetrics.tabBarHeight}px`,
      background: MobileiPodPalette.chrome
    }}
  >
    <div
      class="flex w-full items-end"
      style={{ height: `${MobileiPodMetrics.tabRowHeight}px` }}
    >
      <For each={MusicTabs}>
        {(tab) => (
          <button
            type="button"
            class="relative flex flex-1 flex-col items-center justify-end"
            style={{ height: `${MobileiPodMetrics.tabRowHeight}px`, gap: '2px' }}
            onClick={() => props.onSelect(tab)}
          >
            <Show when={props.selected === tab}>
              <div
                class="absolute"
                style={{
                  width: `${props.width / MusicTabs.length - MobileiPodMetrics.tabSelectionInset}px`,
                  height: `${MobileiPodMetrics.tabSelectionHeight}px`,
                  bottom: '0',
                  'border-radius': `${MobileiPodMetrics.tabSelectionRadius}px`,
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
                'font-size': `${MobileiPodMetrics.tabLabelFontSize}px`,
                'font-weight': '700',
                color: props.selected === tab ? 'white' : MobileiPodPalette.tabLabelIdle,
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
