import { createSignal, For } from 'solid-js'
import { CGImage, CGResizableImage, assetURL } from 'CoreGraphics'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { WeatherMetrics, WeatherPalette } from '../Support/WeatherMetrics'
import { WeatherLocationSearch } from './WeatherLocationSearch'
import type { WeatherLocation, WeatherUnit } from '../Support/WeatherService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const revealAnimation = caAnimation(
  WeatherMetrics.deleteRevealDuration,
  CAMediaTimingFunction.linear
)

const rowRemoveAnimation = caAnimation(
  WeatherMetrics.rowRemoveDuration,
  CAMediaTimingFunction.easeIn
)

const rowCollapseAnimation = caAnimation(
  WeatherMetrics.rowCollapseDuration,
  CAMediaTimingFunction.easeInOut
)

const segmentAnimation = caAnimation(
  WeatherMetrics.segmentDuration,
  CAMediaTimingFunction.easeInOut
)

const defaultAnimation = caAnimation(
  WeatherMetrics.defaultDuration,
  CAMediaTimingFunction.easeInOut
)

const ToolBarButton = (props: { label: string; tone: 'blue' | 'red'; onClick: () => void }) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${WeatherMetrics.toolBarButtonHeight}px`,
      padding: `0 ${WeatherMetrics.toolBarButtonPaddingX}px`,
      'border-radius': `${WeatherMetrics.toolBarButtonRadius}px`,
      background: WeatherPalette.buttonTone[props.tone],
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${WeatherMetrics.toolBarButtonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)'
      }}
    >
      {props.label}
    </span>
  </button>
)

const PlusButton = (props: { onClick: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${WeatherMetrics.plusButtonSize}px`,
      height: `${WeatherMetrics.plusButtonSize}px`
    }}
    onClick={props.onClick}
  >
    <CGResizableImage
      name="UINavigationBarBlackTranslucentButton"
      width={WeatherMetrics.plusButtonSize}
      height={WeatherMetrics.plusButtonSize}
      class="absolute inset-0"
    />
    <CGImage name="UIButtonBarPlus" class="relative" style={{ width: `${WeatherMetrics.plusIconWidth}px`, height: 'auto' }} />
  </button>
)

const SegmentedControl = (props: { unit: WeatherUnit; onChange: (unit: WeatherUnit) => void }) => (
  <div
    class="flex overflow-hidden"
    style={{
      height: `${WeatherMetrics.segmentHeight}px`,
      'border-radius': `${WeatherMetrics.segmentRadius}px`,
      background: 'transparent'
    }}
  >
    <For each={[{ unit: 'imperial' as const, label: '°F' }, { unit: 'metric' as const, label: '°C' }]}>
      {(entry) => {
        const active = () => props.unit === entry.unit
        return (
          <button
            type="button"
            class="flex flex-1 items-center justify-center"
            style={{
              background: active() ? WeatherPalette.segmentActive : WeatherPalette.segmentIdle,
              'box-shadow': active()
                ? 'inset 0 3px 3px rgba(0,0,0,0.4), 0 0.8px 0 rgba(255,255,255,0.28)'
                : 'inset 0 3px 3px rgba(0,0,0,0), 0 0.8px 0 rgba(255,255,255,0.28)',
              transition: caTransition(['box-shadow'], segmentAnimation)
            }}
            onClick={() => props.onChange(entry.unit)}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${WeatherMetrics.segmentFontSize}px`,
                'font-weight': '700',
                color: active() ? 'white' : WeatherPalette.segmentIdleText,
                'text-shadow': active()
                  ? '0 -0.66px 0 rgba(0,0,0,0.4)'
                  : '0 0.99px 0 rgba(255,255,255,0.9)',
                transition: caTransition(['color', 'text-shadow'], segmentAnimation)
              }}
            >
              {entry.label}
            </span>
          </button>
        )
      }}
    </For>
  </div>
)

export const WeatherSettings = (props: {
  locations: readonly WeatherLocation[]
  unit: WeatherUnit
  onUnitChange: (unit: WeatherUnit) => void
  onAdd: (location: WeatherLocation) => void
  onRemove: (id: string) => void
  onDone: () => void
}) => {
  const [pendingDelete, setPendingDelete] = createSignal<string | undefined>()
  const [removing, setRemoving] = createSignal<string | undefined>()
  const [adding, setAdding] = createSignal(false)

  const toggleDelete = (id: string) => {
    setPendingDelete(pendingDelete() === id ? undefined : id)
  }

  const remove = (id: string) => {
    setRemoving(id)
    setPendingDelete(undefined)
    caAfter(WeatherMetrics.rowRemoveDuration + WeatherMetrics.rowCollapseDuration, () => {
      props.onRemove(id)
      setRemoving(undefined)
    })
  }

  const canRemove = () => props.locations.length > 1

  return (
    <div
      class="relative h-full w-full overflow-hidden"
      style={{
        'background-image': `url(${assetURL('Weather_Settings_BackgroundTile')})`,
        'background-repeat': 'repeat'
      }}
    >
      <div class="flex h-full flex-col">
        <div
          class="relative flex items-center"
          style={{ height: `${WeatherMetrics.settingsTitleBarHeight}px`, 'flex-shrink': '0' }}
        >
          <div
            class="absolute inset-0"
            style={{
              background: WeatherPalette.barGradient,
              'border-bottom': `1px solid ${WeatherPalette.barBorderBottom}`,
              opacity: `${WeatherMetrics.settingsBarOpacity}`
            }}
          />
          <div class="relative" style={{ 'margin-left': `${WeatherMetrics.rowInset}px` }}>
            <PlusButton onClick={() => setAdding(true)} />
          </div>
          <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${WeatherMetrics.settingsTitleFontSize}px`,
                'font-weight': '700',
                color: 'white',
                'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
              }}
            >
              Weather
            </span>
          </div>
          <div class="relative ml-auto" style={{ 'margin-right': `${WeatherMetrics.rowInset}px` }}>
            <ToolBarButton label="Done" tone="blue" onClick={props.onDone} />
          </div>
        </div>

        <div style={{ height: `${WeatherMetrics.settingsGap}px`, 'flex-shrink': '0' }} />

        <div
          class="flex-1 overflow-hidden"
          style={{
            'margin-left': `${WeatherMetrics.settingsInsetX}px`,
            'margin-right': `${WeatherMetrics.settingsInsetX}px`,
            'border-radius': `${WeatherMetrics.panelRadius}px`,
            background: 'white'
          }}
        >
          <For each={props.locations}>
            {(location) => (
              <div
                class="overflow-hidden"
                style={{
                  height: `${removing() === location.id ? 0 : WeatherMetrics.settingsRowHeight}px`,
                  transform: `translateX(${removing() === location.id ? -100 : 0}%)`,
                  transition: caTransition(['transform'], rowRemoveAnimation)
                    .concat(', ')
                    .concat(caTransition(['height'], rowCollapseAnimation))
                }}
              >
                <div
                  class="flex items-center"
                  style={{
                    height: `${WeatherMetrics.settingsRowHeight - WeatherMetrics.hairline}px`,
                    'padding-left': `${WeatherMetrics.rowInset}px`
                  }}
                >
                  <div
                    class="relative flex items-center"
                    style={{
                      width: canRemove() ? `${WeatherMetrics.minusSlotWidth}px` : '0px',
                      opacity: `${canRemove() ? 1 : 0}`,
                      transform: `translateX(${canRemove() ? -4 : -24}px)`,
                      transition: caTransition(['opacity', 'transform', 'width'], defaultAnimation)
                    }}
                  >
                    <button
                      type="button"
                      class="relative flex items-center justify-center"
                      onClick={() => toggleDelete(location.id)}
                    >
                      <CGImage name="UIRemoveControlMinus" />
                      <span
                        class="absolute"
                        style={{
                          color: 'white',
                          'font-size': '15px',
                          'font-weight': '900',
                          transform: `translateY(${pendingDelete() === location.id ? -1.3 : -2}px) rotate(${pendingDelete() === location.id ? -90 : 0}deg)`,
                          transition: caTransition(['transform'], revealAnimation)
                        }}
                      >
                        —
                      </span>
                    </button>
                  </div>

                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${WeatherMetrics.settingsRowFontSize}px`,
                      'font-weight': '700',
                      color: 'black',
                      'margin-left': '6px',
                      'white-space': 'nowrap',
                      overflow: 'hidden'
                    }}
                  >
                    {location.name}
                  </span>

                  <div class="relative ml-auto flex items-center">
                    <CGImage
                      name="UITableGrabber"
                      style={{
                        'margin-right': `${WeatherMetrics.settingsInsetX}px`,
                        opacity: `${pendingDelete() === location.id ? 0 : 1}`,
                        transition: caTransition(['opacity'], defaultAnimation)
                      }}
                    />
                    <div
                      class="absolute right-0"
                      style={{
                        'margin-right': `${WeatherMetrics.settingsInsetX}px`,
                        opacity: `${pendingDelete() === location.id ? 1 : 0}`,
                        'pointer-events': pendingDelete() === location.id ? 'auto' : 'none',
                        transform: `translateX(${pendingDelete() === location.id ? 0 : 100}%)`,
                        transition: caTransition(['opacity', 'transform'], defaultAnimation)
                      }}
                    >
                      <ToolBarButton label="Delete" tone="red" onClick={() => remove(location.id)} />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    height: `${WeatherMetrics.hairline}px`,
                    background: WeatherPalette.rowSeparator
                  }}
                />
              </div>
            )}
          </For>
        </div>

        <div style={{ height: `${WeatherMetrics.settingsGap}px`, 'flex-shrink': '0' }} />

        <div
          style={{
            'margin-left': `${WeatherMetrics.rowInset + 4}px`,
            'margin-right': `${WeatherMetrics.rowInset + 4}px`,
            'flex-shrink': '0'
          }}
        >
          <SegmentedControl unit={props.unit} onChange={props.onUnitChange} />
        </div>

        <div style={{ height: `${WeatherMetrics.settingsGap}px`, 'flex-shrink': '0' }} />

        <div class="flex justify-center" style={{ 'flex-shrink': '0' }}>
          <CGImage name="yahoo_weather" />
        </div>

        <div style={{ height: `${WeatherMetrics.settingsGap}px`, 'flex-shrink': '0' }} />
      </div>

      <div
        class="absolute inset-0"
        style={{
          transform: `translateY(${adding() ? 0 : 100}%)`,
          'pointer-events': adding() ? 'auto' : 'none',
          transition: caTransition(['transform'], defaultAnimation),
          'z-index': '2'
        }}
      >
        <WeatherLocationSearch
          onCancel={() => setAdding(false)}
          onSelect={(location) => {
            props.onAdd(location)
            setAdding(false)
          }}
        />
      </div>
    </div>
  )
}
