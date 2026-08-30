import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import { formatTimeFor, type MPMediaItem } from '../Support/MPMediaLibrary'
import { nowPlayingItem } from '../Support/MPMusicPlayerController'
import { UIScrollView } from 'UIKit'

const RatingView = (props: { rating: number; onRate: (value: number) => void }) => (
  <div
    class="flex items-center justify-center"
    style={{
      height: `${MobileiPodMetrics.tracksHeaderHeight}px`,
      background: MobileiPodPalette.tracksHeader
    }}
  >
    <For each={[1, 2, 3, 4, 5]}>
      {(number) => (
        <button
          type="button"
          class="flex items-center justify-center"
          style={{
            width: `${MobileiPodMetrics.starSlot}px`,
            height: `${MobileiPodMetrics.starSlot}px`
          }}
          onClick={() => props.onRate(number)}
        >
          <Show
            when={number <= props.rating}
            fallback={
              <CGImage
                name="star_empty"
                style={{
                  width: `${MobileiPodMetrics.starEmptySize}px`,
                  height: `${MobileiPodMetrics.starEmptySize}px`,
                  'object-fit': 'contain'
                }}
              />
            }
          >
            <CGImage
              name="star_filled"
              style={{
                width: `${MobileiPodMetrics.starFilledWidth}px`,
                height: `${MobileiPodMetrics.starFilledHeight}px`,
                'object-fit': 'contain'
              }}
            />
          </Show>
        </button>
      )}
    </For>
  </div>
)

const TrackCell = (props: { text: string; align: 'left' | 'right' }) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      width: `${MobileiPodMetrics.trackNumberColumn}px`,
      'justify-content': props.align === 'left' ? 'flex-start' : 'flex-end',
      padding: '0 5px'
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileiPodMetrics.trackFontSize}px`,
        'font-weight': '700',
        color: 'white'
      }}
    >
      {props.text}
    </span>
  </div>
)

export const NowPlayingTracks = (props: {
  tracks: readonly MPMediaItem[]
  rating: number
  onRate: (value: number) => void
  onSelect: (track: MPMediaItem) => void
}) => (
  <div class="relative flex h-full w-full flex-col">
    <CGImage
      name="NowPlayingTableBackground"
      class="absolute inset-0"
      style={{ width: '100%', height: '100%', 'object-fit': 'cover' }}
    />
    <div class="relative">
      <RatingView rating={props.rating} onRate={props.onRate} />
    </div>

    <UIScrollView class="relative flex-1">
      <div
        class="pointer-events-none absolute inset-y-0"
        style={{
          left: `${MobileiPodMetrics.trackRuleInset}px`,
          width: `${MobileiPodMetrics.trackRule}px`,
          background: MobileiPodPalette.trackRule
        }}
      />
      <div
        class="pointer-events-none absolute inset-y-0"
        style={{
          right: `${MobileiPodMetrics.trackRuleInset}px`,
          width: `${MobileiPodMetrics.trackRule}px`,
          background: MobileiPodPalette.trackRule
        }}
      />
      <div
        style={{
          height: `${MobileiPodMetrics.trackRule}px`,
          background: MobileiPodPalette.trackRule
        }}
      />
      <For each={props.tracks}>
        {(track, at) => (
          <>
            <button
              type="button"
              class="relative flex w-full items-center"
              style={{
                height: `${MobileiPodMetrics.trackRowHeight - MobileiPodMetrics.trackRule}px`,
                background: at() % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.2)'
              }}
              onClick={() => props.onSelect(track)}
            >
              <TrackCell text={`${track.albumTrackNumber}.`} align="left" />
              <span
                class="min-w-0 flex-1 text-left"
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${MobileiPodMetrics.trackFontSize}px`,
                  'font-weight': '700',
                  color: 'white',
                  'padding-left': `${MobileiPodMetrics.trackTitleLeading}px`,
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}
              >
                {track.title}
              </span>
              <TrackCell text={formatTimeFor(track.playbackDuration)} align="right" />

              <Show when={nowPlayingItem()?.id === track.id}>
                <div
                  class="pointer-events-none absolute"
                  style={{ left: `${MobileiPodMetrics.trackPlayIconLeading}px` }}
                >
                  <CGImage
                    name="play"
                    style={{
                      height: `${MobileiPodMetrics.trackPlayIconHeight}px`,
                      width: 'auto',
                      'object-fit': 'contain',
                      filter:
                        'brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(2200%) hue-rotate(206deg) brightness(92%) contrast(92%)'
                    }}
                  />
                </div>
              </Show>
            </button>
            <div
              style={{
                height: `${MobileiPodMetrics.trackRule}px`,
                background: MobileiPodPalette.trackRule
              }}
            />
          </>
        )}
      </For>
    </UIScrollView>
  </div>
)
