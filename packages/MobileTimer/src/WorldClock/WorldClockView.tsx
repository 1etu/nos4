import { createSignal, For, onCleanup, onMount, Show } from 'solid-js'
import { UIBarButton, UINavigationBar, UIScrollView } from 'UIKit'
import { ClockPalette } from '../Support/ClockMetrics'
import {
  addWorldClockCity,
  removeWorldClockCity,
  worldClockCities,
  type ClockCity
} from '../Support/WorldClockStore'
import { CityChooser } from './CityChooser'
import { WorldClockRow } from './WorldClockRow'

const TickInterval = 1000

export const WorldClockView = () => {
  const [now, setNow] = createSignal(new Date())
  const [editing, setEditing] = createSignal(false)
  const [choosing, setChoosing] = createSignal(false)

  onMount(() => {
    const timer = setInterval(() => setNow(new Date()), TickInterval)
    onCleanup(() => clearInterval(timer))
  })

  const choose = (city: ClockCity) => {
    addWorldClockCity(city)
    setChoosing(false)
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UINavigationBar
        title="World Clock"
        leading={
          <UIBarButton
            title={editing() ? 'Done' : 'Edit'}
            tone={editing() ? 'blue' : 'gray'}
            onClick={() => setEditing(!editing())}
          />
        }
        trailing={
          <UIBarButton title="+" tone="gray" onClick={() => setChoosing(true)} />
        }
      />

      <UIScrollView class="flex-1" style={{ background: ClockPalette.listBackground }}>
        <For each={worldClockCities()}>
          {(city) => (
            <WorldClockRow
              city={city}
              now={now()}
              editing={editing()}
              onDelete={() => removeWorldClockCity(city.id)}
            />
          )}
        </For>
      </UIScrollView>

      <Show when={choosing()}>
        <div class="absolute inset-0">
          <CityChooser onCancel={() => setChoosing(false)} onChoose={choose} />
        </div>
      </Show>
    </div>
  )
}
