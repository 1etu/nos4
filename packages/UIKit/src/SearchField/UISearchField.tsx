import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UISearchFieldMetrics, UISearchFieldPalette } from './UISearchFieldMetrics'

const UISystemFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

export const UISearchField = (props: {
  value: string
  placeholder?: string
  onInput: (value: string) => void
  onFocus: () => void
  onSubmit: () => void
}) => (
  <div class="flex w-full items-center" style={{ padding: `0 ${UISearchFieldMetrics.inset}px` }}>
    <div
      class="flex flex-1 items-center overflow-hidden"
      style={{
        'border-radius': '9999px',
        background: 'white',
        border: `${UISearchFieldMetrics.stroke}px solid ${UISearchFieldPalette.stroke}`,
        'box-shadow': UISearchFieldPalette.innerShadow,
        padding: `${UISearchFieldMetrics.paddingY}px ${UISearchFieldMetrics.trailInset}px ${UISearchFieldMetrics.paddingY}px ${UISearchFieldMetrics.leadInset}px`,
        gap: `${UISearchFieldMetrics.contentSpacing}px`
      }}
    >
      <CGImage
        name="search_icon"
        class="shrink-0"
        style={{
          width: `${UISearchFieldMetrics.iconSize}px`,
          height: `${UISearchFieldMetrics.iconSize}px`,
          'margin-left': `${UISearchFieldMetrics.iconLeading}px`,
          'object-fit': 'contain'
        }}
      />
      <input
        value={props.value}
        placeholder={props.placeholder ?? 'Search'}
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
          'font-size': `${UISearchFieldMetrics.fontSize}px`,
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
