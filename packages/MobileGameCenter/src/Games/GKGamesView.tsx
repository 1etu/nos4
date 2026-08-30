import { For, onCleanup, onMount } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { gkLeaderboardFor, gkLoadLeaderboard, GKScoreDidSubmit } from 'GameKit'
import { GameCenterMetrics } from '../Support/GameCenterMetrics'
import { GameCenterCatalog } from '../Support/GameCenterCatalog'
import { gkBestScoreLabel, gkRankLabel } from '../Support/GameCenterFormat'
import { GKCard } from '../Common/GKCard'
import { GKRibbonButton } from '../Common/GKRibbonButton'
import { GKGameRow } from './GKGameRow'
import { GKLeaderboardCard } from './GKLeaderboardCard'

export const GKGamesView = (props: {
  width: number
  onOpenGame: (bundleId: string) => void
}) => {
  const load = () => {
    for (const entry of GameCenterCatalog) void gkLoadLeaderboard(entry.leaderboardId)
  }

  onMount(() => {
    load()
    onCleanup(NSNotificationCenter.addObserver(GKScoreDidSubmit, load))
  })

  return (
    <div class="flex w-full flex-col items-center">
      <div style={{ height: `${GameCenterMetrics.cardTopInset}px` }} />

      <div class="w-full">
        <GKCard>
          <For each={GameCenterCatalog}>
            {(entry, index) => (
              <GKGameRow
                title={entry.title}
                icon={entry.icon}
                best={gkBestScoreLabel(gkLeaderboardFor(entry.leaderboardId))}
                rank={gkRankLabel(gkLeaderboardFor(entry.leaderboardId))}
                separator={index() < GameCenterCatalog.length - 1}
                onOpen={() => props.onOpenGame(entry.bundleId)}
              />
            )}
          </For>
        </GKCard>
      </div>

      <For each={GameCenterCatalog}>
        {(entry) => <GKLeaderboardCard leaderboardId={entry.leaderboardId} />}
      </For>

      <div style={{ height: `${GameCenterMetrics.ribbonButtonHeight / 2}px` }} />

      <For each={GameCenterCatalog}>
        {(entry) => (
          <GKRibbonButton
            width={props.width}
            text={`Play ${entry.title}`}
            onPress={() => props.onOpenGame(entry.bundleId)}
          />
        )}
      </For>
    </div>
  )
}
