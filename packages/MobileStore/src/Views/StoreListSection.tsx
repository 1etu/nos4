import { For, Show, createSignal } from 'solid-js'
import { CGImage, assetURL } from 'CoreGraphics'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import { type StoreItem } from '../Support/StoreService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Artwork = (props: { url: string; size: number }) => {
  const [failed, setFailed] = createSignal(false)
  return (
    <img
      src={failed() || props.url.length === 0 ? assetURL('noartplaceholder') : props.url}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
      class="shrink-0"
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        'object-fit': 'cover',
        'border-right': `1px solid ${StorePalette.artBorder}`
      }}
    />
  )
}

export const StoreSectionHeader = (props: { title: string }) => (
  <div
    class="flex items-center"
    style={{ padding: `0 ${StoreMetrics.sectionHeaderInsetX}px` }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${StoreMetrics.sectionHeaderFontSize}px`,
        'font-weight': '700',
        color: StorePalette.sectionHeader,
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
      }}
    >
      {props.title}
    </span>
  </div>
)

export const StoreListSection = (props: {
  items: readonly StoreItem[]
  rowHeight: number
  artSize: number
  detail?: (item: StoreItem) => string
  onSelect: (item: StoreItem) => void
}) => (
  <div style={{ padding: `0 ${StoreMetrics.groupInsetX}px` }}>
    <div
      class="flex flex-col overflow-hidden"
      style={{
        background: 'white',
        'border-radius': `${StoreMetrics.groupRadius}px`,
        border: `${StoreMetrics.groupStroke}px solid ${StorePalette.groupStroke}`
      }}
    >
      <For each={props.items}>
        {(item, at) => (
          <>
            <button
              type="button"
              class="flex w-full items-center"
              style={{ height: `${props.rowHeight}px` }}
              onClick={() => props.onSelect(item)}
            >
              <Artwork url={item.artwork} size={props.artSize} />
              <div
                class="flex min-w-0 flex-1 flex-col items-start"
                style={{
                  'padding-left': '10px',
                  gap: `${StoreMetrics.rowTextSpacing}px`
                }}
              >
                <Show when={props.detail}>
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${StoreMetrics.rowArtistFontSize}px`,
                      'font-weight': '700',
                      color: StorePalette.rowDetail,
                      'white-space': 'nowrap'
                    }}
                  >
                    {item.artist}
                  </span>
                </Show>
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${StoreMetrics.rowTitleFontSize}px`,
                    'font-weight': '700',
                    color: 'black',
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis',
                    'max-width': '100%'
                  }}
                >
                  {item.title}
                </span>
                <Show when={props.detail}>
                  {(format) => (
                    <span
                      style={{
                        'font-family': HelveticaNeue,
                        'font-size': `${StoreMetrics.rowDetailFontSize}px`,
                        color: StorePalette.rowDetail,
                        'white-space': 'nowrap'
                      }}
                    >
                      {format()(item)}
                    </span>
                  )}
                </Show>
              </div>
              <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
                <CGImage name="UITableNext" />
              </div>
            </button>
            <Show when={at() < props.items.length - 1}>
              <div style={{ height: '1px', background: StorePalette.rowSeparator }} />
            </Show>
          </>
        )}
      </For>
    </div>
  </div>
)

export const StoreAccountFooter = () => (
  <div class="flex flex-col items-center">
    <div
      class="flex items-center justify-center"
      style={{
        width: `calc(100% - ${StoreMetrics.groupInsetX * 2}px)`,
        height: `${StoreMetrics.accountHeight}px`,
        background: StorePalette.account,
        'border-radius': `${StoreMetrics.accountRadius}px`,
        border: `0.5px solid ${StorePalette.accountStroke}`
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${StoreMetrics.accountFontSize}px`,
          'font-weight': '700',
          color: 'black',
          'text-shadow': '0 0.9px 0 rgba(255,255,255,0.4)',
          'white-space': 'pre'
        }}
      >
        {'Apple ID: '}
        <span style={{ color: StorePalette.accountEmail }}>nos4@mac.com</span>
      </span>
    </div>

    <div style={{ height: `${StoreMetrics.termsSpacing}px` }} />

    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${StoreMetrics.termsFontSize}px`,
        'font-weight': '700',
        color: StorePalette.terms,
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.7)',
        'text-align': 'center'
      }}
    >
      iTunes Store Terms and Conditions...
    </span>
  </div>
)
