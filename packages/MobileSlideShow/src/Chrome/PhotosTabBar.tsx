import { For } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const PhotosTabs = [
  { key: 'Albums', icon: 'Albums_Photos' },
  { key: 'Places', icon: 'Places_Photos' }
] as const satisfies readonly { key: string; icon: AssetName }[]

export type PhotosTab = (typeof PhotosTabs)[number]['key']

const TabIcon = (props: { icon: AssetName; selected: boolean }) => {
  const size = () => (props.selected ? PhotosMetrics.tabIconSelectedSize : PhotosMetrics.tabIconSize)
  return (
    <div
      style={{
        width: `${size()}px`,
        height: `${size()}px`,
        background: props.selected ? PhotosPalette.tabIconSelected : PhotosPalette.tabIconIdle,
        '-webkit-mask-image': `url(${assetURL(props.icon)})`,
        'mask-image': `url(${assetURL(props.icon)})`,
        '-webkit-mask-size': 'contain',
        'mask-size': 'contain',
        '-webkit-mask-repeat': 'no-repeat',
        'mask-repeat': 'no-repeat',
        '-webkit-mask-position': 'center',
        'mask-position': 'center',
        filter: props.selected
          ? 'drop-shadow(0 2.5px 2.5px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 -1px 0 rgba(0,0,0,0.75))'
      }}
    />
  )
}

export const PhotosTabBar = (props: {
  selected: PhotosTab
  onSelect: (tab: PhotosTab) => void
}) => (
  <div
    class="relative flex w-full items-center"
    style={{ height: `${PhotosMetrics.tabBarHeight}px`, background: PhotosPalette.barGradient }}
  >
    <div class="flex w-full" style={{ height: `${PhotosMetrics.tabButtonHeight}px` }}>
      <For each={PhotosTabs}>
        {(tab) => (
          <button
            type="button"
            class="relative flex flex-1 flex-col items-center justify-center"
            style={{ gap: `${PhotosMetrics.tabStackSpacing}px` }}
            onClick={() => props.onSelect(tab.key)}
          >
            <div
              class="absolute"
              style={{
                width: `calc(100% - ${PhotosMetrics.tabHighlightInset * 2}px)`,
                height: `${PhotosMetrics.tabHighlightHeight}px`,
                'border-radius': `${PhotosMetrics.tabHighlightRadius}px`,
                background: 'rgba(255,255,255,0.1)',
                'mix-blend-mode': 'screen',
                opacity: props.selected === tab.key ? '1' : '0'
              }}
            />
            <TabIcon icon={tab.icon} selected={props.selected === tab.key} />
            <span
              class="relative"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PhotosMetrics.tabLabelFontSize}px`,
                'font-weight': '700',
                color: props.selected === tab.key ? 'white' : PhotosPalette.tabLabelIdle
              }}
            >
              {tab.key}
            </span>
          </button>
        )}
      </For>
    </div>
  </div>
)
