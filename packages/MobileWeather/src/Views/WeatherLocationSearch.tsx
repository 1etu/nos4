import { createSignal, For, onCleanup } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { WeatherMetrics, WeatherPalette } from '../Support/WeatherMetrics'
import { searchLocations, type WeatherLocation } from '../Support/WeatherService'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const PromptIdle = 'Type the City, State, or ZIP code:'
const PromptValidating = 'Validating City...'

export const WeatherLocationSearch = (props: {
  onCancel: () => void
  onSelect: (location: WeatherLocation) => void
}) => {
  const [query, setQuery] = createSignal('')
  const [results, setResults] = createSignal<readonly WeatherLocation[]>([])
  const [validating, setValidating] = createSignal(false)

  let elapsed = 0
  let shouldSearch = false

  const tick = setInterval(() => {
    elapsed += WeatherMetrics.searchTickInterval
    if (elapsed < WeatherMetrics.searchDebounce || !shouldSearch) return
    if (query().trim().length === 0) return
    shouldSearch = false
    void searchLocations(query()).then((found) => {
      setResults(found)
      setValidating(false)
    })
  }, WeatherMetrics.searchTickInterval * 1000)

  onCleanup(() => clearInterval(tick))

  const onInput = (value: string) => {
    setQuery(value)
    elapsed = 0
    shouldSearch = true
    setValidating(value.trim().length > 0)
    if (value.trim().length === 0) setResults([])
  }

  return (
    <div class="flex h-full w-full flex-col" style={{ background: 'white' }}>
      <div
        class="relative flex flex-col"
        style={{ height: `${WeatherMetrics.searchBarHeight}px`, 'flex-shrink': '0' }}
      >
        <div
          class="absolute inset-0"
          style={{
            background: WeatherPalette.searchBarGradient,
            'border-bottom': `1px solid ${WeatherPalette.barBorderBottom}`
          }}
        />

        <div
          class="relative flex justify-center"
          style={{ 'padding-top': `${WeatherMetrics.searchPromptPaddingTop}px` }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${WeatherMetrics.searchPromptFontSize}px`,
              color: WeatherPalette.searchPrompt,
              'text-shadow': '0 -1px 0 rgba(0,0,0,0.9)',
              padding: `0 ${WeatherMetrics.searchPromptInsetX}px`,
              'white-space': 'nowrap'
            }}
          >
            {validating() ? PromptValidating : PromptIdle}
          </span>
        </div>

        <div class="relative mt-auto flex items-center" style={{ padding: `0 ${WeatherMetrics.rowInset}px ${WeatherMetrics.rowInset}px` }}>
          <div
            class="flex flex-1 items-center"
            style={{
              height: `${WeatherMetrics.searchFieldHeight}px`,
              'border-radius': '9999px',
              background: 'white',
              'box-shadow': 'inset 0 2px 2px rgba(0,0,0,0.28)',
              gap: `${WeatherMetrics.searchFieldSpacing}px`,
              'padding-left': `${WeatherMetrics.searchFieldLeadingInset}px`,
              'padding-right': `${WeatherMetrics.rowInset}px`
            }}
          >
            <img
              src={assetURL('search_icon')}
              alt=""
              draggable={false}
              style={{ width: '15px', height: '15px' }}
            />
            <input
              value={query()}
              onInput={(event) => onInput(event.currentTarget.value)}
              style={{
                flex: '1',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                'font-family': HelveticaNeue,
                'font-size': `${WeatherMetrics.searchFieldFontSize}px`,
                color: 'black'
              }}
            />
          </div>

          <button
            type="button"
            class="flex items-center justify-center"
            style={{
              height: `${WeatherMetrics.toolBarButtonHeight}px`,
              padding: `0 ${WeatherMetrics.toolBarButtonPaddingX}px`,
              'border-radius': `${WeatherMetrics.toolBarButtonRadius}px`,
              background: WeatherPalette.buttonTone.black,
              'margin-left': `${WeatherMetrics.rowInset}px`,
              'margin-right': `${WeatherMetrics.cancelTrailing}px`
            }}
            onClick={props.onCancel}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${WeatherMetrics.toolBarButtonFontSize}px`,
                'font-weight': '700',
                color: 'white'
              }}
            >
              Cancel
            </span>
          </button>
        </div>
      </div>

      <UIScrollView class="flex-1">
        <For each={results()}>
          {(location) => (
            <button
              type="button"
              class="block w-full text-left"
              onClick={() => props.onSelect(location)}
            >
              <div
                class="flex items-center"
                style={{
                  height: `${WeatherMetrics.settingsRowHeight - WeatherMetrics.hairline}px`,
                  'padding-left': `${WeatherMetrics.rowInset}px`
                }}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${WeatherMetrics.settingsRowFontSize}px`,
                    'font-weight': '700',
                    color: 'black',
                    'padding-right': `${WeatherMetrics.settingsInsetX}px`,
                    'white-space': 'nowrap',
                    overflow: 'hidden'
                  }}
                >
                  {location.name}
                </span>
              </div>
              <div
                style={{
                  height: `${WeatherMetrics.hairline}px`,
                  background: WeatherPalette.rowSeparator
                }}
              />
            </button>
          )}
        </For>
      </UIScrollView>
    </div>
  )
}
