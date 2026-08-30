import { CGImage } from 'CoreGraphics'
import { UINavigationBarMetrics, UINavigationBarPalette } from 'UIKit'
import { MessagesMetrics } from '../Support/MessagesMetrics'

export const ComposeButton = (props: { onPress: () => void }) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${UINavigationBarMetrics.buttonHeight}px`,
      padding: `0 ${MessagesMetrics.composeButtonPaddingX}px`,
      'border-radius': `${UINavigationBarMetrics.buttonRadius}px`,
      background: UINavigationBarPalette.buttonTone.blueGray,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={() => props.onPress()}
  >
    <CGImage name="compose" />
  </button>
)
