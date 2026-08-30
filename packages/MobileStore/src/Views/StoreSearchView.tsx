import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { StoreArtwork } from './StoreArtwork'
import { StorePriceButton } from './StorePriceButton'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'
import {
  storeSearchSections,
  type StoreItem,
  type StoreSearchRow
} from '../Support/StoreService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Secondary = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${StoreMetrics.resultSecondaryFontSize}px`,
      color: StorePalette.rowDetail,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'max-width': '100%'
    }}
  >
    {props.text}
  </span>
)

const ResultRow = (props: {
  item: StoreItem
  row: StoreSearchRow
  onSelect: (item: StoreItem) => void
}) => (
  <button
    type="button"
    class="flex w-full shrink-0 items-center overflow-hidden"
    style={{
      height: `${StoreMetrics.resultRowHeight - 1}px`,
      gap: `${StoreMetrics.rowArtGap}px`
    }}
    onClick={() => props.onSelect(props.item)}
  >
    <StoreArtwork
      item={props.item}
      size={StoreMetrics.resultArtSize}
      bordered
      placeholder="PlaceholderBig"
      style={{ background: 'black' }}
    />
    <div
      class="flex min-w-0 flex-1 flex-col items-start"
      style={{ gap: `${StoreMetrics.rowTextSpacing}px` }}
    >
      <Secondary text={props.item.artist} />
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${StoreMetrics.resultPrimaryFontSize}px`,
          'font-weight': '700',
          color: 'black',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'max-width': '100%'
        }}
      >
        {props.item.title}
      </span>
      <Show when={props.row === 'song'}>
        <Secondary text={props.item.collection ?? '---'} />
      </Show>
    </div>
    <div style={{ 'padding-right': `${StoreMetrics.chevronTrailing}px` }}>
      <Show when={props.row === 'song'} fallback={<CGImage name="UITableNext" />}>
        <StorePriceButton price={props.item.price ?? 0} />
      </Show>
    </div>
  </button>
)

export const StoreSearchView = (props: { onSelect: (item: StoreItem) => void }) => (
  <UIScrollView
    class="flex h-full w-full flex-col"
    style={{
      padding: `${StoreMetrics.contentPadding}px 0`,
      gap: `${StoreMetrics.sectionGap}px`
    }}
  >
    <For each={storeSearchSections()}>
      {(section) => (
        <div
          class="flex shrink-0 flex-col"
          style={{ gap: `${StoreMetrics.sectionInnerGap}px` }}
        >
          <span
            class="text-left"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${StoreMetrics.sectionTitleFontSize}px`,
              'font-weight': '700',
              color: StorePalette.searchSectionTitle,
              'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)',
              'padding-left': `${StoreMetrics.groupInsetX}px`
            }}
          >
            {section.title}
          </span>

          <div class="flex flex-col" style={{ gap: `${StoreMetrics.sectionHintGap}px` }}>
            <Show when={section.row === 'song'}>
              <span
                class="text-center"
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${StoreMetrics.sectionHintFontSize}px`,
                  color: StorePalette.searchHint,
                  'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)',
                  padding: `0 ${StoreMetrics.groupInsetX}px`
                }}
              >
                Tap to Preview, Double-Tap to View Album
              </span>
            </Show>

            <div style={{ padding: `0 ${StoreMetrics.groupInsetX}px` }}>
              <div
                class="flex flex-col overflow-hidden"
                style={{
                  background: 'white',
                  'border-radius': `${StoreMetrics.groupRadius}px`,
                  border: `${StoreMetrics.groupStroke}px solid ${StorePalette.groupStroke}`
                }}
              >
                <For each={section.items}>
                  {(item, at) => (
                    <>
                      <ResultRow item={item} row={section.row} onSelect={props.onSelect} />
                      <div
                        class="shrink-0"
                        style={{
                          height: '1px',
                          background:
                            at() < section.items.length - 1
                              ? StorePalette.rowSeparator
                              : 'transparent'
                        }}
                      />
                    </>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      )}
    </For>

    <Show when={storeSearchSections().length === 0}>
      <div class="shrink-0" style={{ height: '100%' }} />
    </Show>

    <div class="shrink-0" style={{ height: `${StoreMetrics.termsSpacing}px` }} />

    <div
      class="flex shrink-0 justify-center"
      style={{ 'padding-bottom': `${StoreMetrics.termsSpacing}px` }}
    >
      <span
        class="text-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${StoreMetrics.termsFontSize}px`,
          'font-weight': '700',
          color: StorePalette.terms,
          'text-shadow': '0 0.9px 0 rgba(255,255,255,0.7)'
        }}
      >
        iTunes Store Terms and Conditions...
      </span>
    </div>
  </UIScrollView>
)
