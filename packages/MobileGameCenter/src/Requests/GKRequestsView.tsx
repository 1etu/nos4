import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'

export const GKRequestsView = () => (
  <div class="flex h-full w-full items-center justify-center">
    <span
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.emptyFontSize}px`,
        'line-height': '1',
        color: GameCenterPalette.white,
        'text-shadow': GameCenterPalette.whiteShadow
      }}
    >
      No Friend Requests
    </span>
  </div>
)
