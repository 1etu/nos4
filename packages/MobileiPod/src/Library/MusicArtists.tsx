import { For, Show } from 'solid-js'
import {
  AlphabetIndex,
  Chevron,
  indexLetter,
  ListFooterCount,
  ListHeader,
  RowTitle,
  Separator,
  SkeuomorphicList
} from '../Chrome/MusicListChrome'
import { MusicSearchField } from '../Search/MusicSearchField'
import { MusicSearchOverlay } from '../Search/MusicSearchOverlay'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { MPArtwork } from '../Chrome/MPArtwork'
import {
  albumsForArtist,
  libraryArtists,
  type MPMediaItem,
  type MPMediaItemCollection
} from '../Support/MPMediaLibrary'
import { setPlaybackQueue } from '../Support/MPMusicPlayerController'
import { isSearching } from '../Search/MusicSearch'

export const MusicArtists = (props: {
  artist: string | undefined
  onOpenArtist: (artist: string) => void
  onOpenAlbum: (album: MPMediaItemCollection) => void
  onNowPlaying: () => void
}) => {
  let scroller: HTMLDivElement | undefined

  const letters = () => {
    const present = new Set(libraryArtists().map((artist) => indexLetter(artist.name)))
    return [...present].sort()
  }

  const play = (song: MPMediaItem) => {
    setPlaybackQueue([song])
    props.onNowPlaying()
  }

  return (
    <div class="relative h-full w-full">
      <div ref={scroller} class="h-full w-full">
        <SkeuomorphicList>
          <MusicSearchField noRightPadding={isSearching() || props.artist !== undefined} />

          <div style={{ background: 'white' }}>
            <Show
              when={props.artist}
              fallback={
                <>
                  <For each={letters()}>
                    {(letter) => (
                      <div id={`artist-index-${letter}`}>
                        <ListHeader label={letter} />
                        <For
                          each={libraryArtists().filter(
                            (artist) => indexLetter(artist.name) === letter
                          )}
                        >
                          {(artist) => (
                            <>
                              <button
                                type="button"
                                class="flex w-full flex-col justify-end"
                                style={{
                                  height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
                                  'padding-bottom': `${MobileiPodMetrics.rowPadBottom}px`,
                                  'padding-left': `${MobileiPodMetrics.rowLeading}px`,
                                  'padding-right': `${MobileiPodMetrics.rowTrailing}px`
                                }}
                                onClick={() => props.onOpenArtist(artist.name)}
                              >
                                <div class="flex w-full">
                                  <RowTitle text={artist.name} />
                                </div>
                              </button>
                              <Separator />
                            </>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                  <ListFooterCount label={`${libraryArtists().length} Artists`} />
                </>
              }
            >
              {(artist) => (
                <For each={albumsForArtist(artist())}>
                  {(album) => (
                    <>
                      <button
                        type="button"
                        class="flex w-full items-center"
                        style={{
                          height: `${MobileiPodMetrics.artworkRowHeight - MobileiPodMetrics.hairline}px`
                        }}
                        onClick={() => props.onOpenAlbum(album)}
                      >
                        <MPArtwork
                          item={album.items[0]}
                          size={MobileiPodMetrics.artworkSize}
                          class="shrink-0"
                        />
                        <div
                          class="flex min-w-0 flex-1 items-center"
                          style={{
                            'padding-left': `${MobileiPodMetrics.artworkTitleLeading}px`
                          }}
                        >
                          <RowTitle text={album.name} trailing={MobileiPodMetrics.rowTrailing} />
                        </div>
                        <Chevron />
                      </button>
                      <Separator />
                    </>
                  )}
                </For>
              )}
            </Show>
          </div>
        </SkeuomorphicList>
      </div>

      <Show when={!isSearching() && !props.artist}>
        <AlphabetIndex
          present={letters()}
          onSelect={(letter) => {
            const target =
              letter === 'Search'
                ? scroller?.querySelector('div')
                : scroller?.querySelector(`#artist-index-${letter}`)
            target?.scrollIntoView({ block: 'start' })
          }}
        />
      </Show>

      <MusicSearchOverlay onPlay={play} />
    </div>
  )
}
