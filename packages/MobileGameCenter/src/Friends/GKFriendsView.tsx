import { For } from 'solid-js'
import { GameCenterMetrics } from '../Support/GameCenterMetrics'
import { gameCenterFriends, type GameCenterFriend } from '../Support/GameCenterStore'
import { GKCard } from '../Common/GKCard'
import { GKRibbonButton } from '../Common/GKRibbonButton'
import { GKRow } from '../Common/GKRow'

export const GKFriendsView = (props: {
  width: number
  onOpen: (friend: GameCenterFriend) => void
  onAdd: () => void
}) => (
  <div class="flex w-full flex-col items-center">
    <div style={{ height: `${GameCenterMetrics.cardTopInset}px` }} />

    <div class="w-full">
      <GKCard>
        <For each={gameCenterFriends()}>
          {(friend, index) => (
            <GKRow
              above={friend.status}
              title={friend.alias}
              below={friend.played}
              separator={index() < gameCenterFriends().length - 1}
              onOpen={() => props.onOpen(friend)}
            />
          )}
        </For>
      </GKCard>
    </div>

    <div style={{ height: `${GameCenterMetrics.ribbonButtonHeight / 2}px` }} />

    <GKRibbonButton width={props.width} text="Add Friends" onPress={props.onAdd} />
  </div>
)
