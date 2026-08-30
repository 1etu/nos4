import { For, Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { StoreArtwork } from './StoreArtwork'
import { StoreAccountFooter, StoreSectionHeader } from './StoreListSection'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import { StoreCategories, storeNewMusic, type StoreItem } from '../Support/StoreService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const GroupBox = (props: { children: JSX.Element }) => (
  <div style={{ padding: `0 ${StoreMetrics.groupInsetX}px` }}>
    <div
      class="flex flex-col overflow-hidden"
      style={{
        background: 'white',
        'border-radius': `${StoreMetrics.groupRadius}px`,
        border: `${StoreMetrics.groupStroke}px solid ${StorePalette.groupStroke}`
      }}
    >
      {props.children}
    </div>
  </div>
)

const Line = (props: { text: string; size: number; bold: boolean; color: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${props.size}px`,
      'font-weight': props.bold ? '700' : '400',
      color: props.color,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'max-width': '100%'
    }}
  >
    {props.text}
  </span>
)

export const StoreMusicView = (props: {
  segment: number
  onOpenAlbum: (album: StoreItem) => void
}) => (
  <div
    class="flex flex-col"
    style={{ padding: `${StoreMetrics.contentPadding}px 0` }}
  >
    <Show when={props.segment === 0}>
      <div style={{ height: '10px' }} />
      <StoreSectionHeader title="New Music" />
      <div style={{ height: '10px' }} />

      <GroupBox>
        <For each={storeNewMusic()}>
          {(album, at) => (
            <>
              <button
                type="button"
                class="flex w-full items-center"
                style={{ height: `${StoreMetrics.albumRowHeight}px` }}
                onClick={() => props.onOpenAlbum(album)}
              >
                <StoreArtwork
                  item={album}
                  size={StoreMetrics.albumArtSize}
                  bordered
                />
                <div
                  class="flex min-w-0 flex-1 flex-col items-start"
                  style={{
                    'padding-left': `${StoreMetrics.rowArtGap}px`,
                    gap: `${StoreMetrics.rowTextSpacing}px`
                  }}
                >
                  <Line
                    text={album.artist}
                    size={StoreMetrics.rowArtistFontSize}
                    bold
                    color={StorePalette.rowDetail}
                  />
                  <Line
                    text={album.title}
                    size={StoreMetrics.rowTitleFontSize}
                    bold
                    color="black"
                  />
                  <Line
                    text="0 Ratings"
                    size={StoreMetrics.rowDetailFontSize}
                    bold={false}
                    color={StorePalette.rowDetail}
                  />
                </div>
                <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
                  <CGImage name="UITableNext" />
                </div>
              </button>
              <Show when={at() < storeNewMusic().length - 1}>
                <div style={{ height: '1px', background: StorePalette.rowSeparator }} />
              </Show>
            </>
          )}
        </For>
      </GroupBox>
    </Show>

    <Show when={props.segment === 1}>
      <GroupBox>
        <For each={StoreCategories}>
          {(category, at) => (
            <>
              <button
                type="button"
                class="flex w-full items-center"
                style={{ height: `${StoreMetrics.categoryRowHeight}px` }}
              >
                <StoreArtwork item={undefined} size={StoreMetrics.categoryArtSize} bordered />
                <div
                  class="flex min-w-0 flex-1 items-center"
                  style={{ 'padding-left': `${StoreMetrics.rowArtGap}px` }}
                >
                  <Line
                    text={category.name}
                    size={StoreMetrics.rowTitleFontSize}
                    bold
                    color="black"
                  />
                </div>
                <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
                  <CGImage name="UITableNext" />
                </div>
              </button>
              <Show when={at() < StoreCategories.length - 1}>
                <div style={{ height: '1px', background: StorePalette.rowSeparator }} />
              </Show>
            </>
          )}
        </For>
      </GroupBox>
    </Show>

    <div style={{ height: `${StoreMetrics.sectionSpacing}px` }} />
    <StoreAccountFooter />
    <div style={{ height: `${StoreMetrics.termsSpacing}px` }} />
  </div>
)
