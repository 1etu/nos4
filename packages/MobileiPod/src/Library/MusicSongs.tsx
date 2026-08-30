import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import {
  AlphabetIndex,
  indexLetter,
  ListFooterCount,
  ListHeader,
  RowSubtitle,
  RowTitle,
  Separator,
  SkeuomorphicList
} from '../Chrome/MusicListChrome'
import { MusicSearchField } from '../Search/MusicSearchField'
import { MusicSearchOverlay } from '../Search/MusicSearchOverlay'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { shuffled, sortedSongs, wrapAround, type MPMediaItem } from '../Support/MPMediaLibrary'
import { nowPlayingItem, setPlaybackQueue } from '../Support/MPMusicPlayerController'
import { isSearching } from '../Search/MusicSearch'

export const MusicSongs = (props: { onNowPlaying: () => void }) => {
  let scroller: HTMLDivElement | undefined

  const letters = () => {
    const present = new Set(sortedSongs().map((song) => indexLetter(song.title)))
    return [...present].sort()
  }

  const play = (items: readonly MPMediaItem[]) => {
    setPlaybackQueue(items)
    props.onNowPlaying()
  }

  return (
    <div class="relative h-full w-full">
      <div ref={scroller} class="h-full w-full">
        <SkeuomorphicList>
          <MusicSearchField noRightPadding={isSearching()} />

          <div style={{ background: 'white' }}>
            <button
              type="button"
              class="flex w-full items-center"
              style={{
                height: `${MobileiPodMetrics.rowHeight}px`,
                'padding-left': `${MobileiPodMetrics.rowLeading}px`,
                gap: '6px'
              }}
              onClick={() => play(shuffled(sortedSongs()))}
            >
              <RowTitle text="Shuffle" />
              <CGImage name="shuffle_icon" />
            </button>

            <For each={letters()}>
              {(letter) => (
                <div id={`song-index-${letter}`}>
                  <ListHeader label={letter} />
                  <For each={sortedSongs().filter((song) => indexLetter(song.title) === letter)}>
                    {(song) => (
                      <>
                        <button
                          type="button"
                          class="flex w-full items-center"
                          style={{
                            height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
                            'padding-left': `${MobileiPodMetrics.rowLeading}px`,
                            'padding-right': `${MobileiPodMetrics.rowTrailing}px`
                          }}
                          onClick={() => play(wrapAround(sortedSongs(), song))}
                        >
                          <div class="flex min-w-0 flex-1 flex-col items-start">
                            <RowTitle text={song.title} />
                            <div style={{ height: '1px' }} />
                            <RowSubtitle text={`${song.albumTitle} - ${song.artist}`} />
                          </div>
                          <Show when={nowPlayingItem()?.id === song.id}>
                            <CGImage name="NowPlayingListItemIcon" class="shrink-0" />
                          </Show>
                        </button>
                        <Separator />
                      </>
                    )}
                  </For>
                </div>
              )}
            </For>
            <ListFooterCount label={`${sortedSongs().length} Songs`} />
          </div>
        </SkeuomorphicList>
      </div>

      <Show when={!isSearching()}>
        <AlphabetIndex
          present={letters()}
          onSelect={(letter) => {
            const target =
              letter === 'Search'
                ? scroller?.querySelector('div')
                : scroller?.querySelector(`#song-index-${letter}`)
            target?.scrollIntoView({ block: 'start' })
          }}
        />
      </Show>

      <MusicSearchOverlay onPlay={(song) => play([song])} />
    </div>
  )
}
