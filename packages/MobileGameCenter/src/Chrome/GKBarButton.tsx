import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkCover } from '../Common/GKTexture'

export const GKBarButton = (props: { title: string; onPress: () => void }) => (
  <button
    type="button"
    class="flex items-center justify-center overflow-hidden"
    style={{
      height: `${GameCenterMetrics.plusButtonSize}px`,
      padding: `0 ${GameCenterMetrics.barButtonPaddingX}px`,
      'border-radius': `${GameCenterMetrics.plusButtonRadius}px`,
      background: gkCover('GKNavbarPortrait'),
      'box-shadow': GameCenterPalette.plusInnerShadow
    }}
    onClick={() => props.onPress()}
  >
    <span
      style={{
        'font-family': GameCenterFonts.helvetica,
        'font-size': `${GameCenterMetrics.backButtonFontSize}px`,
        'font-weight': '700',
        'line-height': '1',
        color: GameCenterPalette.white,
        'text-shadow': GameCenterPalette.backLabelShadow
      }}
    >
      {props.title}
    </span>
  </button>
)
