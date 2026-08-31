import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import { appStoreRatingsLabel } from '../Support/AppStoreService'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import { AppStoreStars } from './AppStoreStars'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const UniversalFeature = 'iosUniversal'

const clipped = {
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
} as const

export const AppStoreRow = (props: {
  application: AppStoreApplication
  index: number
  rank?: number
  onOpen: (application: AppStoreApplication) => void
}) => {
  const even = () => props.index % 2 === 0
  const title = () =>
    props.rank === undefined
      ? props.application.trackName
      : `${props.rank}. ${props.application.trackName}`

  return (
    <button
      type="button"
      class="flex w-full flex-col"
      style={{
        height: `${AppStoreMetrics.rowHeight}px`,
        background: even() ? AppStorePalette.rowEven : AppStorePalette.rowOdd
      }}
      onClick={() => props.onOpen(props.application)}
    >
      <div class="flex min-h-0 w-full flex-1 items-center">
        <img
          src={props.application.artworkUrl}
          alt=""
          draggable={false}
          class="shrink-0"
          style={{
            width: `${AppStoreMetrics.rowIconSize}px`,
            height: `${AppStoreMetrics.rowIconSize}px`,
            'margin-left': `${AppStoreMetrics.rowIconInset}px`,
            'border-radius': `${AppStoreMetrics.rowIconRadius}px`,
            background: AppStorePalette.placeholder,
            'box-shadow': AppStorePalette.rowIconShadow
          }}
        />

        <div
          class="flex min-w-0 flex-1 flex-col items-start"
          style={{
            gap: `${AppStoreMetrics.rowTextGap}px`,
            'padding-left': `${AppStoreMetrics.rowIconInset}px`
          }}
        >
          <span
            class="w-full text-left"
            style={{
              ...clipped,
              'font-family': HelveticaNeue,
              'font-size': `${AppStoreMetrics.rowArtistFontSize}px`,
              'font-weight': '700',
              'line-height': '1.2',
              color: AppStorePalette.rowArtist,
              'text-shadow': AppStorePalette.rowTextShadow
            }}
          >
            {props.application.artistName}
          </span>
          <span
            class="w-full text-left"
            style={{
              ...clipped,
              'font-family': HelveticaNeue,
              'font-size': `${AppStoreMetrics.rowTitleFontSize}px`,
              'font-weight': '700',
              'line-height': '1.2',
              color: 'black',
              'text-shadow': AppStorePalette.rowTextShadow
            }}
          >
            {title()}
          </span>
          <div class="flex items-center" style={{ gap: `${AppStoreMetrics.rowStarTrailGap}px` }}>
            <AppStoreStars rating={props.application.averageUserRating} />
            <span
              style={{
                ...clipped,
                'font-family': HelveticaNeue,
                'font-size': `${AppStoreMetrics.rowRatingsFontSize}px`,
                'line-height': '1.2',
                color: AppStorePalette.rowArtist,
                'text-shadow': AppStorePalette.rowTextShadow
              }}
            >
              {appStoreRatingsLabel(props.application.userRatingCount)}
            </span>
          </div>
        </div>

        <div
          class="flex shrink-0 items-center"
          style={{
            gap: `${AppStoreMetrics.rowTrailGap}px`,
            'padding-right': `${AppStoreMetrics.rowTrailInset}px`
          }}
        >
          <Show when={props.application.features.includes(UniversalFeature)}>
            <CGImage
              name="UniversalGlyph"
              style={{ transform: `translateY(${AppStoreMetrics.rowGlyphOffsetY}px)` }}
            />
          </Show>
          <span
            style={{
              ...clipped,
              'font-family': HelveticaNeue,
              'font-size': `${AppStoreMetrics.rowPriceFontSize}px`,
              'font-weight': '700',
              'line-height': '1.2',
              'text-transform': 'uppercase',
              color: AppStorePalette.rowPrice,
              'text-shadow': AppStorePalette.rowTextShadow
            }}
          >
            {props.application.formattedPrice}
          </span>
          <CGImage name="UITableNext" />
        </div>
      </div>

      <div
        class="w-full shrink-0"
        style={{
          height: `${AppStoreMetrics.rowSeparator}px`,
          background: even()
            ? AppStorePalette.rowSeparatorTopEven
            : AppStorePalette.rowSeparatorTopOdd
        }}
      />
      <div
        class="w-full shrink-0"
        style={{
          height: `${AppStoreMetrics.rowSeparator}px`,
          background: even()
            ? AppStorePalette.rowSeparatorBottomEven
            : AppStorePalette.rowSeparatorBottomOdd
        }}
      />
    </button>
  )
}
