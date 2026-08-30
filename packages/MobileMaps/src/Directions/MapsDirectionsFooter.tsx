import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MapsDirectionsFooter = (props: { distance: string; duration: string }) => (
  <div
    class="flex items-center justify-center"
    style={{
      height: `${MapsMetrics.footerHeight}px`,
      background: MapsPalette.footerFill,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': '16px',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.61)',
        'white-space': 'nowrap'
      }}
    >
      <span style={{ 'font-weight': '700' }}>{props.distance}</span>
      <span>{props.duration.length > 0 ? ` ${props.duration}` : ''}</span>
    </span>
  </div>
)
