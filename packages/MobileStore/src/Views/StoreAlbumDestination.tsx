import { For, Show } from 'solid-js'
import { CGImage, assetPointSize, assetURL } from 'CoreGraphics'
import { StoreArtwork } from './StoreArtwork'
import { StorePriceButton } from './StorePriceButton'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import { releaseDateLabel, type StoreItem } from '../Support/StoreService'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Detail = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${StoreMetrics.albumDetailFontSize}px`,
      'font-weight': '700',
      color: StorePalette.rowDetail,
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

const heroTop = (StoreMetrics.albumHeroFrame - StoreMetrics.albumHeroSize) / 2

const reflection = `linear-gradient(to bottom, transparent 0%, transparent ${StoreMetrics.albumReflectionStart}%, rgba(0,0,0,${StoreMetrics.albumReflectionAlpha}) 100%)`

export const StoreAlbumDestination = (props: { album: StoreItem }) => (
  <UIScrollView class="h-full w-full" style={{ background: StorePalette.albumBackdrop }}>
    <div class="flex items-start">
      <div
        class="relative shrink-0 overflow-hidden"
        style={{
          width: `${StoreMetrics.albumHeroSize}px`,
          height: `${StoreMetrics.albumHeroFrame}px`,
          'margin-left': `${StoreMetrics.groupInsetX}px`
        }}
      >
        <StoreArtwork
          item={props.album}
          size={StoreMetrics.albumHeroSize}
          style={{ position: 'absolute', left: '0', top: `${heroTop}px` }}
        />
        <StoreArtwork
          item={props.album}
          size={StoreMetrics.albumHeroSize}
          style={{
            position: 'absolute',
            left: '0',
            top: `${heroTop + StoreMetrics.albumHeroSize}px`,
            transform: 'scaleY(-1)',
            '-webkit-mask-image': reflection,
            'mask-image': reflection
          }}
        />
      </div>

      <div
        class="flex min-w-0 flex-1 flex-col items-start"
        style={{
          'padding-top': `${StoreMetrics.albumInfoTop}px`,
          'padding-left': `${StoreMetrics.rowArtGap}px`,
          gap: `${StoreMetrics.rowTextSpacing}px`
        }}
      >
        <div class="shrink-0" style={{ height: `${StoreMetrics.albumInfoLead}px` }} />
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${StoreMetrics.albumArtistFontSize}px`,
            'font-weight': '700',
            color: 'black',
            'white-space': 'nowrap'
          }}
        >
          {props.album.artist}
        </span>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${StoreMetrics.albumTitleFontSize}px`,
            'font-weight': '700',
            color: 'black',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'max-width': '100%'
          }}
        >
          {props.album.title}
        </span>
        <Detail text={`Genre: ${props.album.genre ?? ''}`} />
        <Detail text={`Released ${releaseDateLabel(props.album.released)}`} />
        <Detail text={`${props.album.tracks?.length ?? 0} Songs`} />
        <Show when={props.album.price !== undefined}>
          <StorePriceButton price={props.album.price ?? 0} />
        </Show>
        <div class="shrink-0" style={{ height: `${StoreMetrics.albumInfoTrail}px` }} />
      </div>
    </div>

    <button
      type="button"
      class="flex w-full flex-col"
      style={{
        height: `${StoreMetrics.trackRowHeight}px`,
        background: StorePalette.trackOdd
      }}
    >
      <div
        class="w-full shrink-0"
        style={{ height: '1px', background: StorePalette.albumRule }}
      />
      <div class="flex w-full flex-1 items-center">
        <div
          class="flex items-center"
          style={{
            'padding-left': `${StoreMetrics.ratingLeading}px`,
            gap: `${StoreMetrics.ratingSpacing}px`,
            transform: `translateY(${StoreMetrics.ratingOffsetY}px)`
          }}
        >
          <For each={[0, 1, 2, 3, 4]}>
            {() => <CGImage name="UserRatingBorderedStarsBackground" />}
          </For>
        </div>
        <div class="flex-1" />
        <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
          <CGImage name="UITableNext" />
        </div>
      </div>
      <div class="w-full shrink-0" style={{ height: '1px' }} />
    </button>

    <div class="relative">
      <div
        class="pointer-events-none absolute inset-y-0"
        style={{
          left: `${StoreMetrics.trackRuleInset}px`,
          width: '1px',
          background: StorePalette.albumRule
        }}
      />
      <div style={{ height: '1px', background: StorePalette.albumRule }} />
      <For each={props.album.tracks ?? []}>
        {(track, at) => (
          <>
            <button
              type="button"
              class="flex w-full items-center"
              style={{
                height: `${StoreMetrics.trackRowHeight - 1}px`,
                background: at() % 2 === 0 ? StorePalette.trackEven : StorePalette.trackOdd
              }}
            >
              <div
                class="flex shrink-0 items-center justify-center"
                style={{ width: `${StoreMetrics.trackNumberColumn}px` }}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${StoreMetrics.trackFontSize}px`,
                    'font-weight': '700',
                    color: 'black'
                  }}
                >
                  {track.number}
                </span>
              </div>
              <span
                class="min-w-0 flex-1 text-left"
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${StoreMetrics.trackFontSize}px`,
                  'font-weight': '700',
                  color: 'black',
                  'padding-left': `${StoreMetrics.trackTitleLeading}px`,
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}
              >
                {track.title}
              </span>
              <Show when={track.explicit}>
                <div
                  class="shrink-0"
                  style={{
                    width: `${StoreMetrics.explicitWidth}px`,
                    height: `${(StoreMetrics.explicitWidth * assetPointSize('Explicit').height) / assetPointSize('Explicit').width}px`,
                    'margin-right': '5px',
                    background: StorePalette.explicit,
                    '-webkit-mask-image': `url(${assetURL('Explicit')})`,
                    'mask-image': `url(${assetURL('Explicit')})`,
                    '-webkit-mask-repeat': 'no-repeat',
                    'mask-repeat': 'no-repeat',
                    '-webkit-mask-size': 'contain',
                    'mask-size': 'contain',
                    '-webkit-mask-position': 'center',
                    'mask-position': 'center'
                  }}
                />
              </Show>
              <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
                <StorePriceButton price={track.price} />
              </div>
            </button>
            <div style={{ height: '1px', background: StorePalette.albumRule }} />
          </>
        )}
      </For>
    </div>

    <div
      class="flex items-center"
      style={{ padding: `${StoreMetrics.contentPadding}px ${StoreMetrics.groupInsetX}px` }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${StoreMetrics.copyrightFontSize}px`,
          color: StorePalette.copyright
        }}
      >
        {props.album.copyright ?? ''}
      </span>
    </div>
  </UIScrollView>
)
