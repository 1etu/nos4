import { CGImage } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'

export const GKSectionHeader = (props: { title: string }) => (
  <div
    class="flex w-full items-center justify-center"
    style={{
      height: `${GameCenterMetrics.sectionHeaderHeight}px`,
      gap: `${GameCenterMetrics.rowTextGap}px`,
      filter: 'drop-shadow(0 1px 0.5px rgba(0,0,0,0.2))'
    }}
  >
    <CGImage name="GKSectionHeaderLeftArrow" />
    <span
      style={{
        color: GameCenterPalette.sectionTitle,
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.sectionTitleFontSize}px`,
        'line-height': '1',
        'white-space': 'nowrap',
        padding: `0 ${GameCenterMetrics.rowTextGap * 4}px`
      }}
    >
      {props.title}
    </span>
    <CGImage name="GKSectionHeaderRightArrow" />
  </div>
)
