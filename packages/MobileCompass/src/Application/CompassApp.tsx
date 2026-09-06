import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIStatusBar } from 'UIKit'
import { CompassBackground } from '../Compass/CompassBackground'
import { CompassFace } from '../Compass/CompassFace'
import { CompassPrompt } from '../Compass/CompassPrompt'
import { CompassToolBar } from '../Compass/CompassToolBar'
import { CompassMetrics, CompassPalette } from '../Support/CompassMetrics'
import { CompassHeadingState, createCompassReading } from '../Support/CompassHeading'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CompassApp = (props: {
  width: number
  height: number
  onOpenMaps: () => void
}) => {
  const reading = createCompassReading()
  const live = () => reading.state() === CompassHeadingState.reading

  return (
    <div
      class="relative h-full w-full overflow-hidden"
      style={{ background: CompassPalette.backdrop }}
    >
      <CompassBackground width={props.width} height={props.height} />

      <div class="absolute inset-0 flex flex-col">
        <UIStatusBar />
        <div class="flex flex-col items-center">
          <CGImage
            name="DeviceArrow"
            style={{
              width: `${CompassMetrics.arrowWidth}px`,
              height: `${CompassMetrics.arrowHeight}px`,
              'margin-top': `${CompassMetrics.arrowTopInset}px`
            }}
          />
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CompassMetrics.headingFontSize}px`,
              'line-height': '1',
              'margin-top': `${CompassMetrics.headingTopInset}px`,
              'white-space': 'nowrap',
              color: CompassPalette.text,
              'text-shadow': CompassPalette.textShadow
            }}
          >
            {reading.headingText()}
          </span>
        </div>
        <div class="flex-1" />
        <CompassToolBar coordinateText={reading.coordinateText()} onOpenMaps={props.onOpenMaps} />
      </div>

      <div
        class="absolute inset-x-0 flex justify-center"
        style={{
          top: `${props.height * CompassMetrics.faceTopRatio}px`,
          opacity: `${live() ? 1 : CompassMetrics.faceDimOpacity}`
        }}
      >
        <CompassFace width={props.width} heading={reading.heading()} />
      </div>

      <Show when={reading.state() !== CompassHeadingState.reading && reading.state() !== CompassHeadingState.waiting}>
        <CompassPrompt state={reading.state()} onRequest={reading.requestAccess} />
      </Show>
    </div>
  )
}
