import { For, Show } from 'solid-js'
import { CGImage, CGResizableImage, type AssetName } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkCover } from '../Common/GKTexture'

export type GameCenterTab = 'Me' | 'Friends' | 'Games' | 'Requests'

export const GameCenterTabs: readonly GameCenterTab[] = ['Me', 'Friends', 'Games', 'Requests']

const iconWidth = (tab: GameCenterTab): number => {
  if (tab === 'Games') return GameCenterMetrics.tabIconWidthGames
  if (tab === 'Friends') return GameCenterMetrics.tabIconWidthFriends
  return GameCenterMetrics.tabIconWidth
}

export const GKTabBar = (props: {
  width: number
  selected: GameCenterTab
  onSelect: (tab: GameCenterTab) => void
}) => (
  <div
    class="relative flex shrink-0 items-end"
    style={{
      height: `${GameCenterMetrics.tabBarHeight}px`,
      background: gkCover('GKTabbarPortrait')
    }}
  >
    <div class="flex w-full" style={{ height: `${GameCenterMetrics.tabRowHeight}px` }}>
      <For each={GameCenterTabs}>
        {(tab) => {
          const active = () => props.selected === tab
          const icon = (): AssetName =>
            `GKTabbarIcon${tab}${active() ? 'Active' : 'Inactive'}` as AssetName
          return (
            <button
              type="button"
              class="relative flex flex-1 flex-col items-center justify-end"
              style={{
                gap: `${GameCenterMetrics.tabLabelGap}px`,
                'padding-bottom': `${GameCenterMetrics.tabLabelInsetBottom}px`
              }}
              onClick={() => props.onSelect(tab)}
            >
              <Show when={active()}>
                <CGResizableImage
                  name="GKTabbarActiveTab"
                  width={props.width / GameCenterTabs.length - GameCenterMetrics.tabActiveInset}
                  height={GameCenterMetrics.tabActiveHeight}
                  class="absolute"
                  style={{ bottom: '0' }}
                />
              </Show>
              <CGImage
                name={icon()}
                class="relative"
                style={{
                  width: `${iconWidth(tab)}px`,
                  height: `${GameCenterMetrics.tabIconHeight}px`,
                  'object-fit': 'contain'
                }}
              />
              <span
                class="relative"
                style={{
                  'font-family': GameCenterFonts.helvetica,
                  'font-size': `${GameCenterMetrics.tabLabelFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  color: GameCenterPalette.white
                }}
              >
                {tab}
              </span>
            </button>
          )
        }}
      </For>
    </div>
  </div>
)
