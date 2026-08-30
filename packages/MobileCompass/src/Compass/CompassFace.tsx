import { CGImage } from 'CoreGraphics'
import type { JSX } from 'solid-js'
import { CompassMetrics } from '../Support/CompassMetrics'

const layer = (
  width: number,
  height: number,
  offsetX: number,
  offsetY: number,
  rotation: number
): JSX.CSSProperties => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: `${width}px`,
  height: `${height}px`,
  transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px) translate(-50%, -50%)`
})

export const CompassFace = (props: { width: number; heading: number }) => {
  const bezel = () => props.width * CompassMetrics.bezelRatio
  const disc = () => props.width * CompassMetrics.discRatio
  const rim = () => props.width * CompassMetrics.rimRatio - CompassMetrics.rimInset * 2
  const direction = () => props.width * CompassMetrics.directionRatio
  const pivot = () => props.width * CompassMetrics.pivotRatio
  const spin = () => -props.heading

  return (
    <div class="relative shrink-0" style={{ width: `${bezel()}px`, height: `${bezel()}px` }}>
      <CGImage name="CompassBezel" style={layer(bezel(), bezel(), 0, 0, 0)} />
      <CGImage name="CompassFace" style={layer(disc(), disc(), 0, 0, 0)} />
      <CGImage
        name="CompassFaceHighlight"
        style={layer(
          props.width * CompassMetrics.highlightWidthRatio,
          props.width * CompassMetrics.highlightHeightRatio,
          0,
          -props.width * CompassMetrics.highlightOffsetYRatio,
          0
        )}
      />
      <CGImage name="CompassFaceRim" style={layer(rim(), rim(), 0, 0, spin())} />
      <CGImage
        name="CompassFaceDirection"
        style={layer(
          direction(),
          direction(),
          props.width * CompassMetrics.directionOffsetXRatio,
          -props.width * CompassMetrics.directionOffsetYRatio,
          spin()
        )}
      />
      <CGImage name="CompassPivot" style={layer(pivot(), pivot(), 0, 0, 0)} />
      <CGImage name="CompassFaceShadow" style={layer(disc(), disc(), 0, 0, 0)} />
    </div>
  )
}
