import { CGResizableImage } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'

export const GKRibbonButton = (props: { width: number; text: string; onPress: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${props.width - GameCenterMetrics.ribbonButtonInsetX * 2}px`,
      height: `${GameCenterMetrics.ribbonButtonHeight}px`
    }}
    onClick={() => props.onPress()}
  >
    <CGResizableImage
      name="GKRibbonButton"
      width={props.width - GameCenterMetrics.ribbonButtonInsetX * 2}
      height={GameCenterMetrics.ribbonButtonHeight}
      class="absolute inset-0"
    />
    <span
      class="relative"
      style={{
        color: GameCenterPalette.ribbonButtonLabel,
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.ribbonButtonFontSize}px`,
        'line-height': '1',
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis',
        'max-width': `calc(100% - ${GameCenterMetrics.ribbonLabelInsetX * 2}px)`,
        transform: `translateY(${GameCenterMetrics.ribbonButtonOffsetY}px)`,
        'text-shadow': GameCenterPalette.ribbonButtonShadow
      }}
    >
      {props.text}
    </span>
  </button>
)
