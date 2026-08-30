import { createMemo, For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { IconTile } from '../HomeScreen/IconTile'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'
import type { ApplicationRecord } from '../Support/Bundles'

const between = (low: number, high: number): number => low + Math.random() * (high - low)

export const MultitaskingAppSection = (props: {
  apps: readonly ApplicationRecord[]
  jiggling: boolean
  onLaunch: (app: ApplicationRecord) => void
  onHold: () => void
  onQuit: (app: ApplicationRecord) => void
}) => {
  const wobble = createMemo(() =>
    props.apps.map(() => ({
      rotation:
        between(SpringBoardMetrics.jiggleRotationMin, SpringBoardMetrics.jiggleRotationMax) *
        SpringBoardMetrics.jiggleRotationScale,
      shift:
        between(-SpringBoardMetrics.jiggleOffsetRange, SpringBoardMetrics.jiggleOffsetRange) *
        SpringBoardMetrics.jiggleOffsetScale,
      delay: Math.random() * SpringBoardMetrics.jigglePeriod
    }))
  )

  let holdTimer: ReturnType<typeof setTimeout> | undefined

  const beginHold = () => {
    holdTimer = setTimeout(props.onHold, SpringBoardMetrics.multitaskingHoldDelay * 1000)
  }

  const cancelHold = () => {
    if (!holdTimer) return
    clearTimeout(holdTimer)
    holdTimer = undefined
  }

  return (
    <div
      class="flex h-full w-full items-end justify-center"
      style={{ 'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px` }}
    >
      <For each={props.apps}>
        {(app, at) => (
          <div
            class="relative"
            style={{
              width: `${SpringBoardMetrics.cellWidth}px`,
              '--jiggle-rotation': `${wobble()[at()]?.rotation ?? 0}deg`,
              '--jiggle-shift': `${wobble()[at()]?.shift ?? 0}px`,
              animation: props.jiggling
                ? `sbJiggle ${SpringBoardMetrics.jigglePeriod}s linear ${-(wobble()[at()]?.delay ?? 0)}s infinite`
                : 'none'
            }}
            onPointerDown={beginHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onContextMenu={(event) => event.preventDefault()}
          >
            <IconTile
              app={app}
              showShadow={false}
              onLaunch={() => {
                if (props.jiggling) return
                props.onLaunch(app)
              }}
            />
            <Show when={props.jiggling}>
              <button
                type="button"
                class="absolute left-0 top-0"
                style={{ transform: `translateY(${SpringBoardMetrics.quitBoxOffsetY}px)` }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation()
                  props.onQuit(app)
                }}
              >
                <CGImage name="SwitcherQuitBox" />
              </button>
            </Show>
          </div>
        )}
      </For>
    </div>
  )
}
