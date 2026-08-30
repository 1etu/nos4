import { CGImage, assetURL } from 'CoreGraphics'
import { UIScrollView, uiWallpaperHome, uiWallpaperLock } from 'UIKit'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'
import { PreferencesPage } from '../Support/PreferencesCatalog'

const Preview = (props: { wallpaper: string; overlay: 'lockScreenOverlay' | 'homeScreenOverlay' }) => (
  <div
    class="relative overflow-hidden"
    style={{
      width: `${PreferencesMetrics.wallpaperPreviewWidth}px`,
      height: `${PreferencesMetrics.wallpaperPreviewHeight}px`
    }}
  >
    <img
      src={assetURL(props.wallpaper as Parameters<typeof assetURL>[0])}
      alt=""
      draggable={false}
      class="absolute inset-0 h-full w-full"
      style={{ 'object-fit': 'cover' }}
    />
    <CGImage name={props.overlay} class="absolute inset-0" />
  </div>
)

export const PreferencesWallpaperPage = (props: { onOpen: (id: string) => void }) => (
  <UIScrollView class="h-full w-full">
    <div style={{ 'padding-top': `${PreferencesMetrics.topSpacing}px` }}>
      <div style={{ padding: `0 ${PreferencesMetrics.accessoryInset}px` }}>
        <button
          type="button"
          class="flex w-full items-center overflow-hidden"
          style={{
            background: 'white',
            'border-radius': `${PreferencesMetrics.wallpaperCardRadius}px`,
            border: `${PreferencesMetrics.wallpaperCardStroke}px solid ${PreferencesPalette.cardStroke}`,
            padding: `${PreferencesMetrics.wallpaperCardPaddingY}px 0`
          }}
          onClick={() => props.onOpen(PreferencesPage.wallpaperSelect)}
        >
          <div style={{ 'margin-left': `${PreferencesMetrics.wallpaperPreviewInset}px` }}>
            <Preview wallpaper={uiWallpaperLock()} overlay="lockScreenOverlay" />
          </div>
          <div class="ml-auto" style={{ 'margin-right': `${PreferencesMetrics.wallpaperPreviewInset}px` }}>
            <Preview wallpaper={uiWallpaperHome()} overlay="homeScreenOverlay" />
          </div>
          <div style={{ 'margin-right': `${PreferencesMetrics.accessoryInset}px` }}>
            <CGImage name="UITableNext" />
          </div>
        </button>
      </div>
    </div>
  </UIScrollView>
)
