import { CGResizableImage, type AssetName } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'

export const GKRibbon = (props: { ribbon: AssetName; value: string; label: string }) => (
  <div class="flex flex-1 flex-col items-center" style={{ gap: `${GameCenterMetrics.ribbonLabelGap}px` }}>
    <div
      class="relative flex items-center justify-center"
      style={{
        width: `${GameCenterMetrics.ribbonWidth}px`,
        height: `${GameCenterMetrics.ribbonHeight}px`
      }}
    >
      <CGResizableImage
        name={props.ribbon}
        width={GameCenterMetrics.ribbonWidth}
        height={GameCenterMetrics.ribbonHeight}
        class="absolute inset-0"
      />
      <span
        class="relative"
        style={{
          'font-family': GameCenterFonts.clarendon,
          'font-size': `${GameCenterMetrics.ribbonNumberFontSize}px`,
          'line-height': '1',
          transform: `translateY(${GameCenterMetrics.ribbonNumberOffsetY}px)`,
          color: GameCenterPalette.white,
          'text-shadow': GameCenterPalette.ribbonNumberShadow
        }}
      >
        {props.value}
      </span>
    </div>
    <span
      style={{
        'font-family': GameCenterFonts.helvetica,
        'font-size': `${GameCenterMetrics.ribbonLabelFontSize}px`,
        'font-weight': '700',
        'line-height': '1',
        'white-space': 'nowrap',
        color: GameCenterPalette.white,
        'text-shadow': GameCenterPalette.ribbonLabelShadow
      }}
    >
      {props.label}
    </span>
  </div>
)
