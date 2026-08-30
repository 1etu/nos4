import { createSignal, onCleanup, Show } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { CalendarBundleId, type ApplicationRecord } from '../Support/Bundles'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const dayName = (date: Date): string => date.toLocaleDateString('en-US', { weekday: 'long' })

const CalendarOverlay = () => {
  const [now, setNow] = createSignal(new Date())
  const timer = setInterval(() => setNow(new Date()), 60000)
  onCleanup(() => clearInterval(timer))

  return (
    <>
      <div
        class="absolute inset-x-0 top-0 flex justify-center"
        style={{ 'padding-top': `${SpringBoardMetrics.calendarDayPaddingTop}px` }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${SpringBoardMetrics.calendarDayFontSize}px`,
            'font-weight': '500',
            color: 'white',
            'max-width': `${SpringBoardMetrics.calendarDayMaxWidth}px`,
            'text-shadow': '0 0.75px 0.2px rgb(0,0,0)',
            transform: `translateY(${SpringBoardMetrics.labelOffsetY}px)`,
            'white-space': 'nowrap',
            overflow: 'hidden'
          }}
        >
          {dayName(now())}
        </span>
      </div>
      <div class="absolute inset-0 flex items-center justify-center">
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${SpringBoardMetrics.calendarDateFontSize}px`,
            'font-weight': '700',
            color: 'black',
            'line-height': '1',
            'padding-top': `${SpringBoardMetrics.calendarDatePaddingTop}px`
          }}
        >
          {now().getDate()}
        </span>
      </div>
    </>
  )
}

export const IconTile = (props: {
  app: ApplicationRecord
  showShadow?: boolean
  offset?: { x: number; y: number }
  transition?: string
  onLaunch: (app: ApplicationRecord) => void
}) => {
  const [pressed, setPressed] = createSignal(false)

  return (
    <button
      type="button"
      class="relative flex flex-col items-center"
      style={{
        width: `${SpringBoardMetrics.cellWidth}px`,
        gap: `${SpringBoardMetrics.iconLabelSpacing}px`,
        transform: `translate(${props.offset?.x ?? 0}px, ${props.offset?.y ?? 0}px)`,
        transition: props.transition ?? 'none'
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => props.onLaunch(props.app)}
    >
      <Show when={props.showShadow ?? true}>
        <img
          src={assetURL('WallpaperIconShadow')}
          alt=""
          draggable={false}
          class="pointer-events-none absolute left-1/2 top-1/2"
          style={{
            width: `${SpringBoardMetrics.iconShadowWidth}px`,
            transform: `translate(-50%, calc(-50% + ${SpringBoardMetrics.iconShadowOffsetY}px))`,
            'z-index': '0'
          }}
        />
      </Show>

      <div
        class="relative"
        style={{ width: `${SpringBoardMetrics.iconSize}px`, 'z-index': '1' }}
      >
        <Show when={pressed()}>
          <div
            class="absolute inset-0"
            style={{
              background: 'gray',
              'border-radius': `${SpringBoardMetrics.iconPressedRadius}px`
            }}
          />
        </Show>
        <img
          src={assetURL(props.app.icon)}
          alt=""
          draggable={false}
          class="relative block w-full"
        />
        <Show when={props.app.bundleId === CalendarBundleId}>
          <CalendarOverlay />
        </Show>
      </div>

      <span
        class="relative"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${SpringBoardMetrics.labelFontSize}px`,
          'font-weight': '500',
          color: 'white',
          'text-shadow': `0 ${SpringBoardMetrics.labelShadowOffsetY}px ${SpringBoardMetrics.labelShadowBlur}px rgba(0,0,0,0.9)`,
          transform: `translateY(${SpringBoardMetrics.labelOffsetY}px)`,
          'white-space': 'nowrap',
          'z-index': '1'
        }}
      >
        {props.app.displayName}
      </span>
    </button>
  )
}
