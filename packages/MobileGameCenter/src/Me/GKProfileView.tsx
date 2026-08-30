import type { JSX } from 'solid-js'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { GKAliasBanner } from '../Common/GKAliasBanner'
import { GKRibbon } from '../Common/GKRibbon'

export const GKProfileView = (props: {
  width: number
  alias: string
  friends: string
  friendsLabel: string
  games: string
  gamesLabel: string
  achievements: string
  achievementsLabel: string
  children: JSX.Element
}) => (
  <div class="flex w-full flex-col items-center">
    <div style={{ height: `${GameCenterMetrics.topSpacer}px` }} />

    <span
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.isLabelFontSize}px`,
        'line-height': '1',
        'white-space': 'nowrap',
        color: GameCenterPalette.isLabel,
        'text-shadow': GameCenterPalette.isLabelShadow
      }}
    >
      {`${props.alias} is...`}
    </span>

    <GKAliasBanner alias={props.alias} width={props.width} />

    <div style={{ height: `${GameCenterMetrics.topSpacer}px` }} />

    <div
      class="flex w-full overflow-hidden"
      style={{ padding: `0 ${GameCenterMetrics.ribbonColumnInset}px` }}
    >
      <GKRibbon ribbon="GKRibbonRed" value={props.friends} label={props.friendsLabel} />
      <GKRibbon ribbon="GKRibbonYellow" value={props.games} label={props.gamesLabel} />
      <GKRibbon ribbon="GKRibbonBlue" value={props.achievements} label={props.achievementsLabel} />
    </div>

    {props.children}
  </div>
)
