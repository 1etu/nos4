import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { uiDeviceBatteryLevel, uiDeviceBatteryState } from '../Device/UIDevice'
import { UIDeviceBatteryState } from '../Device/UIDevicePowerMetrics'
import { ctAirplaneMode, ctCarrierName, ctWiFiPower } from 'CoreTelephony'
import { UIStatusBarMetrics, UIStatusBarPalette } from './UIStatusBarMetrics'

const ClockTick = 1000

export type UIStatusBarStyle = 'overlay' | 'inApp'

const timeString = (date: Date): string =>
  date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase()

const BoltMask =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 12'%3E%3Cpath d='M5.1 0 0.6 6.9h2.6L2.9 12l4.5-6.9H4.8Z' fill='%23000'/%3E%3C/svg%3E\")"

const vignette = (color: string, depth: number): string =>
  ['bottom', 'top', 'right', 'left']
    .map((edge) => `linear-gradient(to ${edge}, ${color}, transparent ${depth}px)`)
    .join(', ')

const BatteryRing = (props: { stroke: number; paint: string }) => (
  <div
    class="pointer-events-none absolute"
    style={{
      inset: `${-props.stroke / 2}px`,
      background: props.paint,
      border: `${props.stroke}px solid transparent`,
      'border-radius': `${UIStatusBarMetrics.batteryCornerRadius + props.stroke / 2}px`,
      '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      '-webkit-mask-composite': 'xor',
      mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      'mask-composite': 'exclude'
    }}
  />
)

const BatteryNub = (props: { fill: string; ring: string }) => (
  <div
    class="relative"
    style={{
      width: `${UIStatusBarMetrics.batteryNubWidth}px`,
      height: `${UIStatusBarMetrics.batteryNubHeight}px`,
      'margin-left': `${UIStatusBarMetrics.batteryNubGap}px`,
      background: props.fill
    }}
  >
    <BatteryRing stroke={UIStatusBarMetrics.batteryNubStroke} paint={props.ring} />
  </div>
)

const OverlayBattery = (props: { level: number; charging: boolean; color: string }) => (
  <div class="flex items-center">
    <div
      class="relative"
      style={{
        width: `${UIStatusBarMetrics.batteryBodyWidth}px`,
        height: `${UIStatusBarMetrics.batteryBodyHeight}px`
      }}
    >
      <div
        class="absolute"
        style={{
          left: `${UIStatusBarMetrics.batteryChargeInsetX}px`,
          top: `${UIStatusBarMetrics.batteryChargeInsetY}px`,
          width: `${UIStatusBarMetrics.batteryChargeWidth * props.level}px`,
          height: `${UIStatusBarMetrics.batteryChargeHeight}px`,
          background:
            props.level <= UIStatusBarMetrics.batteryLowLevel
              ? UIStatusBarPalette.batteryLow
              : props.color,
          '-webkit-mask-image': props.charging ? `linear-gradient(#000 0 0), ${BoltMask}` : 'none',
          'mask-image': props.charging ? `linear-gradient(#000 0 0), ${BoltMask}` : 'none',
          '-webkit-mask-repeat': 'no-repeat',
          'mask-repeat': 'no-repeat',
          '-webkit-mask-position': 'center, center',
          'mask-position': 'center, center',
          '-webkit-mask-size': `auto, ${UIStatusBarMetrics.boltWidth}px ${UIStatusBarMetrics.boltHeight}px`,
          'mask-size': `auto, ${UIStatusBarMetrics.boltWidth}px ${UIStatusBarMetrics.boltHeight}px`,
          '-webkit-mask-composite': 'xor',
          'mask-composite': 'exclude'
        }}
      />
      <BatteryRing stroke={UIStatusBarMetrics.batteryStroke} paint={props.color} />
    </div>
    <BatteryNub fill="transparent" ring={props.color} />
  </div>
)

const InAppBattery = (props: { level: number; charging: boolean }) => {
  const fillVignette = () =>
    UIStatusBarMetrics.batteryFillVignetteFactor *
    Math.min(
      UIStatusBarMetrics.batteryFillWidth * props.level,
      UIStatusBarMetrics.batteryFillHeight
    )

  return (
    <div class="flex items-center">
      <div
        class="relative"
        style={{
          width: `${UIStatusBarMetrics.batteryBodyWidth}px`,
          height: `${UIStatusBarMetrics.batteryBodyHeight}px`,
          filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.5))'
        }}
      >
        <div
          class="absolute inset-0"
          style={{
            background: `${vignette(
              UIStatusBarPalette.batteryShellVignetteColor,
              UIStatusBarMetrics.batteryShellVignette
            )}, ${UIStatusBarPalette.batteryShell}`
          }}
        />
        <div
          class="absolute flex items-center justify-center"
          style={{
            left: `${UIStatusBarMetrics.batteryFillInset}px`,
            top: `${UIStatusBarMetrics.batteryFillInset}px`,
            width: `${UIStatusBarMetrics.batteryFillWidth * props.level}px`,
            height: `${UIStatusBarMetrics.batteryFillHeight}px`,
            background: `${vignette(
              UIStatusBarPalette.batteryFillVignetteColor,
              fillVignette()
            )}, ${UIStatusBarPalette.batteryFill}`
          }}
        >
          <Show when={props.charging}>
            <svg
              width={UIStatusBarMetrics.boltWidth}
              height={UIStatusBarMetrics.boltInAppHeight}
              viewBox="0 0 8 12"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M5.1 0 0.6 6.9h2.6L2.9 12l4.5-6.9H4.8Z" fill="black" />
            </svg>
          </Show>
        </div>
        <BatteryRing
          stroke={UIStatusBarMetrics.batteryStroke}
          paint={UIStatusBarPalette.batteryShellStroke}
        />
      </div>
      <BatteryNub fill={UIStatusBarPalette.batteryNub} ring={UIStatusBarPalette.batteryShellStroke} />
    </div>
  )
}

const WifiGlyph = (props: { style: UIStatusBarStyle; color: string }) => {
  const paint = () => (props.style === 'inApp' ? 'url(#nos4WifiGradient)' : props.color)

  return (
    <svg
      width={UIStatusBarMetrics.wifiWidth}
      height={UIStatusBarMetrics.wifiHeight}
      viewBox="0 0 22 15.5"
      fill="none"
      style={{
        filter: props.style === 'inApp' ? 'drop-shadow(0 1px 0 rgba(255,255,255,0.5))' : 'none'
      }}
    >
      <Show when={props.style === 'inApp'}>
        <defs>
          <linearGradient id="nos4WifiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color={UIStatusBarPalette.wifiTop} />
            <stop offset="1" stop-color={UIStatusBarPalette.wifiBottom} />
          </linearGradient>
        </defs>
      </Show>
      <path
        d="M1.23 6.26a12.4 12.4 0 0 1 19.54 0"
        stroke={paint()}
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M4.22 8.6a8.6 8.6 0 0 1 13.56 0"
        stroke={paint()}
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <path
        d="M7.22 10.94a4.8 4.8 0 0 1 7.56 0"
        stroke={paint()}
        stroke-width="1.7"
        stroke-linecap="round"
      />
      <circle cx="11" cy="13.9" r="1.55" fill={paint()} />
    </svg>
  )
}

const AirplaneGlyph = (props: { color: string }) => (
  <svg
    width={UIStatusBarMetrics.airplaneWidth}
    height={UIStatusBarMetrics.airplaneHeight}
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M8 0.9c0.62 0 1.02 0.5 1.02 1.24v3.3l5.7 3.36v1.42l-5.7-1.79v3.4l1.86 1.32v1.16L8 13.7l-2.88 0.61v-1.16l1.86-1.32v-3.4l-5.7 1.79V8.8l5.7-3.36v-3.3C6.98 1.4 7.38 0.9 8 0.9z"
      fill={props.color}
    />
  </svg>
)

const LockGlyph = (props: { color: string }) => (
  <svg
    width={UIStatusBarMetrics.lockWidth}
    height={UIStatusBarMetrics.lockHeight}
    viewBox="0 0 10 14"
    fill={props.color}
  >
    <path d="M2 6V4a3 3 0 0 1 6 0v2h.5A1.5 1.5 0 0 1 10 7.5v5A1.5 1.5 0 0 1 8.5 14h-7A1.5 1.5 0 0 1 0 12.5v-5A1.5 1.5 0 0 1 1.5 6H2Zm1.4 0h3.2V4a1.6 1.6 0 0 0-3.2 0v2Z" />
  </svg>
)

export const UIStatusBar = (props: {
  style?: UIStatusBarStyle
  locked?: boolean
  carrier?: string
  wifi?: boolean
}) => {
  const [now, setNow] = createSignal(new Date())

  onMount(() => {
    const timer = setInterval(() => setNow(new Date()), ClockTick)
    onCleanup(() => clearInterval(timer))
  })

  const style = () => props.style ?? 'overlay'
  const tone = () => UIStatusBarPalette[style()]
  const level = () => uiDeviceBatteryLevel()
  const charging = () => uiDeviceBatteryState() !== UIDeviceBatteryState.unplugged
  const carrierColor = () => (props.carrier ? tone().carrier : tone().carrierNoSim)
  const carrierLabel = () => props.carrier ?? ctCarrierName()

  return (
    <div
      class="relative flex items-center"
      style={{
        height: `${UIStatusBarMetrics.height}px`,
        background:
          style() === 'inApp'
            ? `linear-gradient(to top, ${UIStatusBarPalette.inAppInnerShadow}, transparent) bottom / 100% ${UIStatusBarMetrics.inAppInnerShadowHeight}px no-repeat, ${tone().background}`
            : tone().background,
        'border-bottom':
          style() === 'inApp'
            ? `${UIStatusBarMetrics.inAppEdgeWidth}px solid ${UIStatusBarPalette.inAppEdge}`
            : 'none',
        'border-top-left-radius':
          style() === 'inApp' ? `${UIStatusBarMetrics.inAppTopRadius}px` : '0',
        'border-top-right-radius':
          style() === 'inApp' ? `${UIStatusBarMetrics.inAppTopRadius}px` : '0',
        'font-family': "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        'font-size': `${UIStatusBarMetrics.fontSize}px`,
        'font-weight': tone().weight,
        'text-shadow': tone().textShadow,
        padding: `0 ${UIStatusBarMetrics.edgeInset}px`
      }}
    >
      <div class="flex items-center" style={{ gap: `${UIStatusBarMetrics.stackSpacing}px` }}>
        <Show
          when={ctAirplaneMode()}
          fallback={
            <>
              <span style={{ color: carrierColor() }}>{carrierLabel()}</span>
              <Show when={(props.wifi ?? true) && ctWiFiPower()}>
                <WifiGlyph style={style()} color={tone().glyph} />
              </Show>
            </>
          }
        >
          <AirplaneGlyph color={tone().glyph} />
        </Show>
      </div>

      <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Show
          when={props.locked}
          fallback={<span style={{ color: tone().time }}>{timeString(now())}</span>}
        >
          <LockGlyph color={tone().glyph} />
        </Show>
      </div>

      <div
        class="ml-auto flex items-center"
        style={{ gap: `${UIStatusBarMetrics.batteryTrailingSpacing}px` }}
      >
        <span style={{ color: tone().glyph, visibility: charging() ? 'hidden' : 'visible' }}>
          {Math.round(level() * 100)}%
        </span>
        <div style={{ 'margin-right': `${UIStatusBarMetrics.batteryEndInset}px` }}>
          <Show
            when={style() === 'inApp'}
            fallback={
              <OverlayBattery level={level()} charging={charging()} color={tone().glyph} />
            }
          >
            <InAppBattery level={level()} charging={charging()} />
          </Show>
        </div>
      </div>
    </div>
  )
}
