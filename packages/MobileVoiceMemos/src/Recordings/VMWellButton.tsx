import type { JSX } from 'solid-js'
import { VMMetrics, VMPalette } from '../Support/VMMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const VMWellButton = (props: {
  title: string
  fill: string
  border: string
  style?: JSX.CSSProperties
  onClick: () => void
}) => (
  <button
    type="button"
    class="relative"
    style={{
      height: `${VMMetrics.footerButtonHeight}px`,
      'border-radius': `${VMMetrics.footerButtonRadius}px`,
      background: VMPalette.buttonWell,
      'box-shadow': `inset 0 0 0 0.5px ${VMPalette.infoCardStroke}`,
      ...props.style
    }}
    onClick={props.onClick}
  >
    <div
      class="absolute flex items-center justify-center"
      style={{
        inset: `${VMMetrics.footerButtonInset}px`,
        'border-radius': `${VMMetrics.footerButtonInnerRadius}px`,
        background: props.fill,
        'box-shadow': `inset 0 0 0 0.4px ${props.border}`
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${VMMetrics.infoDurationFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -0.9px 0 rgba(0,0,0,0.9)'
        }}
      >
        {props.title}
      </span>
    </div>
  </button>
)
