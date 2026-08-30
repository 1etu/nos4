import { For } from 'solid-js'
import { UIBarButton, UINavigationBar, UIScrollView, UITableMetrics, UITablePalette } from 'UIKit'
import { WorldCities, type ClockCity } from '../Support/WorldClockStore'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CityChooser = (props: { onCancel: () => void; onChoose: (city: ClockCity) => void }) => (
  <div class="flex h-full w-full flex-col overflow-hidden" style={{ background: 'white' }}>
    <UINavigationBar
      title="Choose a City"
      leading={<UIBarButton title="Cancel" tone="gray" onClick={props.onCancel} />}
    />
    <UIScrollView class="flex-1">
      <For each={WorldCities}>
        {(city) => (
          <button
            type="button"
            class="flex w-full items-center"
            style={{
              height: `${UITableMetrics.rowHeight}px`,
              padding: `0 ${UITableMetrics.rowInsetX}px`,
              'border-bottom': `1px solid ${UITablePalette.groupStroke}`,
              background: 'white'
            }}
            onClick={() => props.onChoose(city)}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${UITableMetrics.rowFontSize}px`,
                'line-height': '1',
                color: 'black'
              }}
            >
              {city.name}
            </span>
          </button>
        )}
      </For>
    </UIScrollView>
  </div>
)
