import { For } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { Chevron, RowTitle, Separator } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { UIScrollView } from 'UIKit'

const MoreItems: readonly { readonly title: string; readonly icon: AssetName }[] = [
  { title: 'Albums', icon: 'BarAlbums' },
  { title: 'Audiobooks', icon: 'BarAudioBooks' },
  { title: 'Composers', icon: 'BarComposers' },
  { title: 'Genres', icon: 'BarGenres' },
  { title: 'iTunes U', icon: 'BarITunesU' },
  { title: 'Podcasts', icon: 'BarPodcasts' }
]

export const MusicMore = () => (
  <UIScrollView class="h-full w-full" style={{ background: 'white' }}>
    <For each={MoreItems}>
      {(entry) => (
        <>
          <div
            class="flex items-center"
            style={{
              height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
              'padding-left': `${MobileiPodMetrics.moreRowLeading}px`,
              gap: '8px'
            }}
          >
            <div
              class="relative shrink-0 self-stretch"
              style={{ width: `${MobileiPodMetrics.moreIconSlot}px` }}
            >
              <CGImage
                name={entry.icon}
                class="absolute top-1/2 left-1/2"
                style={{ transform: 'translate(-50%, -50%)', 'max-width': 'none' }}
              />
            </div>
            <RowTitle text={entry.title} trailing={MobileiPodMetrics.rowTrailing} />
            <div class="flex-1" />
            <Chevron />
          </div>
          <Separator />
        </>
      )}
    </For>
  </UIScrollView>
)
