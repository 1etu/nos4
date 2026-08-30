import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { StoreMetrics, StorePalette } from '../Support/StoreMetrics'

const UISystemFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export const StoreSearchField = (props: {
  value: string
  onInput: (value: string) => void
  onFocus: () => void
  onSubmit: () => void
}) => (
  <div class="flex w-full items-center" style={{ padding: `0 ${StoreMetrics.searchFieldInset}px` }}>
    <div
      class="flex flex-1 items-center overflow-hidden"
      style={{
        'border-radius': '9999px',
        background: 'white',
        border: `0.33px solid ${StorePalette.searchStroke}`,
        'box-shadow': 'inset 0 1px 3.2px rgba(0,0,0,0.7)',
        padding: `${StoreMetrics.searchPaddingY}px ${StoreMetrics.searchTrailInset}px ${StoreMetrics.searchPaddingY}px ${StoreMetrics.searchLeadInset}px`,
        gap: `${StoreMetrics.searchContentSpacing}px`
      }}
    >
      <CGImage
        name="search_icon"
        class="shrink-0"
        style={{
          width: `${StoreMetrics.searchIconSize}px`,
          height: `${StoreMetrics.searchIconSize}px`,
          'margin-left': `${StoreMetrics.searchIconLeading}px`,
          'object-fit': 'contain'
        }}
      />
      <input
        value={props.value}
        placeholder="Search"
        spellcheck={false}
        autocomplete="off"
        onInput={(event) => props.onInput(event.currentTarget.value)}
        onFocus={props.onFocus}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.currentTarget.blur()
          props.onSubmit()
        }}
        style={{
          flex: '1',
          'min-width': '0',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          'font-family': UISystemFont,
          'font-size': `${StoreMetrics.searchFontSize}px`,
          color: 'black'
        }}
      />
      <Show when={props.value.length > 0}>
        <button
          type="button"
          class="flex shrink-0 items-center"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => props.onInput('')}
        >
          <CGImage name="UITextFieldClearButton" />
        </button>
      </Show>
    </div>
  </div>
)
