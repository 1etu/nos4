import { UINavigationBarMetrics, UINavigationBarPalette } from './UINavigationBarMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export type UIBarButtonTone = keyof typeof UINavigationBarPalette.buttonTone

export const UIBarButton = (props: {
  title: string
  tone: UIBarButtonTone
  onClick: () => void
}) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${UINavigationBarMetrics.buttonHeight}px`,
      padding: `0 ${UINavigationBarMetrics.buttonPaddingX}px`,
      'border-radius': `${UINavigationBarMetrics.buttonRadius}px`,
      background: UINavigationBarPalette.buttonTone[props.tone],
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${UINavigationBarMetrics.buttonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)',
        'white-space': 'pre'
      }}
    >
      {props.title}
    </span>
  </button>
)
