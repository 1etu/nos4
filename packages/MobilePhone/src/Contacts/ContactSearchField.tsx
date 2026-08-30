import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import {
  beginContactSearch,
  contactSearchIsActive,
  contactSearchQuery,
  endContactSearch,
  setContactSearchQuery
} from '../Support/ContactSearch'

const editAnimation = caAnimation(PhoneMetrics.searchDuration, CAMediaTimingFunction.easeInOut)

export const ContactSearchField = () => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${PhoneMetrics.searchRowHeight}px`,
      background: PhonePalette.searchBar,
      'box-shadow': `inset 0 ${PhoneMetrics.searchTopBorder}px 0 ${PhonePalette.searchBarEdge}`
    }}
  >
    <div
      class="flex flex-1 items-center overflow-hidden"
      style={{
        'margin-left': `${PhoneMetrics.searchFieldLeading}px`,
        'margin-right': `${
          contactSearchIsActive()
            ? PhoneMetrics.searchFieldTrailing
            : PhoneMetrics.searchFieldTrailingWide
        }px`,
        'border-radius': '9999px',
        background: 'white',
        border: `0.33px solid ${PhonePalette.searchFieldStroke}`,
        'box-shadow': 'inset 0 1px 3.2px rgba(0,0,0,0.7)',
        padding: `${PhoneMetrics.searchPaddingY}px ${PhoneMetrics.searchTrailInset}px ${PhoneMetrics.searchPaddingY}px ${PhoneMetrics.searchLeadInset}px`,
        gap: `${PhoneMetrics.searchContentSpacing}px`,
        transition: caTransition(['margin-right'], editAnimation)
      }}
      onClick={beginContactSearch}
    >
      <CGImage
        name="search_icon"
        class="shrink-0"
        style={{
          width: `${PhoneMetrics.searchIconSize}px`,
          height: `${PhoneMetrics.searchIconSize}px`,
          'margin-left': `${PhoneMetrics.searchIconLeading}px`,
          'object-fit': 'contain'
        }}
      />
      <span
        class="flex-1"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhoneMetrics.searchFontSize}px`,
          color: contactSearchQuery() === '' ? PhonePalette.subtitle : 'black',
          'white-space': 'nowrap',
          overflow: 'hidden'
        }}
      >
        {contactSearchQuery() === '' ? 'Search' : contactSearchQuery()}
      </span>
      <Show when={contactSearchQuery().length > 0}>
        <button
          type="button"
          class="flex shrink-0 items-center"
          onClick={() => setContactSearchQuery('')}
        >
          <CGImage name="UITextFieldClearButton" />
        </button>
      </Show>
    </div>

    <div
      class="shrink-0 overflow-hidden"
      style={{
        width: `${contactSearchIsActive() ? PhoneMetrics.cancelWidth + PhoneMetrics.cancelTrailing : 0}px`,
        transition: caTransition(['width'], editAnimation)
      }}
    >
      <button
        type="button"
        class="flex items-center justify-center"
        style={{
          width: `${PhoneMetrics.cancelWidth}px`,
          height: `${PhoneMetrics.cancelHeight}px`,
          'border-radius': `${PhoneMetrics.cancelRadius}px`,
          background: PhonePalette.cancelButton,
          'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
        }}
        onClick={endContactSearch}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${PhoneMetrics.cancelFontSize}px`,
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
