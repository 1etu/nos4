import { For, Show } from 'solid-js'
import { assetURL, type AssetName } from 'CoreGraphics'
import { UIScrollView, uiWallpaperCatalog } from 'UIKit'
import { PreferencesMetrics } from '../Support/PreferencesMetrics'

export const PreferencesWallpaperGrid = (props: {
  empty?: boolean
  onPick: (wallpaper: AssetName) => void
}) => (
  <UIScrollView class="h-full w-full">
    <Show when={!props.empty} fallback={<div class="h-full w-full" style={{ background: 'white' }} />}>
      <div
        class="grid"
        style={{
          background: 'white',
          'grid-template-columns': `repeat(${PreferencesMetrics.wallpaperGridColumns}, 1fr)`,
          gap: `${PreferencesMetrics.wallpaperGridSpacing}px`,
          padding: `${PreferencesMetrics.wallpaperGridInset}px`
        }}
      >
        <For each={uiWallpaperCatalog()}>
          {(wallpaper) => (
            <button
              type="button"
              class="relative overflow-hidden"
              style={{ 'aspect-ratio': '1 / 1' }}
              onClick={() => props.onPick(wallpaper)}
            >
              <img
                src={assetURL(wallpaper)}
                alt=""
                draggable={false}
                class="h-full w-full"
                style={{ 'object-fit': 'cover' }}
              />
            </button>
          )}
        </For>
      </div>
    </Show>
  </UIScrollView>
)
