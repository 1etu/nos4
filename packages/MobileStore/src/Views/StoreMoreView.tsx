import { For } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const MoreItems: readonly { readonly name: string; readonly icon: AssetName }[] = [
  { name: 'Tones', icon: 'BarTones' },
  { name: 'Podcasts', icon: 'BarPodcasts' },
  { name: 'Audiobooks', icon: 'BarAudioBooks' },
  { name: 'iTunes U', icon: 'BarITunesU' },
  { name: 'Downloads', icon: 'BarDownloads' }
]

export const StoreMoreView = () => (
  <div class="h-full w-full" style={{ background: 'white' }}>
    <For each={MoreItems}>
      {(item) => (
        <>
          <div
            class="flex items-center"
            style={{
              height: `${StoreMetrics.moreRowHeight - StoreMetrics.moreHairline}px`,
              'padding-left': `${StoreMetrics.moreRowLeading}px`,
              gap: '8px'
            }}
          >
            <div
              class="relative shrink-0 self-stretch"
              style={{ width: `${StoreMetrics.moreIconSlot}px` }}
            >
              <CGImage
                name={item.icon}
                class="absolute top-1/2 left-1/2"
                style={{ transform: 'translate(-50%, -50%)', 'max-width': 'none' }}
              />
            </div>
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${StoreMetrics.moreFontSize}px`,
                'font-weight': '700',
                color: 'black',
                'padding-left': '6px',
                'padding-right': '40px',
                'white-space': 'nowrap'
              }}
            >
              {item.name}
            </span>
            <div class="flex-1" />
            <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
              <CGImage name="UITableNext" />
            </div>
          </div>
          <div
            style={{
              height: `${StoreMetrics.moreHairline}px`,
              background: StorePalette.moreSeparator
            }}
          />
        </>
      )}
    </For>
  </div>
)
