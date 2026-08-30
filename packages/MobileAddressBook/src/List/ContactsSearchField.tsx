import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const FieldHeight = 31

export const ContactsSearchField = (props: {
  value: string
  editing: boolean
  onInput: (value: string) => void
  onFocus: () => void
  onCancel: () => void
}) => (
  <div
    class="flex w-full shrink-0 items-center"
    style={{
      height: `${ContactsMetrics.searchRowHeight}px`,
      background: ContactsPalette.searchBar,
      'border-top': `${ContactsMetrics.searchTopBorder}px solid ${ContactsPalette.searchTopBorder}`,
      'padding-left': `${ContactsMetrics.searchFieldInset}px`,
      'padding-right': `${
        props.editing ? ContactsMetrics.searchFieldInset : ContactsMetrics.searchFieldTrailing
      }px`,
      gap: '5px'
    }}
  >
    <div
      class="flex min-w-0 flex-1 items-center"
      style={{
        height: `${FieldHeight}px`,
        background: 'white',
        'border-radius': `${FieldHeight / 2}px`,
        border: `0.33px solid ${ContactsPalette.searchStroke}`,
        'box-shadow': 'inset 0 1px 1.6px rgba(0,0,0,0.35)',
        padding: `0 ${ContactsMetrics.searchIconInset}px`,
        gap: '6px'
      }}
    >
      <CGImage
        name="search_icon"
        style={{
          width: `${ContactsMetrics.searchIconSize}px`,
          height: `${ContactsMetrics.searchIconSize}px`,
          'flex-shrink': '0'
        }}
      />
      <input
        type="text"
        value={props.value}
        placeholder="Search"
        class="min-w-0 flex-1 bg-transparent outline-none"
        style={{
          'font-family': HelveticaNeue,
          'font-size': '16px',
          color: 'black'
        }}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        onFocus={props.onFocus}
      />
      <Show when={props.value.length > 0}>
        <button type="button" class="shrink-0" onClick={() => props.onInput('')}>
          <CGImage name="UITextFieldClearButton" />
        </button>
      </Show>
    </div>

    <Show when={props.editing}>
      <button
        type="button"
        class="flex shrink-0 items-center justify-center"
        style={{
          width: `${ContactsMetrics.cancelWidth}px`,
          height: `${ContactsMetrics.cancelHeight}px`,
          'border-radius': '5.5px',
          background:
            'linear-gradient(180deg, rgb(164,175,191) 0%, rgb(124,141,164) 51%, rgb(113,131,156) 51%, rgb(112,130,155) 100%)',
          'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
        }}
        onClick={props.onCancel}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${ContactsMetrics.cancelFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.25px 1px rgba(0,0,0,0.75)'
          }}
        >
          Cancel
        </span>
      </button>
    </Show>
  </div>
)
