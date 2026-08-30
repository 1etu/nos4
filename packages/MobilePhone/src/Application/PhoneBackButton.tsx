import { CGImage } from 'CoreGraphics'
import { HelveticaNeue, PhoneMetrics } from '../Support/PhoneMetrics'

export const PhoneBackButton = (props: { title: string; onPress: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${PhoneMetrics.backButtonWidth}px`,
      height: `${PhoneMetrics.backButtonHeight}px`
    }}
    onClick={() => props.onPress()}
  >
    <CGImage
      name="Button_wp5"
      class="absolute inset-0"
      style={{
        width: `${PhoneMetrics.backButtonWidth}px`,
        height: `${PhoneMetrics.backButtonHeight}px`,
        'object-fit': 'contain'
      }}
    />
    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.backButtonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
        'padding-left': `${PhoneMetrics.backButtonLabelLeading}px`,
        'max-width': `${PhoneMetrics.backButtonLabelMaxWidth}px`,
        transform: `translate(${PhoneMetrics.backButtonLabelOffsetX}px, ${PhoneMetrics.backButtonLabelOffsetY}px)`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.title}
    </span>
  </button>
)
