import { CGImage, assetPointSize } from 'CoreGraphics'
import { UINavigationBarMetrics, UINavigationBarPalette } from 'UIKit'
import { PhoneMetrics } from '../Support/PhoneMetrics'

const Glyph = assetPointSize('UIButtonBarPlus')

export const PhonePlusButton = (props: { onPress: () => void }) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${UINavigationBarMetrics.buttonHeight}px`,
      padding: `0 ${UINavigationBarMetrics.buttonPaddingX}px`,
      'border-radius': `${UINavigationBarMetrics.buttonRadius}px`,
      background: UINavigationBarPalette.buttonTone.blueGray,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={() => props.onPress()}
  >
    <CGImage
      name="UIButtonBarPlus"
      style={{
        width: `${PhoneMetrics.plusGlyphWidth}px`,
        height: `${(PhoneMetrics.plusGlyphWidth * Glyph.height) / Glyph.width}px`
      }}
    />
  </button>
)
