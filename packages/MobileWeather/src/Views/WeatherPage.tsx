import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { iconAsset, iconCode, iconOffset } from '../Support/WeatherIconography'
import { WeatherMetrics, WeatherPalette } from '../Support/WeatherMetrics'
import type { WeatherLocation, WeatherReading } from '../Support/WeatherService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const weekdayFrom = (offset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
}

const rowBackground = (index: number): string => {
  if (index === WeatherMetrics.forecastRows - 1) {
    return `linear-gradient(to bottom, ${WeatherPalette.rowLastTop}, ${WeatherPalette.rowLastBottom})`
  }
  return index % 2 === 0
    ? `linear-gradient(to bottom, ${WeatherPalette.rowEvenTop}, ${WeatherPalette.rowEvenBottom})`
    : `linear-gradient(to bottom, ${WeatherPalette.rowOddTop}, ${WeatherPalette.rowOddBottom})`
}

const Shadowed = (props: {
  size: number
  color: string
  weight?: string
  style?: Record<string, string>
  children: string
}) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${props.size}px`,
      'font-weight': props.weight ?? '700',
      color: props.color,
      'line-height': '1',
      'text-shadow': WeatherMetrics.textShadow,
      ...props.style
    }}
  >
    {props.children}
  </span>
)

export const WeatherPage = (props: {
  location: WeatherLocation
  reading: WeatherReading | undefined
  height: number
  onSettings: () => void
}) => {
  const currentIcon = () => iconCode(props.reading?.currentCode, props.reading?.isDay ?? true)
  const contentHeight = () => props.height - WeatherMetrics.pageTopInset
  const headerHeight = () => contentHeight() * WeatherMetrics.headerRatio
  const footerHeight = () => contentHeight() * WeatherMetrics.footerRatio

  return (
    <div class="relative h-full w-full">
      <div
        class="absolute inset-x-0"
        style={{ top: `${WeatherMetrics.pageTopInset}px`, height: `${contentHeight()}px` }}
      >
        <div
          class="absolute flex flex-col overflow-hidden"
          style={{
            left: `${WeatherMetrics.panelInsetX}px`,
            right: `${WeatherMetrics.panelInsetX}px`,
            top: `${WeatherMetrics.panelInsetY}px`,
            bottom: `${WeatherMetrics.panelInsetY}px`,
            'border-radius': `${WeatherMetrics.panelRadius}px`,
            border: `${WeatherMetrics.panelStroke}px solid ${WeatherPalette.panelStroke}`
          }}
        >
          <div
            style={{
              height: `${headerHeight()}px`,
              'flex-shrink': '0',
              background: `linear-gradient(to bottom, ${WeatherPalette.headerTop}, ${WeatherPalette.headerMid}, ${WeatherPalette.headerBottom})`
            }}
          />

          <For each={Array.from({ length: WeatherMetrics.forecastRows }, (_, index) => index)}>
            {(index) => (
              <>
                <Show when={index === 0}>
                  <div
                    style={{
                      height: `${WeatherMetrics.separatorHeight}px`,
                      'flex-shrink': '0',
                      background: WeatherPalette.separator
                    }}
                  />
                </Show>
                <div class="relative flex-1" style={{ background: rowBackground(index) }}>
                  <div class="absolute inset-0 flex items-center">
                    <div
                      style={{
                        width: `${100 / WeatherMetrics.dayColumnDivisor}%`,
                        'margin-left': `${WeatherMetrics.rowInset}px`
                      }}
                    >
                      <Shadowed size={WeatherMetrics.dayFontSize} color="white">
                        {weekdayFrom(index)}
                      </Shadowed>
                    </div>
                    <CGImage
                      name={iconAsset(iconCode(props.reading?.daily[index]?.weatherCode, true), true)}
                    />
                    <span class="ml-auto flex items-baseline" style={{ gap: '6px' }}>
                      <Shadowed size={WeatherMetrics.tempFontSize} color="white">
                        {`${Math.round(props.reading?.daily[index]?.maxTemp ?? 0)}°`}
                      </Shadowed>
                      <Shadowed
                        size={WeatherMetrics.tempFontSize}
                        color={WeatherPalette.lowTemp}
                        style={{ 'margin-right': `${WeatherMetrics.rowInset}px` }}
                      >
                        {`${Math.round(props.reading?.daily[index]?.minTemp ?? 0)}°`}
                      </Shadowed>
                    </span>
                  </div>
                </div>
                <Show when={index !== WeatherMetrics.forecastRows - 1}>
                  <div
                    style={{
                      height: `${WeatherMetrics.separatorHeight}px`,
                      'flex-shrink': '0',
                      background: WeatherPalette.separator
                    }}
                  />
                </Show>
              </>
            )}
          </For>

          <div
            style={{
              height: `${footerHeight()}px`,
              'flex-shrink': '0',
              background: `linear-gradient(to bottom, ${WeatherPalette.footerTop}, ${WeatherPalette.footerBottom})`
            }}
          />
        </div>

        <div
          class="pointer-events-none absolute"
          style={{
            left: `${WeatherMetrics.glossInsetX}px`,
            right: `${WeatherMetrics.glossInsetX}px`,
            top: `${WeatherMetrics.glossInsetTop}px`,
            height: `${contentHeight() * WeatherMetrics.glossRatio}px`,
            'border-radius': `${(WeatherMetrics.panelRadius * 18) / 16}px`,
            opacity: `${WeatherMetrics.glossOpacity}`,
            background: `linear-gradient(to bottom, ${WeatherPalette.glossTop} 20%, ${WeatherPalette.glossBottom} 100%)`
          }}
        />

        <div
          class="absolute flex flex-col"
          style={{
            left: `${WeatherMetrics.panelInsetX}px`,
            right: `${WeatherMetrics.panelInsetX}px`,
            top: `${WeatherMetrics.panelInsetY}px`,
            bottom: `${WeatherMetrics.panelInsetY}px`
          }}
        >
          <div
            class="flex flex-col justify-end"
            style={{ height: `${headerHeight()}px`, 'flex-shrink': '0' }}
          >
            <div class="flex items-end">
              <div
                class="flex flex-col"
                style={{ 'margin-left': `${WeatherMetrics.rowInset}px`, gap: '2px' }}
              >
                <Shadowed size={WeatherMetrics.locationFontSize} color="white">
                  {props.location.name}
                </Shadowed>
                <Shadowed size={WeatherMetrics.rangeFontSize} color="rgba(255,255,255,0.8)">
                  {`H: ${Math.round(props.reading?.daily[0]?.maxTemp ?? 0)}° L: ${Math.round(props.reading?.daily[0]?.minTemp ?? 0)}°`}
                </Shadowed>
              </div>

              <div class="ml-auto flex items-start">
                <Shadowed size={WeatherMetrics.currentFontSize} color="white" weight="400">
                  {`${Math.round(props.reading?.currentTemp ?? 0)}`}
                </Shadowed>
                <Shadowed
                  size={WeatherMetrics.degreeFontSize}
                  color="white"
                  weight="400"
                  style={{
                    transform: `translate(${WeatherMetrics.degreeOffsetX}px, ${WeatherMetrics.degreeOffsetY}px)`
                  }}
                >
                  °
                </Shadowed>
              </div>
            </div>
          </div>

          <div class="flex-1" />

          <div
            class="flex items-center"
            style={{ 'padding-bottom': `${WeatherMetrics.toolBarPaddingBottom}px` }}
          >
            <CGImage name="yahoo_button" style={{ 'margin-left': `${WeatherMetrics.rowInset}px` }} />
            <span class="mx-auto">
              <Shadowed size={WeatherMetrics.updatedFontSize} color="white">
                {props.reading?.updated ?? ''}
              </Shadowed>
            </span>
            <button
              type="button"
              onClick={props.onSettings}
              style={{ 'margin-right': `${WeatherMetrics.rowInset}px` }}
            >
              <CGImage name="info" />
            </button>
          </div>
        </div>
      </div>

      <Show when={currentIcon().length > 0}>
        <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
          <CGImage
            name={iconAsset(currentIcon(), false)}
            style={{
              'margin-top': `${WeatherMetrics.iconTopInset + iconOffset(currentIcon())}px`
            }}
          />
        </div>
      </Show>
    </div>
  )
}
