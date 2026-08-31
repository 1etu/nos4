import { For, Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'
import {
  appStoreDateLabel,
  appStoreRatingsLabel,
  appStoreSizeLabel
} from '../Support/AppStoreService'
import type { AppStoreApplication } from '../Support/AppStoreTypes'
import { AppStoreStars } from '../Charts/AppStoreStars'
import { AppStoreScreenshotPager } from './AppStoreScreenshotPager'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const TellAFriend = 'Tell a Friend'
const AppSupport = 'App Support'

const Pill = (props: { width: number; children: JSX.Element }) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      width: `${props.width}px`,
      height: `${AppStoreMetrics.detailRowHeight}px`,
      'border-radius': `${AppStoreMetrics.detailRowRadius}px`,
      background: AppStorePalette.footerPillLight,
      border: `${AppStoreMetrics.detailRowStroke}px solid ${AppStorePalette.detailRowStroke}`,
      'box-shadow': AppStorePalette.footerPillShadow
    }}
  >
    {props.children}
  </div>
)

const PairLabel = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${AppStoreMetrics.detailRowFontSize}px`,
      'font-weight': '700',
      'line-height': '1',
      color: 'black'
    }}
  >
    {props.text}
  </span>
)

const MetadataRow = (props: { width: number; label: string; children: JSX.Element }) => (
  <div class="flex w-full items-start" style={{ gap: `${AppStoreMetrics.detailMetadataGap}px` }}>
    <span
      class="shrink-0 text-right"
      style={{
        width: `${props.width / 3}px`,
        'font-family': HelveticaNeue,
        'font-size': `${AppStoreMetrics.detailMetadataLabelFontSize}px`,
        'font-weight': '700',
        'line-height': '1.3',
        color: AppStorePalette.detailMetadataLabel
      }}
    >
      {props.label}
    </span>
    <div class="flex min-w-0 flex-1 flex-col items-start">{props.children}</div>
  </div>
)

const MetadataValue = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${AppStoreMetrics.detailMetadataValueFontSize}px`,
      'line-height': '1.3',
      'white-space': 'pre-line',
      color: 'black'
    }}
  >
    {props.text}
  </span>
)

export const AppStoreDetailView = (props: {
  width: number
  height: number
  application: AppStoreApplication
}) => {
  const ratingText = () =>
    props.application.advisories.length === 0
      ? props.application.contentAdvisoryRating
      : `Rated ${props.application.contentAdvisoryRating} for the following:`

  return (
    <UIScrollView class="h-full w-full" style={{ background: AppStorePalette.detailStage }}>
      <div
        class="flex w-full flex-col"
        style={{
          background: AppStorePalette.detailBackground,
          gap: `${AppStoreMetrics.stackSpacing}px`
        }}
      >
        <div
          class="relative w-full shrink-0"
          style={{
            height: `${AppStoreMetrics.detailIconStackHeight + AppStoreMetrics.stackSpacing}px`
          }}
        >
          <div
            class="absolute inset-x-0 top-0"
            style={{
              height: `${AppStoreMetrics.detailHeaderHeight + AppStoreMetrics.stackSpacing}px`,
              background: AppStorePalette.detailHeader
            }}
          />

          <div
            class="relative flex h-full w-full items-start"
            style={{
              gap: `${AppStoreMetrics.stackSpacing}px`,
              'padding-top': `${AppStoreMetrics.stackSpacing}px`
            }}
          >
          <div
            class="relative shrink-0 overflow-hidden"
            style={{
              width: `${AppStoreMetrics.detailIconSize + AppStoreMetrics.rowIconInset}px`,
              height: `${AppStoreMetrics.detailIconStackHeight}px`,
              transform: `translateY(${AppStoreMetrics.detailIconOffsetY}px)`
            }}
          >
            <img
              src={props.application.artworkUrl}
              alt=""
              draggable={false}
              class="absolute"
              style={{
                left: `${AppStoreMetrics.rowIconInset}px`,
                top: '0',
                width: `${AppStoreMetrics.detailIconSize}px`,
                height: `${AppStoreMetrics.detailIconSize}px`,
                'border-radius': `${AppStoreMetrics.rowIconRadius}px`,
                background: AppStorePalette.placeholder,
                'box-shadow': AppStorePalette.detailIconShadow
              }}
            />
            <img
              src={props.application.artworkUrl}
              alt=""
              draggable={false}
              class="absolute"
              style={{
                left: `${AppStoreMetrics.rowIconInset}px`,
                top: `${AppStoreMetrics.detailReflectionOffsetY}px`,
                width: `${AppStoreMetrics.detailIconSize}px`,
                height: `${AppStoreMetrics.detailIconSize}px`,
                'border-radius': `${AppStoreMetrics.rowIconRadius}px`,
                transform: 'scaleY(-1)',
                '-webkit-mask-image': AppStorePalette.detailReflectionMask,
                'mask-image': AppStorePalette.detailReflectionMask
              }}
            />
          </div>

          <div
            class="flex min-w-0 flex-1 flex-col items-start"
            style={{ gap: `${AppStoreMetrics.rowTextGap}px` }}
          >
            <span
              class="w-full text-left"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${AppStoreMetrics.detailTitleFontSize}px`,
                'font-weight': '700',
                'line-height': '1.2',
                color: 'black',
                'text-shadow': AppStorePalette.rowTextShadow
              }}
            >
              {props.application.trackName}
            </span>

            <div class="flex w-full items-start">
              <div
                class="flex min-w-0 flex-1 flex-col items-start"
                style={{ gap: `${AppStoreMetrics.rowTextGap}px` }}
              >
                <span
                  style={{
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
                <div
                  class="flex items-center"
                  style={{ gap: `${AppStoreMetrics.rowStarTrailGap}px` }}
                >
                  <AppStoreStars rating={props.application.averageUserRating} />
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${AppStoreMetrics.rowRatingsFontSize}px`,
                      'font-weight': '700',
                      'line-height': '1.2',
                      'white-space': 'nowrap',
                      color: AppStorePalette.rowArtist
                    }}
                  >
                    {appStoreRatingsLabel(props.application.userRatingCount)}
                  </span>
                </div>
              </div>

              <div
                class="flex shrink-0 items-center justify-center"
                style={{
                  height: `${AppStoreMetrics.detailBuyHeight}px`,
                  padding: `0 ${AppStoreMetrics.detailBuyPaddingX}px`,
                  'margin-right': `${AppStoreMetrics.detailBuyTrailInset}px`,
                  'border-radius': `${AppStoreMetrics.detailBuyRadius}px`,
                  background: AppStorePalette.detailBuy
                }}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${AppStoreMetrics.detailBuyFontSize}px`,
                    'font-weight': '700',
                    'line-height': '1',
                    'white-space': 'nowrap',
                    'text-transform': 'uppercase',
                    color: 'white',
                    'text-shadow': AppStorePalette.detailBuyShadow
                  }}
                >
                  {props.application.formattedPrice}
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div style={{ height: `${AppStoreMetrics.detailDescriptionGap}px` }} />

        <span
          class="self-center"
          style={{
            width: `${props.width - AppStoreMetrics.detailContentInset}px`,
            'font-family': HelveticaNeue,
            'font-size': `${AppStoreMetrics.detailDescriptionFontSize}px`,
            'line-height': '1.3',
            'white-space': 'pre-line',
            color: 'black'
          }}
        >
          {props.application.description}
        </span>

        <Show when={props.application.screenshotUrls.length > 0}>
          <AppStoreScreenshotPager
            width={props.width}
            height={props.height}
            screenshots={props.application.screenshotUrls}
          />
        </Show>

        <div class="flex w-full justify-center">
          <Pill width={props.width - AppStoreMetrics.detailContentInset}>
            <div
              class="flex w-full items-center"
              style={{ padding: `0 ${AppStoreMetrics.detailRowInset}px` }}
            >
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${AppStoreMetrics.detailRowFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  'white-space': 'nowrap',
                  color: 'black'
                }}
              >
                {appStoreRatingsLabel(props.application.userRatingCount)}
              </span>
              <div
                class="flex flex-1 items-center"
                style={{ 'padding-left': `${AppStoreMetrics.stackSpacing}px` }}
              >
                <AppStoreStars rating={props.application.averageUserRating} />
              </div>
              <CGImage name="UITableNext" />
            </div>
          </Pill>
        </div>

        <div
          class="flex w-full items-center justify-between"
          style={{ padding: `0 ${AppStoreMetrics.rowIconInset}px` }}
        >
          <Pill width={props.width / 2 - AppStoreMetrics.detailPairInset}>
            <div class="flex w-full items-center justify-center">
              <PairLabel text={TellAFriend} />
            </div>
          </Pill>
          <Pill width={props.width / 2 - AppStoreMetrics.detailPairInset}>
            <div class="flex w-full items-center justify-center">
              <PairLabel text={AppSupport} />
            </div>
          </Pill>
        </div>

        <div style={{ height: `${AppStoreMetrics.detailMetadataBlockGap}px` }} />

        <MetadataRow width={props.width} label="Company">
          <MetadataValue text={`${props.application.sellerName}\n${props.application.sellerUrl}`} />
        </MetadataRow>

        <div style={{ height: `${AppStoreMetrics.detailMetadataLineGap}px` }} />

        <MetadataRow width={props.width} label="Updated">
          <MetadataValue text={appStoreDateLabel(props.application.currentVersionReleaseDate)} />
        </MetadataRow>

        <MetadataRow width={props.width} label="Version">
          <MetadataValue text={props.application.version} />
        </MetadataRow>

        <MetadataRow width={props.width} label="Size">
          <MetadataValue text={appStoreSizeLabel(props.application.fileSizeBytes)} />
        </MetadataRow>

        <div style={{ height: `${AppStoreMetrics.detailMetadataLineGap}px` }} />

        <MetadataRow width={props.width} label="Rating">
          <MetadataValue text={ratingText()} />
          <For each={props.application.advisories}>
            {(advisory) => <MetadataValue text={advisory} />}
          </For>
        </MetadataRow>

        <div style={{ height: `${AppStoreMetrics.detailRatingBottomGap}px` }} />
      </div>
    </UIScrollView>
  )
}
