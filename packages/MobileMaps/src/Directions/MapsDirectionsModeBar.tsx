import { UIBarButton } from 'UIKit'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import type { MapsTransportValue } from '../Support/MapsTypes'
import { MapsTransportControl } from './MapsTransportControl'

export const MapsDirectionsModeBar = (props: {
  transport: MapsTransportValue
  onTransport: (value: MapsTransportValue) => void
  onEdit: () => void
  onStart: () => void
}) => (
  <div
    class="relative flex items-center justify-between"
    style={{
      height: `${MapsMetrics.titleBarHeight}px`,
      background: MapsPalette.barGradient,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`,
      padding: `0 ${MapsMetrics.toolBarInsetX}px`
    }}
  >
    <UIBarButton title=" Edit " tone="blueGray" onClick={props.onEdit} />
    <MapsTransportControl selected={props.transport} onSelect={props.onTransport} />
    <UIBarButton title="Start" tone="blue" onClick={props.onStart} />
  </div>
)
