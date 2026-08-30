import { For, Show } from 'solid-js'
import { Chevron, ListHeader, RowSubtitle, RowTitle, Separator } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { MPArtwork } from '../Chrome/MPArtwork'
import { libraryArtists, librarySongs, type MPMediaItem } from '../Support/MPMediaLibrary'
import { searchQuery } from './MusicSearch'
import { UIScrollView } from 'UIKit'

const matches = (value: string, query: string): boolean =>
  value.toLowerCase().includes(query.toLowerCase())

const plural = (count: number): string => (count === 1 ? 'Result' : 'Results')

export const MusicSearchResults = (props: { onPlay: (song: MPMediaItem) => void }) => {
  const artists = () => libraryArtists().filter((artist) => matches(artist.name, searchQuery()))
  const songs = () => librarySongs().filter((song) => matches(song.title, searchQuery()))

  return (
    <UIScrollView class="h-full w-full" style={{ background: 'white' }}>
      <Show when={artists().length > 0}>
        <ListHeader label={`Artists (${artists().length} ${plural(artists().length)})`} />
        <For each={artists()}>
          {(artist) => (
            <>
              <div
                class="flex items-center"
                style={{
                  height: `${MobileiPodMetrics.artworkRowHeight - MobileiPodMetrics.hairline}px`
                }}
              >
                <MPArtwork
                  item={artist.items[0]}
                  size={MobileiPodMetrics.artworkSize}
                  class="shrink-0"
                />
                <div
                  class="flex min-w-0 flex-1 items-center"
                  style={{ 'padding-left': `${MobileiPodMetrics.artworkTitleLeading}px` }}
                >
                  <RowTitle text={artist.name} trailing={MobileiPodMetrics.rowTrailing} />
                </div>
                <Chevron />
              </div>
              <Separator />
            </>
          )}
        </For>
      </Show>

      <Show when={songs().length > 0}>
        <ListHeader label={`Songs (${songs().length} ${plural(songs().length)})`} />
        <For each={songs()}>
          {(song) => (
            <>
              <button
                type="button"
                class="flex w-full items-center"
                style={{
                  height: `${MobileiPodMetrics.artworkRowHeight - MobileiPodMetrics.hairline}px`
                }}
                onClick={() => props.onPlay(song)}
              >
                <MPArtwork item={song} size={MobileiPodMetrics.artworkSize} class="shrink-0" />
                <div
                  class="flex min-w-0 flex-1 flex-col items-start"
                  style={{
                    'padding-left': `${MobileiPodMetrics.artworkTitleLeading}px`,
                    'padding-right': `${MobileiPodMetrics.rowTrailing}px`
                  }}
                >
                  <RowTitle text={song.title} />
                  <div style={{ height: '1px' }} />
                  <RowSubtitle text={`${song.albumTitle} - ${song.artist}`} />
                </div>
                <Chevron />
              </button>
              <Separator />
            </>
          )}
        </For>
      </Show>
    </UIScrollView>
  )
}
