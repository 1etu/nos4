import { createSignal, For, onCleanup, Show } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import {
  TextInputIdentifier,
  UIKeyboardDidDelete,
  UIKeyboardDidInsert,
  UIKeyboardWillShow
} from 'TextInput'
import { assetURL, type AssetName } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { SearchApplications, type ApplicationRecord } from '../Support/Bundles'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const descending = (a: ApplicationRecord, b: ApplicationRecord): number => {
  if (a.displayName > b.displayName) return -1
  if (a.displayName < b.displayName) return 1
  return 0
}

const MagnifyingGlass = () => (
  <svg
    width={SpringBoardMetrics.searchIconSize}
    height={SpringBoardMetrics.searchIconSize}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="6.6" cy="6.6" r="5.1" stroke="gray" stroke-width="2" />
    <path d="M10.6 10.6 L15 15" stroke="gray" stroke-width="2" stroke-linecap="round" />
  </svg>
)

const ResultRow = (props: {
  app: ApplicationRecord
  index: number
  onLaunch: (app: ApplicationRecord) => void
}) => (
  <button
    type="button"
    class="block w-full"
    style={{
      height: `${SpringBoardMetrics.searchRowHeight}px`,
      background:
        props.index % 2 === 0
          ? SpringBoardMetrics.searchRowBackground
          : SpringBoardMetrics.searchRowAltBackground
    }}
    onClick={() => props.onLaunch(props.app)}
  >
    <div
      class="flex items-center"
      style={{
        height: `${SpringBoardMetrics.searchRowContentHeight}px`,
        gap: `${SpringBoardMetrics.searchRowStackSpacing}px`
      }}
    >
      <img
        src={assetURL(props.app.icon as AssetName)}
        alt=""
        draggable={false}
        style={{
          width: `${SpringBoardMetrics.searchRowIconSize}px`,
          height: `${SpringBoardMetrics.searchRowIconSize}px`,
          'margin-left': `${SpringBoardMetrics.searchRowIconLeading}px`
        }}
      />
      <div
        style={{
          width: '1px',
          height: `${SpringBoardMetrics.searchRowContentHeight}px`,
          background: SpringBoardMetrics.searchRuleLight,
          transform: `translateX(${SpringBoardMetrics.searchRowOffsetX}px)`
        }}
      />
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${SpringBoardMetrics.searchRowFontSize}px`,
          'font-weight': '700',
          color: 'black',
          transform: `translateX(${SpringBoardMetrics.searchRowOffsetX}px)`,
          'white-space': 'nowrap'
        }}
      >
        {props.app.displayName}
      </span>
    </div>
    <div style={{ height: '1px', background: SpringBoardMetrics.searchRuleDark }} />
    <div style={{ height: '1px', background: SpringBoardMetrics.searchRuleLight }} />
  </button>
)

export const SearchPage = (props: { onLaunch: (app: ApplicationRecord) => void }) => {
  const [query, setQuery] = createSignal('')

  onCleanup(
    NSNotificationCenter.addObserver(UIKeyboardDidInsert, (notification) => {
      setQuery(query() + notification.userInfo.text)
    })
  )

  onCleanup(
    NSNotificationCenter.addObserver(UIKeyboardDidDelete, () => {
      setQuery(query().slice(0, -1))
    })
  )

  const results = () => {
    const needle = query()
    if (needle.length === 0) return []
    return [...SearchApplications]
      .filter((app) => app.displayName.toLowerCase().includes(needle.toLowerCase()))
      .sort(descending)
  }

  return (
    <div class="flex h-full w-full flex-col">
      <div
        class="flex items-center"
        style={{
          'margin-left': `${SpringBoardMetrics.searchOuterPadding}px`,
          'margin-right': `${SpringBoardMetrics.searchOuterPadding}px`,
          background: 'white',
          'border-radius': '9999px',
          'box-shadow': 'inset 0 2px 2px rgba(0,0,0,0.28)',
          padding: `${SpringBoardMetrics.searchFieldPaddingY}px 0`
        }}
      >
        <div
          class="flex flex-1 items-center"
          style={{
            gap: `${SpringBoardMetrics.searchFieldSpacing}px`,
            'padding-left': `${SpringBoardMetrics.searchFieldLeadingInset}px`,
            'padding-right': `${SpringBoardMetrics.searchFieldTrailingGap}px`
          }}
        >
          <MagnifyingGlass />
          <input
            value={query()}
            readOnly
            onFocus={() =>
              NSNotificationCenter.post(UIKeyboardWillShow, TextInputIdentifier, {
                owner: 'search'
              })
            }
            onClick={() =>
              NSNotificationCenter.post(UIKeyboardWillShow, TextInputIdentifier, {
                owner: 'search'
              })
            }
            placeholder="Search iPhone"
            style={{
              flex: '1',
              height: `${SpringBoardMetrics.searchFieldTextHeight}px`,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              'font-family': HelveticaNeue,
              'font-size': `${SpringBoardMetrics.searchFieldFontSize}px`,
              color: 'black'
            }}
          />
        </div>
      </div>

      <div style={{ height: `${SpringBoardMetrics.searchFieldGap}px` }} />

      <Show when={results().length > 0}>
        <div
          class="flex-1 overflow-hidden"
          style={{
            'margin-left': `${SpringBoardMetrics.searchOuterPadding}px`,
            'margin-right': `${SpringBoardMetrics.searchOuterPadding}px`,
            'margin-bottom': `${SpringBoardMetrics.searchResultsBottomInset}px`,
            'border-radius': `${SpringBoardMetrics.searchResultsRadius}px`,
            background: SpringBoardMetrics.searchRowBackground
          }}
        >
          <UIScrollView class="h-full">
            <For each={results()}>
              {(app, index) => <ResultRow app={app} index={index()} onLaunch={props.onLaunch} />}
            </For>
          </UIScrollView>
        </div>
      </Show>
    </div>
  )
}
