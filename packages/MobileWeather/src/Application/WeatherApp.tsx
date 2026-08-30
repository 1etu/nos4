import { createSignal, For, onMount } from 'solid-js'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { UIStatusBar, UIStatusBarMetrics } from 'UIKit'
import { WeatherPage } from '../Views/WeatherPage'
import { WeatherSettings } from '../Views/WeatherSettings'
import { WeatherMetrics } from '../Support/WeatherMetrics'
import {
  addWeatherLocation,
  loadAllWeather,
  removeWeatherLocation,
  setWeatherUnit,
  weatherLocations,
  weatherReadings,
  weatherUnit
} from '../Support/WeatherService'

const SwipeThreshold = 45
const EdgeResistance = 0.35
const DotSize = 7.5
const DotSpacing = 10
const DotBottom = 25
const DotTopSpacer = 25
const IdleDotOpacity = 0.25
const FlipPerspective = 900

const pageAnimation = caAnimation(WeatherMetrics.flipDuration, CAMediaTimingFunction.easeInOut)
const flipOut = caAnimation(WeatherMetrics.flipDuration, CAMediaTimingFunction.easeIn)
const flipIn = caAnimation(WeatherMetrics.flipDuration, CAMediaTimingFunction.easeOut)

export const WeatherApp = (props: { height: number; width: number }) => {
  const [page, setPage] = createSignal(0)
  const [drag, setDrag] = createSignal(0)
  const [switchToSettings, setSwitchToSettings] = createSignal(false)
  const [showSettings, setShowSettings] = createSignal(false)
  let origin: number | undefined

  onMount(() => {
    void loadAllWeather()
  })

  const count = () => weatherLocations().length

  const onPointerDown = (event: PointerEvent) => {
    origin = event.clientX
  }

  const onPointerMove = (event: PointerEvent) => {
    if (origin === undefined) return
    setDrag(event.clientX - origin)
  }

  const onPointerUp = () => {
    if (origin === undefined) return
    const travelled = drag()
    origin = undefined
    setDrag(0)
    if (travelled <= -SwipeThreshold) setPage(Math.min(page() + 1, count() - 1))
    if (travelled >= SwipeThreshold) setPage(Math.max(page() - 1, 0))
  }

  const trackOffset = () => {
    const raw = drag()
    const atStart = page() === 0 && raw > 0
    const atEnd = page() === count() - 1 && raw < 0
    const travel = atStart || atEnd ? raw * EdgeResistance : raw
    return `calc(-${(page() * 100) / count()}% + ${travel}px)`
  }

  const openSettings = () => {
    setSwitchToSettings(true)
    caAfter(WeatherMetrics.flipDuration, () => setShowSettings(true))
  }

  const closeSettings = () => {
    setShowSettings(false)
    caAfter(WeatherMetrics.flipCloseHandoff, () => setSwitchToSettings(false))
  }

  const pageHeight = () =>
    props.height - UIStatusBarMetrics.height - DotTopSpacer - DotSize - DotBottom

  return (
    <div
      class="relative h-full w-full overflow-hidden"
      style={{ background: 'black', perspective: `${FlipPerspective}px` }}
    >
      <div
        class="absolute inset-0"
        style={{
          transform: `translateX(${switchToSettings() ? -props.width / 2 : 0}px) rotateY(${switchToSettings() ? -90 : 0}deg)`,
          'transform-origin': '100% 50%',
          opacity: `${switchToSettings() ? 0 : 1}`,
          'pointer-events': switchToSettings() ? 'none' : 'auto',
          transition: caTransition(['transform', 'opacity'], flipOut)
        }}
      >
        <div class="flex h-full w-full flex-col">
          <UIStatusBar />

          <div
            class="relative flex-1 overflow-hidden"
            style={{ 'touch-action': 'pan-y' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              class="flex h-full"
              style={{
                width: `${count() * 100}%`,
                transform: `translateX(${trackOffset()})`,
                transition: drag() === 0 ? caTransition(['transform'], pageAnimation) : 'none'
              }}
            >
              <For each={weatherLocations()}>
                {(location) => (
                  <div class="h-full overflow-hidden" style={{ width: `${100 / count()}%` }}>
                    <WeatherPage
                      location={location}
                      reading={weatherReadings()[location.id]}
                      height={pageHeight()}
                      onSettings={openSettings}
                    />
                  </div>
                )}
              </For>
            </div>
          </div>

          <div style={{ height: `${DotTopSpacer}px`, 'flex-shrink': '0' }} />
          <div
            class="flex items-center justify-center"
            style={{
              gap: `${DotSpacing}px`,
              'padding-bottom': `${DotBottom}px`,
              'flex-shrink': '0'
            }}
          >
            <For each={weatherLocations()}>
              {(location, index) => (
                <button
                  type="button"
                  aria-label={location.name}
                  onClick={() => setPage(index())}
                  style={{
                    width: `${DotSize}px`,
                    height: `${DotSize}px`,
                    'border-radius': '9999px',
                    background: 'white',
                    opacity: `${page() === index() ? 1 : IdleDotOpacity}`
                  }}
                />
              )}
            </For>
          </div>
        </div>
      </div>

      <div
        class="absolute inset-0"
        style={{
          transform: `translateX(${showSettings() ? 0 : props.width / 2}px) rotateY(${showSettings() ? 0 : 90}deg)`,
          'transform-origin': '0% 50%',
          opacity: `${showSettings() ? 1 : 0}`,
          'pointer-events': showSettings() ? 'auto' : 'none',
          transition: caTransition(['transform', 'opacity'], flipIn)
        }}
      >
        <div class="flex h-full w-full flex-col">
          <UIStatusBar />
          <div class="flex-1 overflow-hidden">
            <WeatherSettings
              locations={weatherLocations()}
              unit={weatherUnit()}
              onUnitChange={setWeatherUnit}
              onAdd={addWeatherLocation}
              onRemove={removeWeatherLocation}
              onDone={closeSettings}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
