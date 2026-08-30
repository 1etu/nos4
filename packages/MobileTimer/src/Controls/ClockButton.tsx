import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type ClockButtonTone = 'start' | 'stop' | 'neutral'

const faces = {
  start: ClockPalette.startFace,
  stop: ClockPalette.stopFace,
  neutral: ClockPalette.neutralFace
} as const

export const ClockButton = (props: {
  title: string
  tone: ClockButtonTone
  disabled?: boolean
  height: number
  fontSize: number
  onPress: () => void
}) => (
  <button
    type="button"
    class="flex flex-1 items-center justify-center"
    style={{
      height: `${props.height + ClockMetrics.buttonBezel * 2}px`,
      padding: `${ClockMetrics.buttonBezel}px`,
      'border-radius': `${ClockMetrics.buttonBezelRadius}px`,
      background: ClockPalette.buttonBezel,
      'box-shadow': ClockPalette.buttonBezelShadow,
      opacity: props.disabled ? '0.45' : '1'
    }}
    disabled={props.disabled}
    onClick={() => props.onPress()}
  >
    <span
      class="flex h-full w-full items-center justify-center"
      style={{
        'border-radius': `${ClockMetrics.buttonRadius}px`,
        background: faces[props.tone]
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${props.fontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: ClockPalette.buttonLabel,
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.35)'
        }}
      >
        {props.title}
      </span>
    </span>
  </button>
)
