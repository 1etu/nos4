import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkTile } from '../Common/GKTexture'

export const GKStatusField = (props: { text: string; onPress: () => void }) => (
  <button
    type="button"
    class="relative flex w-full items-center justify-center"
    style={{ height: `${GameCenterMetrics.statusOuterHeight}px` }}
    onClick={() => props.onPress()}
  >
    <div
      class="absolute"
      style={{
        left: `${GameCenterMetrics.statusOuterInsetX}px`,
        right: `${GameCenterMetrics.statusOuterInsetX}px`,
        height: `${GameCenterMetrics.statusOuterHeight}px`,
        'border-radius': `${GameCenterMetrics.statusOuterRadius}px`,
        background: gkTile('GKCellBorderTexture'),
        'box-shadow': GameCenterPalette.cardShadow
      }}
    />
    <div
      class="absolute"
      style={{
        left: `${GameCenterMetrics.statusMidInsetX}px`,
        right: `${GameCenterMetrics.statusMidInsetX}px`,
        height: `${GameCenterMetrics.statusMidHeight}px`,
        'border-radius': `${GameCenterMetrics.statusMidRadius}px`,
        background: gkTile('GKBackgroundPortrait')
      }}
    />
    <div
      class="absolute"
      style={{
        left: `${GameCenterMetrics.statusInnerInsetX}px`,
        right: `${GameCenterMetrics.statusInnerInsetX}px`,
        height: `${GameCenterMetrics.statusInnerHeight}px`,
        'border-radius': `${GameCenterMetrics.statusInnerRadius}px`,
        background: gkTile('GKAliasShadowTexture'),
        filter: 'brightness(1.07)',
        'box-shadow': GameCenterPalette.statusInnerShadow
      }}
    />
    <span
      class="relative"
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.statusFontSize}px`,
        'line-height': '1',
        color: GameCenterPalette.greenText,
        'text-shadow': GameCenterPalette.statusShadow
      }}
    >
      {props.text}
    </span>
  </button>
)
