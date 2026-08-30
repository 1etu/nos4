import { CGImage } from 'CoreGraphics'
import { MapsMetrics } from '../Support/MapsMetrics'
import type { MKPoint } from './MKProjection'

export const MKUserLocationDot = (props: { at: MKPoint }) => (
  <div
    class="pointer-events-none absolute"
    style={{
      left: `${props.at.x - MapsMetrics.trackingDotWidth / 2}px`,
      top: `${props.at.y - MapsMetrics.trackingDotHeight / 2}px`,
      'z-index': '1'
    }}
  >
    <CGImage name="TrackingDot" />
  </div>
)
