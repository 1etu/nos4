import { For, Show } from 'solid-js'
import { gkLeaderboardFor, gkLocalPlayer } from 'GameKit'
import { GameCenterFonts, GameCenterMetrics, GameCenterPalette } from '../Support/GameCenterMetrics'
import { GKCard } from '../Common/GKCard'
import { GKSectionHeader } from '../Common/GKSectionHeader'

const Row = (props: {
  rank: number
  alias: string
  value: number
  mine: boolean
  separator: boolean
}) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${GameCenterMetrics.leaderboardRowHeight}px`,
      padding: `0 ${GameCenterMetrics.leaderboardRowInset}px`,
      'box-shadow': props.separator
        ? `inset 0 -${GameCenterMetrics.rowSeparator}px 0 rgba(255,255,255,0.12)`
        : 'none'
    }}
  >
    <span
      class="shrink-0 text-right"
      style={{
        width: `${GameCenterMetrics.leaderboardRankWidth}px`,
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.leaderboardFontSize}px`,
        color: props.mine ? GameCenterPalette.white : GameCenterPalette.greenText
      }}
    >
      {props.rank}
    </span>
    <span
      class="min-w-0 flex-1"
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.leaderboardFontSize}px`,
        'font-weight': props.mine ? '700' : '400',
        color: GameCenterPalette.white,
        'padding-left': `${GameCenterMetrics.leaderboardAliasInset}px`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.alias}
    </span>
    <span
      class="shrink-0"
      style={{
        'font-family': GameCenterFonts.clarendon,
        'font-size': `${GameCenterMetrics.leaderboardFontSize}px`,
        'font-weight': '700',
        color: GameCenterPalette.white
      }}
    >
      {props.value}
    </span>
  </div>
)

export const GKLeaderboardCard = (props: { leaderboardId: string }) => {
  const board = () => gkLeaderboardFor(props.leaderboardId)

  return (
    <Show when={board()}>
      {(ready) => (
        <div class="w-full">
          <GKSectionHeader title={ready().title} />
          <GKCard>
            <Show
              when={ready().scores.length > 0}
              fallback={
                <div
                  class="flex w-full items-center justify-center"
                  style={{ height: `${GameCenterMetrics.leaderboardRowHeight}px` }}
                >
                  <span
                    style={{
                      'font-family': GameCenterFonts.clarendon,
                      'font-size': `${GameCenterMetrics.leaderboardFontSize}px`,
                      color: GameCenterPalette.greenText
                    }}
                  >
                    No scores yet
                  </span>
                </div>
              }
            >
              <For each={ready().scores}>
                {(score, index) => (
                  <Row
                    rank={score.rank}
                    alias={score.alias}
                    value={score.value}
                    mine={score.alias === gkLocalPlayer()?.alias}
                    separator={index() < ready().scores.length - 1}
                  />
                )}
              </For>
            </Show>
          </GKCard>
        </div>
      )}
    </Show>
  )
}
