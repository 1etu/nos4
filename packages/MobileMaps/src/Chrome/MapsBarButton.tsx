import { Show } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { UINavigationBarPalette } from 'UIKit'
import { MapsMetrics } from '../Support/MapsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsBarButton = (props: {
  icon?: AssetName
  title?: string
  active?: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    class="flex shrink-0 items-center justify-center"
    style={{
      height: `${MapsMetrics.toolBarButtonHeight}px`,
      'min-width': `${MapsMetrics.toolBarButtonWidth}px`,
      padding: props.title ? '0 10px' : '0',
      'border-radius': `${MapsMetrics.toolBarButtonRadius}px`,
      background: props.active
        ? UINavigationBarPalette.buttonTone.blue
        : UINavigationBarPalette.buttonTone.blueGray,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={props.onClick}
  >
    <Show when={props.icon}>{(icon) => <CGImage name={icon()} />}</Show>
    <Show when={props.title}>
      {(title) => (
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': '13px',
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)',
            'white-space': 'pre'
          }}
        >
          {title()}
        </span>
      )}
    </Show>
  </button>
)
