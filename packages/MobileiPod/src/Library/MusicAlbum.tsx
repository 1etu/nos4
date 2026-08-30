import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { MPArtwork } from '../Chrome/MPArtwork'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import {
  formatTimeFor,
  formatTimeForMinutes,
  wrapAround,
  type MPMediaItem,
  type MPMediaItemCollection
} from '../Support/MPMediaLibrary'
import { nowPlayingItem, setPlaybackQueue } from '../Support/MPMusicPlayerController'

const NowPlayingBadge = () => (
  <CGImage name="NowPlayingListItemIcon" class="shrink-0" style={{ 'margin-right': '5px' }} />
)

const Detail = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileiPodMetrics.albumDetailFontSize}px`,
      'font-weight': '700',
      color: MobileiPodPalette.albumDetail,
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

export const MusicAlbum = (props: {
  album: MPMediaItemCollection
  onNowPlaying: () => void
}) => {
  const totalSeconds = () =>
    props.album.items.reduce((sum, item) => sum + item.playbackDuration, 0)

  const play = (track: MPMediaItem) => {
    setPlaybackQueue(wrapAround(props.album.items, track))
    props.onNowPlaying()
  }

  return (
    <UIScrollView class="h-full w-full" style={{ background: 'white' }}>
      <div
        class="flex items-start"
        style={{
          height: `${MobileiPodMetrics.albumHeaderHeight}px`,
          background: MobileiPodPalette.albumHeader
        }}
      >
        <div
          class="relative shrink-0 overflow-hidden"
          style={{
            width: `${MobileiPodMetrics.albumArtworkSize}px`,
            height: `${MobileiPodMetrics.albumHeaderHeight}px`,
            'margin-left': `${MobileiPodMetrics.albumArtworkLeading}px`
          }}
        >
          <MPArtwork item={props.album.items[0]} size={MobileiPodMetrics.albumArtworkSize} />
          <MPArtwork
            item={props.album.items[0]}
            size={MobileiPodMetrics.albumArtworkSize}
            style={{ transform: 'scaleY(-1)', opacity: '0.15' }}
          />
        </div>

        <div
          class="flex min-w-0 flex-col"
          style={{ 'padding-top': '10px', 'padding-left': '8px' }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MobileiPodMetrics.albumArtistFontSize}px`,
              'font-weight': '700',
              color: 'black',
              'white-space': 'nowrap'
            }}
          >
            {props.album.items[0]?.artist ?? ''}
          </span>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MobileiPodMetrics.albumTitleFontSize}px`,
              'font-weight': '700',
              color: 'black',
              'white-space': 'nowrap'
            }}
          >
            {props.album.name}
          </span>
          <Detail text={`Released ${props.album.items[0]?.year ?? ''}`} />
          <Detail
            text={`${props.album.items.length} Songs, ${formatTimeForMinutes(totalSeconds())} Mins.`}
          />
        </div>
      </div>

      <div class="relative">
        <div
          class="pointer-events-none absolute inset-y-0"
          style={{
            left: `${MobileiPodMetrics.albumRuleInset}px`,
            width: `${MobileiPodMetrics.albumRule}px`,
            background: MobileiPodPalette.albumRule
          }}
        />
        <div
          class="pointer-events-none absolute inset-y-0"
          style={{
            right: `${MobileiPodMetrics.albumRuleInset}px`,
            width: `${MobileiPodMetrics.albumRule}px`,
            background: MobileiPodPalette.albumRule
          }}
        />
        <div
          style={{
            height: `${MobileiPodMetrics.albumRule}px`,
            background: MobileiPodPalette.albumRule
          }}
        />
        <For each={props.album.items}>
          {(track, at) => (
            <>
              <button
                type="button"
                class="flex w-full items-center"
                style={{
                  height: `${MobileiPodMetrics.albumRowHeight - MobileiPodMetrics.albumRule}px`,
                  background: at() % 2 === 0 ? 'white' : MobileiPodPalette.albumRowAlternate
                }}
                onClick={() => play(track)}
              >
                <div
                  class="flex shrink-0 items-center justify-center"
                  style={{ width: `${MobileiPodMetrics.albumNumberColumn}px` }}
                >
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${MobileiPodMetrics.albumTrackFontSize}px`,
                      'font-weight': '700',
                      color: 'black'
                    }}
                  >
                    {track.albumTrackNumber}
                  </span>
                </div>
                <span
                  class="min-w-0 flex-1 text-left"
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${MobileiPodMetrics.albumTrackFontSize}px`,
                    'font-weight': '700',
                    color: 'black',
                    'padding-left': `${MobileiPodMetrics.albumTrackTitleLeading}px`,
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis'
                  }}
                >
                  {track.title}
                </span>
                <Show when={nowPlayingItem()?.id === track.id}>
                  <NowPlayingBadge />
                </Show>
                <div
                  class="flex shrink-0 items-center justify-center"
                  style={{ width: `${MobileiPodMetrics.albumNumberColumn}px` }}
                >
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${MobileiPodMetrics.albumDurationFontSize}px`,
                      'font-weight': '700',
                      color: MobileiPodPalette.albumDetail
                    }}
                  >
                    {formatTimeFor(track.playbackDuration)}
                  </span>
                </div>
              </button>
              <div
                style={{
                  height: `${MobileiPodMetrics.albumRule}px`,
                  background: MobileiPodPalette.albumRule
                }}
              />
            </>
          )}
        </For>
      </div>
    </UIScrollView>
  )
}
