import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import type { CLPlacemark } from 'CoreLocation'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const detailFor = (place: CLPlacemark): string =>
  [place.thoroughfare, place.locality, place.administrativeArea, place.country]
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== place.name)
    .join(', ')

export const MapsSuggestionList = (props: {
  height: number
  suggestions: readonly CLPlacemark[]
  searching: boolean
  query: string
  onSelect: (place: CLPlacemark) => void
}) => (
  <div
    class="w-full overflow-y-auto"
    style={{
      height: `${props.height}px`,
      background: MapsPalette.suggestionFill,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`
    }}
  >
    <Show
      when={props.suggestions.length > 0}
      fallback={
        <Show when={props.query.trim().length > 0}>
          <div
            class="flex items-center"
            style={{
              height: `${MapsMetrics.suggestionRowHeight}px`,
              padding: `0 ${MapsMetrics.suggestionInsetX}px`,
              'font-family': HelveticaNeue,
              'font-size': `${MapsMetrics.suggestionDetailFontSize}px`,
              color: MapsPalette.suggestionDetail
            }}
          >
            {props.searching ? 'Searching…' : 'No Results'}
          </div>
        </Show>
      }
    >
      <For each={props.suggestions}>
        {(place, index) => (
          <button
            type="button"
            class="flex w-full items-center text-left"
            style={{
              height: `${MapsMetrics.suggestionRowHeight}px`,
              padding: `0 ${MapsMetrics.suggestionInsetX}px`,
              gap: `${MapsMetrics.suggestionGap}px`,
              background:
                index() % 2 === 0
                  ? MapsPalette.suggestionFill
                  : MapsPalette.suggestionAltFill,
              'border-bottom': `1px solid ${MapsPalette.suggestionSeparator}`
            }}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => props.onSelect(place)}
          >
            <CGImage
              name="SmallCurrentLoc"
              style={{
                width: `${MapsMetrics.suggestionGlyphSize}px`,
                height: `${MapsMetrics.suggestionGlyphSize}px`,
                'flex-shrink': '0',
                opacity: '0.55'
              }}
            />
            <span class="flex min-w-0 flex-col">
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${MapsMetrics.suggestionFontSize}px`,
                  'font-weight': '700',
                  color: MapsPalette.suggestionInk,
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}
              >
                {place.name}
              </span>
              <Show when={detailFor(place).length > 0}>
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${MapsMetrics.suggestionDetailFontSize}px`,
                    color: MapsPalette.suggestionDetail,
                    'white-space': 'nowrap',
                    overflow: 'hidden',
                    'text-overflow': 'ellipsis'
                  }}
                >
                  {detailFor(place)}
                </span>
              </Show>
            </span>
          </button>
        )}
      </For>
    </Show>
  </div>
)
