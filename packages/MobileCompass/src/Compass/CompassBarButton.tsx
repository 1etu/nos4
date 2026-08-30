import { CGImage } from 'CoreGraphics'
import type { AssetName } from 'CoreGraphics'
import { CompassMetrics, CompassPalette } from '../Support/CompassMetrics'

export const CompassBarButton = (props: {
  glyph: AssetName
  glyphWidth: number
  paddingX: number
  onPress?: () => void
}) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${CompassMetrics.buttonHeight}px`,
      padding: `0 ${props.paddingX}px`,
      'border-radius': `${CompassMetrics.buttonRadius}px`,
      background: CompassPalette.buttonFace,
      'box-shadow': CompassPalette.buttonShadow
    }}
    onClick={() => props.onPress?.()}
  >
    <CGImage name={props.glyph} style={{ width: `${props.glyphWidth}px`, height: 'auto' }} />
  </button>
)
