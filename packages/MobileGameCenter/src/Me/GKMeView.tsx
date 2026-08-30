import { gkLeaderboardFor } from 'GameKit'
import { GameCenterMetrics } from '../Support/GameCenterMetrics'
import { GameCenterCatalog } from '../Support/GameCenterCatalog'
import { gameCenterFriends, gameCenterStatus } from '../Support/GameCenterStore'
import { GKRibbonButton } from '../Common/GKRibbonButton'
import { GKProfileView } from './GKProfileView'
import { GKStatusField } from './GKStatusField'

const StatusPlaceholder = 'Status'
const SignOutTitle = 'Sign Out'

const points = (): number => {
  let total = 0
  for (const entry of GameCenterCatalog) {
    const best = gkLeaderboardFor(entry.leaderboardId)?.localPlayerScore
    if (best !== undefined && best !== null) total += best
  }
  return total
}

export const GKMeView = (props: {
  width: number
  alias: string
  onEditStatus: () => void
  onSignOut: () => void
}) => (
  <GKProfileView
    width={props.width}
    alias={props.alias}
    friends={String(gameCenterFriends().length)}
    friendsLabel="FRIENDS"
    games={String(GameCenterCatalog.length)}
    gamesLabel={GameCenterCatalog.length === 1 ? 'GAME' : 'GAMES'}
    achievements={String(points())}
    achievementsLabel="POINTS"
  >
    <div style={{ height: `${GameCenterMetrics.topSpacer}px` }} />

    <GKStatusField
      text={gameCenterStatus() === '' ? StatusPlaceholder : gameCenterStatus()}
      onPress={props.onEditStatus}
    />

    <div style={{ height: `${GameCenterMetrics.ribbonButtonHeight / 2}px` }} />

    <GKRibbonButton width={props.width} text={SignOutTitle} onPress={props.onSignOut} />
  </GKProfileView>
)
