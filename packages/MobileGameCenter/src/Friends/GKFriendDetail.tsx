import { For } from 'solid-js'
import { GameCenterMetrics } from '../Support/GameCenterMetrics'
import { GameCenterCatalog } from '../Support/GameCenterCatalog'
import type { GameCenterFriend } from '../Support/GameCenterStore'
import { GKCard } from '../Common/GKCard'
import { GKSectionHeader } from '../Common/GKSectionHeader'
import { GKProfileView } from '../Me/GKProfileView'
import { GKGameRow } from '../Games/GKGameRow'

const InCommon = 'Games in Common'
const RankedHigher = 'Ranked higher than me'

export const GKFriendDetail = (props: {
  width: number
  friend: GameCenterFriend
  onOpenGame: () => void
}) => (
  <GKProfileView
    width={props.width}
    alias={props.friend.alias}
    friends="1"
    friendsLabel="FRIEND"
    games={String(GameCenterCatalog.length)}
    gamesLabel={GameCenterCatalog.length === 1 ? 'GAME' : 'GAMES'}
    achievements="1"
    achievementsLabel="ACHIEVEMENT"
  >
    <div style={{ height: `${GameCenterMetrics.sectionGap}px` }} />

    <GKSectionHeader title={InCommon} />

    <div class="w-full">
      <GKCard>
        <For each={GameCenterCatalog}>
          {(entry, index) => (
            <GKGameRow
              title={entry.title}
              icon={entry.icon}
              best={InCommon}
              rank={RankedHigher}
              separator={index() < GameCenterCatalog.length - 1}
              onOpen={() => props.onOpenGame()}
            />
          )}
        </For>
      </GKCard>
    </div>
  </GKProfileView>
)
