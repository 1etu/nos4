import { CGImage } from 'CoreGraphics'
import { UISegmentedControl } from 'UIKit'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsSegment, type MapsSegmentValue } from '../Support/MapsTypes'
import { MapsBarButton } from './MapsBarButton'

const Segments = ['Search', 'Directions'] as const

export const MapsToolBar = (props: {
  segment: MapsSegmentValue
  tracking: boolean
  curled: boolean
  onSegment: (segment: MapsSegmentValue) => void
  onTracking: () => void
  onCurl: () => void
}) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${MapsMetrics.toolBarHeight}px`,
      background: MapsPalette.toolBarGradient,
      'border-top': `1px solid ${MapsPalette.barEdge}`,
      padding: `0 ${MapsMetrics.toolBarInsetX}px`
    }}
  >
    <MapsBarButton icon="TrackingLocation" active={props.tracking} onClick={props.onTracking} />
    <div class="flex flex-1 justify-center">
      <UISegmentedControl
        segments={Segments}
        selected={props.segment === MapsSegment.search ? 0 : 1}
        width={MapsMetrics.segmentedWidth}
        onSelect={(index) =>
          props.onSegment(index === 0 ? MapsSegment.search : MapsSegment.directions)
        }
      />
    </div>
    <button type="button" class="shrink-0" onClick={props.onCurl}>
      <CGImage
        name={props.curled ? 'UIButtonBarPageCurlSelected' : 'UIButtonBarPageCurlDefault'}
      />
    </button>
  </div>
)
