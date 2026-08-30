import { UISwitchMetrics, UISwitchPalette } from './UISwitchMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Caption = (props: { text: string; on: boolean }) => (
  <span
    class="absolute top-1/2"
    style={{
      [props.on ? 'left' : 'right']: `${UISwitchMetrics.labelInset}px`,
      transform: 'translateY(-50%)',
      'font-family': HelveticaNeue,
      'font-size': `${UISwitchMetrics.labelFontSize}px`,
      'font-weight': '700',
      color: props.on ? UISwitchPalette.onLabel : UISwitchPalette.offLabel,
      'text-shadow': props.on ? '0 -1px 0 rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.8)'
    }}
  >
    {props.text}
  </span>
)

export type UISwitchTone = 'blue' | 'orange'

export const UISwitch = (props: {
  on: boolean
  tone?: UISwitchTone
  onChange: (on: boolean) => void
}) => (
  <button
    type="button"
    class="relative shrink-0 overflow-hidden"
    style={{
      width: `${UISwitchMetrics.width}px`,
      height: `${UISwitchMetrics.height}px`,
      'border-radius': `${UISwitchMetrics.radius}px`,
      background: UISwitchPalette.track,
      border: `1px solid ${UISwitchPalette.trackStroke}`,
      'box-shadow': UISwitchPalette.wellShadow
    }}
    onClick={() => props.onChange(!props.on)}
  >
    <div
      class="absolute inset-0"
      style={{
        transform: `translateX(${props.on ? 0 : -UISwitchMetrics.travel}px)`,
        width: `${UISwitchMetrics.width + UISwitchMetrics.travel}px`
      }}
    >
      <div
        class="absolute inset-y-0 left-0"
        style={{
          width: `${UISwitchMetrics.travel + UISwitchMetrics.radius}px`,
          background:
            props.tone === 'orange' ? UISwitchPalette.orangeFill : UISwitchPalette.onFill
        }}
      >
        <Caption text="ON" on={true} />
      </div>
      <div
        class="absolute inset-y-0 right-0"
        style={{
          width: `${UISwitchMetrics.travel + UISwitchMetrics.radius}px`,
          background: UISwitchPalette.offFill
        }}
      >
        <Caption text="OFF" on={false} />
      </div>
      <div
        class="absolute"
        style={{
          left: `${UISwitchMetrics.travel + UISwitchMetrics.knobInset}px`,
          top: `${UISwitchMetrics.knobInset}px`,
          width: `${UISwitchMetrics.knobSize}px`,
          height: `${UISwitchMetrics.knobSize}px`,
          'border-radius': '50%',
          background: UISwitchPalette.knob,
          border: `1px solid ${UISwitchPalette.knobStroke}`,
          'box-shadow': UISwitchPalette.knobShadow
        }}
      />
    </div>
  </button>
)
