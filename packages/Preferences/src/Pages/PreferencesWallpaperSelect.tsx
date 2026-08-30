import { For } from 'solid-js'
import { CGImage, assetURL, type AssetName } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import { PreferencesPage } from '../Support/PreferencesCatalog'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

interface SourceSpec {
  readonly id: string
  readonly title: string
  readonly thumbnail: AssetName
  readonly destination: string
}

const Sources: readonly SourceSpec[] = [
  {
    id: 'bundled',
    title: 'Wallpaper',
    thumbnail: 'Wallpaper_21',
    destination: PreferencesPage.wallpaperGrid
  },
  {
    id: 'cameraRoll',
    title: 'Camera Roll',
    thumbnail: 'Wallpaper_9',
    destination: PreferencesPage.wallpaperCameraRoll
  }
]

export const PreferencesWallpaperSelect = (props: { onOpen: (id: string) => void }) => (
  <UIScrollView class="h-full w-full">
    <div
      class="flex flex-col"
      style={{
        gap: `${PreferencesMetrics.sectionSpacing}px`,
        'padding-top': `${PreferencesMetrics.topSpacing}px`,
        padding: `${PreferencesMetrics.topSpacing}px ${PreferencesMetrics.accessoryInset}px 0`
      }}
    >
      <For each={Sources}>
        {(source) => (
          <button
            type="button"
            class="flex w-full items-center overflow-hidden"
            style={{
              height: `${PreferencesMetrics.wallpaperSourceHeight}px`,
              background: 'white',
              'border-radius': `${PreferencesMetrics.wallpaperCardRadius}px`,
              border: `${PreferencesMetrics.wallpaperCardStroke}px solid ${PreferencesPalette.cardStroke}`
            }}
            onClick={() => props.onOpen(source.destination)}
          >
            <img
              src={assetURL(source.thumbnail)}
              alt=""
              draggable={false}
              style={{
                width: `${PreferencesMetrics.wallpaperThumbSize}px`,
                height: `${PreferencesMetrics.wallpaperThumbSize}px`,
                'object-fit': 'cover',
                'border-radius': `${PreferencesMetrics.wallpaperCardRadius}px 0 0 ${PreferencesMetrics.wallpaperCardRadius}px`
              }}
            />
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PreferencesMetrics.valueFontSize}px`,
                'font-weight': '700',
                color: PreferencesPalette.rowTitle,
                'margin-left': `${PreferencesMetrics.iconInset}px`
              }}
            >
              {source.title}
            </span>
            <div class="ml-auto" style={{ 'margin-right': `${PreferencesMetrics.accessoryInset}px` }}>
              <CGImage name="UITableNext" />
            </div>
          </button>
        )}
      </For>
    </div>
  </UIScrollView>
)
