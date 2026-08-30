import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsEditingState, type MapsEditingStateValue } from '../Support/MapsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsSearchBar = (props: {
  value: string
  editing: MapsEditingStateValue
  onInput: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onSubmit: () => void
}) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${MapsMetrics.titleBarHeight}px`,
      background: MapsPalette.barGradient,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`,
      padding: `0 ${MapsMetrics.searchFieldInsetX}px`
    }}
  >
    <div
      class="relative flex flex-1 items-center"
      style={{
        height: `${MapsMetrics.searchFieldHeight}px`,
        background: 'white',
        'border-radius': `${MapsMetrics.searchFieldHeight / 2}px`,
        border: `0.33px solid ${MapsPalette.fieldStroke}`,
        'box-shadow': 'inset 0 1px 1.6px rgba(0,0,0,0.35)',
        padding: `0 ${MapsMetrics.searchIconInset}px`,
        gap: '6px'
      }}
    >
      <CGImage
        name="search_icon"
        style={{
          width: `${MapsMetrics.searchIconSize}px`,
          height: `${MapsMetrics.searchIconSize}px`,
          'flex-shrink': '0'
        }}
      />
      <input
        type="text"
        value={props.value}
        placeholder="Search or Address"
        enterkeyhint="search"
        class="min-w-0 flex-1 bg-transparent outline-none"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MapsMetrics.searchFontSize}px`,
          color: 'black'
        }}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return
          event.currentTarget.blur()
          props.onSubmit()
        }}
      />
      <Show
        when={props.value.length > 0 && props.editing !== MapsEditingState.none}
        fallback={
          <CGImage
            name="Bookmarks_Maps"
            style={{ 'flex-shrink': '0', 'margin-top': `${MapsMetrics.bookmarksTop}px` }}
          />
        }
      >
        <button type="button" class="shrink-0" onClick={() => props.onInput('')}>
          <CGImage name="UITextFieldClearButton" />
        </button>
      </Show>
    </div>
  </div>
)
