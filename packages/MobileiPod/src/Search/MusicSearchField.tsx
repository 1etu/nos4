import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import {
  beginSearch,
  endSearch,
  searchEditing,
  searchQuery,
  setSearchQuery
} from './MusicSearch'

const UISystemFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

const editAnimation = caAnimation(
  MobileiPodMetrics.navDuration,
  CAMediaTimingFunction.easeInOut
)

export const MusicSearchField = (props: { noRightPadding: boolean }) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${MobileiPodMetrics.searchRowHeight}px`,
      background: MobileiPodPalette.searchBar,
      'box-shadow': `inset 0 ${MobileiPodMetrics.searchTopBorder}px 0 ${MobileiPodPalette.searchBarEdge}`
    }}
  >
    <div
      class="flex flex-1 items-center overflow-hidden"
      style={{
        'margin-left': `${MobileiPodMetrics.searchFieldLeading}px`,
        'margin-right': `${
          props.noRightPadding
            ? MobileiPodMetrics.searchFieldTrailing
            : MobileiPodMetrics.searchFieldTrailingWide
        }px`,
        'border-radius': '9999px',
        background: 'white',
        border: `0.33px solid ${MobileiPodPalette.searchFieldStroke}`,
        'box-shadow': 'inset 0 1px 3.2px rgba(0,0,0,0.7)',
        padding: `${MobileiPodMetrics.searchPaddingY}px ${MobileiPodMetrics.searchTrailInset}px ${MobileiPodMetrics.searchPaddingY}px ${MobileiPodMetrics.searchLeadInset}px`,
        gap: `${MobileiPodMetrics.searchContentSpacing}px`,
        transition: caTransition(['margin-right'], editAnimation)
      }}
    >
      <CGImage
        name="search_icon"
        class="shrink-0"
        style={{
          width: `${MobileiPodMetrics.searchIconSize}px`,
          height: `${MobileiPodMetrics.searchIconSize}px`,
          'margin-left': `${MobileiPodMetrics.searchIconLeading}px`,
          'object-fit': 'contain'
        }}
      />
      <input
        value={searchQuery()}
        placeholder="Search"
        spellcheck={false}
        autocomplete="off"
        onInput={(event) => setSearchQuery(event.currentTarget.value)}
        onFocus={beginSearch}
        style={{
          flex: '1',
          'min-width': '0',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          'font-family': UISystemFont,
          'font-size': `${MobileiPodMetrics.searchFontSize}px`,
          color: 'black'
        }}
      />
      <Show when={searchQuery().length > 0}>
        <button
          type="button"
          class="flex shrink-0 items-center"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setSearchQuery('')}
        >
          <CGImage name="UITextFieldClearButton" />
        </button>
      </Show>
    </div>

    <div
      class="shrink-0 overflow-hidden"
      style={{
        width: `${searchEditing() !== 'None' ? MobileiPodMetrics.cancelWidth + MobileiPodMetrics.cancelTrailing : 0}px`,
        transition: caTransition(['width'], editAnimation)
      }}
    >
      <button
        type="button"
        class="flex items-center justify-center"
        style={{
          width: `${MobileiPodMetrics.cancelWidth}px`,
          height: `${MobileiPodMetrics.cancelHeight}px`,
          'border-radius': `${MobileiPodMetrics.cancelRadius}px`,
          background: MobileiPodPalette.cancelButton,
          'box-shadow':
            'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={endSearch}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileiPodMetrics.cancelFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)'
          }}
        >
          Cancel
        </span>
      </button>
    </div>
  </div>
)
