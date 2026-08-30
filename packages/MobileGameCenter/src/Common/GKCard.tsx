import type { JSX } from 'solid-js'
import { GameCenterMetrics, GameCenterPalette } from '../Support/GameCenterMetrics'
import { gkTile } from './GKTexture'

export const GKCard = (props: { children: JSX.Element }) => (
  <div
    class="relative"
    style={{
      margin: `0 ${GameCenterMetrics.cardInsetX}px`,
      'border-radius': `${GameCenterMetrics.cardRadius}px`,
      background: gkTile('GKBackgroundPortrait'),
      'box-shadow': GameCenterPalette.cardShadow
    }}
  >
    {props.children}
    <div
      class="pointer-events-none absolute inset-0"
      style={{
        'border-radius': `${GameCenterMetrics.cardRadius}px`,
        border: `${GameCenterMetrics.cardBorder}px solid transparent`,
        background: gkTile('GKCellBorderTexture'),
        '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        'mask-composite': 'exclude'
      }}
    />
  </div>
)
