import { createMemo, For } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { IconTile } from './IconTile'
import { DockApplications, type ApplicationRecord } from '../Support/Bundles'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const gridStyle = {
  display: 'grid',
  'grid-template-columns': `repeat(${SpringBoardMetrics.columns}, ${SpringBoardMetrics.cellWidth}px)`,
  'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px`,
  'justify-content': 'center',
  'justify-items': 'center'
} as const

const Reflection = (props: { app: ApplicationRecord }) => (
  <div
    style={{
      width: `${SpringBoardMetrics.iconSize}px`,
      height: `${SpringBoardMetrics.reflectionBoxHeight}px`,
      overflow: 'hidden',
      transform: `translateY(${SpringBoardMetrics.reflectionOuterOffset}px)`
    }}
  >
    <div
      class="flex h-full w-full items-center justify-center"
      style={{
        opacity: `${SpringBoardMetrics.reflectionOpacity}`,
        transform: `translateY(${SpringBoardMetrics.reflectionInnerOffset}px) scaleY(-1)`
      }}
    >
      <img
        src={assetURL(props.app.icon)}
        alt=""
        draggable={false}
        style={{
          width: `${SpringBoardMetrics.iconSize}px`,
          height: `${SpringBoardMetrics.iconSize}px`
        }}
      />
    </div>
  </div>
)

const wobbleEntry = () => ({
  rotation:
    (SpringBoardMetrics.jiggleRotationMin +
      Math.random() *
        (SpringBoardMetrics.jiggleRotationMax - SpringBoardMetrics.jiggleRotationMin)) *
    SpringBoardMetrics.jiggleRotationScale,
  shift:
    (Math.random() * 2 - 1) *
    SpringBoardMetrics.jiggleOffsetRange *
    SpringBoardMetrics.jiggleOffsetScale,
  delay: Math.random() * SpringBoardMetrics.jigglePeriod
})

export const Dock = (props: {
  jiggling: boolean
  onLaunch: (app: ApplicationRecord) => void
}) => {
  const wobble = createMemo(() => DockApplications.map(wobbleEntry))

  return (
  <div class="relative w-full">
    <img
      src={assetURL('SBDockBG_2')}
      alt=""
      draggable={false}
      class="absolute inset-x-0 bottom-0 w-full"
      style={{
        height: `${SpringBoardMetrics.dockHeight}px`,
        opacity: `${SpringBoardMetrics.dockOpacity}`
      }}
    />
    <div class="relative">
      <div class="absolute inset-x-0 top-0" style={gridStyle}>
        <For each={DockApplications}>{(app) => <Reflection app={app} />}</For>
      </div>
      <div class="relative" style={gridStyle}>
        <For each={DockApplications}>
          {(app, at) => (
            <div
              style={{
                animation: props.jiggling
                  ? `sbJiggle ${SpringBoardMetrics.jigglePeriod}s linear ${-(wobble()[at()]?.delay ?? 0)}s infinite`
                  : 'none',
                '--jiggle-rotation': `${wobble()[at()]?.rotation ?? 0}deg`,
                '--jiggle-shift': `${wobble()[at()]?.shift ?? 0}px`
              }}
            >
              <IconTile app={app} showShadow={false} onLaunch={props.onLaunch} />
            </div>
          )}
        </For>
      </div>
    </div>
  </div>
  )
}
