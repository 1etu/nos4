import { createSignal, onCleanup, Show } from 'solid-js'
import { DeviceContentHeight, DeviceMetrics } from 'Device'
import { AVSystemSound, avPlaySystemSound } from 'AVFoundation'
import { assetURL } from 'CoreGraphics'
import { caTransition, type CAAnimation } from 'CoreAnimation'
import { UIDeviceBatteryState, UIStatusBar, uiDeviceBatteryState , uiWallpaperLock } from 'UIKit'
import { LockBatteryView } from './LockBatteryView'
import { LockFooter } from './LockFooter'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const travelDistance = DeviceMetrics.stageWidth - SpringBoardMetrics.sliderTravelReserve

const dateLine = (date: Date): string =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

const timeLine = (date: Date): string =>
  date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\s?[AP]M$/, '')

export const LockScreen = (props: {
  outSlides: number
  animation: CAAnimation
  onUnlock: () => void
}) => {
  const [now, setNow] = createSignal(new Date())
  const [offset, setOffset] = createSignal(0)
  const [dragging, setDragging] = createSignal(false)

  const timer = setInterval(() => setNow(new Date()), 1000)
  onCleanup(() => clearInterval(timer))

  let start = 0

  const onPointerDown = (event: PointerEvent) => {
    start = event.clientX - offset()
    setDragging(true)
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging()) return
    setOffset(Math.min(travelDistance, Math.max(0, event.clientX - start)))
  }

  const onPointerUp = () => {
    if (!dragging()) return
    setDragging(false)
    if (offset() >= travelDistance) {
      avPlaySystemSound(AVSystemSound.unlock, SpringBoardMetrics.unlockSoundVolume)
      props.onUnlock()
      return
    }
    setOffset(0)
  }

  return (
    <div class="relative h-full w-full overflow-hidden">
      <img
        src={assetURL(uiWallpaperLock())}
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          height: `${DeviceContentHeight / SpringBoardMetrics.lockGradientDivisor}px`,
          background: 'linear-gradient(to bottom, rgba(158,158,158,0), rgb(34,34,34))'
        }}
      />

      <Show when={uiDeviceBatteryState() !== UIDeviceBatteryState.unplugged}>
        <LockBatteryView />
      </Show>

      <div class="relative flex h-full w-full flex-col">
        <UIStatusBar locked />

        <div
          class="relative flex flex-col items-center justify-center"
          style={{
            height: `${SpringBoardMetrics.lockHeaderHeight}px`,
            gap: `${SpringBoardMetrics.lockStackSpacing}px`,
            background: 'rgba(0,0,0,0.65)',
            'border-top': '0.75px solid black',
            'border-bottom': '0.75px solid black',
            'box-shadow': 'inset 0 1px 0 rgba(255,255,255,0.24)',
            'font-family': HelveticaNeue,
            color: 'white',
            transform: `translateY(${-props.outSlides * SpringBoardMetrics.unlockHeaderFactor}px)`,
            transition: caTransition(['transform'], props.animation)
          }}
        >
          <div
            class="pointer-events-none absolute inset-x-0"
            style={{
              top: '0.5px',
              height: `${SpringBoardMetrics.lockHeaderGlowHeight}px`,
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.21), rgba(255,255,255,0.085))'
            }}
          />
          <span
            class="relative"
            style={{
              'font-size': `${SpringBoardMetrics.lockTimeFontSize}px`,
              'font-weight': '300',
              'line-height': '1',
              'text-shadow': '0 1px 0.5px rgba(255,255,255,0.35)'
            }}
          >
            {timeLine(now())}
          </span>
          <span
            class="relative"
            style={{
              'font-size': `${SpringBoardMetrics.lockDateFontSize}px`,
              'line-height': '1',
              color: 'white',
              'text-shadow': '0 1px 0.5px rgba(255,255,255,0.2)'
            }}
          >
            {dateLine(now())}
          </span>
        </div>

        <div class="flex-1" />

        <div
          style={{
            transform: `translateY(${props.outSlides}px)`,
            transition: caTransition(['transform'], props.animation)
          }}
        >
          <LockFooter
            offset={offset()}
            dragging={dragging()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          />
        </div>
      </div>
    </div>
  )
}
