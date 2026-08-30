import { assetPointSize, assetURL } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsTexturedButton = (props: {
  title: string
  width: number
  onClick: () => void
}) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      width: `${props.width}px`,
      height: `${MapsMetrics.panelButtonHeight}px`,
      'background-image': `url(${assetURL('UITexturedButton')})`,
      'background-size': `${props.width}px ${assetPointSize('UITexturedButton').height}px`,
      'background-repeat': 'no-repeat'
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MapsMetrics.panelButtonFontSize}px`,
        'font-weight': '700',
        color: MapsPalette.texturedInk,
        'text-shadow': '0 0.8px 0 rgba(255,255,255,0.28)'
      }}
    >
      {props.title}
    </span>
  </button>
)
