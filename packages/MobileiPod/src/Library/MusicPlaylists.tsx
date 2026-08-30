import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { Chevron, RowSubtitle, RowTitle, Separator, SkeuomorphicList } from '../Chrome/MusicListChrome'
import { MusicSearchField } from '../Search/MusicSearchField'
import { MusicSearchOverlay } from '../Search/MusicSearchOverlay'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import {
  libraryPlaylists,
  shuffled,
  wrapAround,
  type MPMediaItem,
  type MPMediaItemCollection
} from '../Support/MPMediaLibrary'
import { nowPlayingItem, setPlaybackQueue } from '../Support/MPMusicPlayerController'

const PlaylistActions = ['Edit', 'Clear', 'Delete'] as const

const ActionRow = () => (
  <div
    class="flex"
    style={{
      height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
      gap: `${MobileiPodMetrics.playlistButtonSpacing}px`,
      padding: `${MobileiPodMetrics.playlistButtonInset}px ${MobileiPodMetrics.playlistButtonInset}px 2px`
    }}
  >
    <For each={PlaylistActions}>
      {(label) => (
        <button
          type="button"
          class="flex flex-1 items-center justify-center"
          style={{
            'border-radius': `${MobileiPodMetrics.playlistButtonRadius}px`,
            background: MobileiPodPalette.playlistButton,
            border: `1px solid ${MobileiPodPalette.playlistButtonStroke}`,
            'font-family': "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            'font-size': `${MobileiPodMetrics.playlistButtonFontSize}px`,
            'font-weight': '700',
            color: MobileiPodPalette.playlistButtonLabel,
            'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
          }}
        >
          {label}
        </button>
      )}
    </For>
  </div>
)

export const MusicPlaylists = (props: {
  playlist: MPMediaItemCollection | undefined
  onOpen: (playlist: MPMediaItemCollection) => void
  onNowPlaying: () => void
}) => {
  const play = (items: readonly MPMediaItem[]) => {
    setPlaybackQueue(items)
    props.onNowPlaying()
  }

  return (
    <div class="relative h-full w-full">
      <SkeuomorphicList>
        <MusicSearchField noRightPadding />
        <div style={{ background: 'white' }}>
          <Show
            when={props.playlist}
            fallback={
              <For each={libraryPlaylists()}>
                {(playlist) => (
                  <>
                    <button
                      type="button"
                      class="flex w-full items-center"
                      style={{
                        height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
                        'padding-left': `${MobileiPodMetrics.rowLeading}px`
                      }}
                      onClick={() => props.onOpen(playlist)}
                    >
                      <RowTitle text={playlist.name} trailing={MobileiPodMetrics.rowTrailing} />
                      <div class="flex-1" />
                      <Chevron />
                    </button>
                    <Separator />
                  </>
                )}
              </For>
            }
          >
            {(playlist) => (
              <>
                <ActionRow />
                <Separator />
                <button
                  type="button"
                  class="flex w-full items-center"
                  style={{
                    height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
                    'padding-left': `${MobileiPodMetrics.rowLeading}px`,
                    gap: '6px'
                  }}
                  onClick={() => play(shuffled(playlist().items))}
                >
                  <RowTitle text="Shuffle" />
                  <CGImage name="shuffle_icon" />
                </button>
                <Separator />
                <For each={playlist().items}>
                  {(song) => (
                    <>
                      <button
                        type="button"
                        class="flex w-full items-center"
                        style={{
                          height: `${MobileiPodMetrics.rowHeight - MobileiPodMetrics.hairline}px`,
                          'padding-left': `${MobileiPodMetrics.rowLeading}px`,
                          'padding-right': `${MobileiPodMetrics.rowLeading}px`
                        }}
                        onClick={() => play(wrapAround(playlist().items, song))}
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
              </>
            )}
          </Show>
        </div>
      </SkeuomorphicList>

      <MusicSearchOverlay onPlay={(song) => play([song])} />
    </div>
  )
}
