import { createSignal, For } from 'solid-js'
import { assetPointSize, assetURL } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { MultitaskingAppSection } from './MultitaskingAppSection'
import { MultitaskingAudioControls } from './MultitaskingAudioControls'
import { MultitaskingMusicControls } from './MultitaskingMusicControls'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'
import type { ApplicationRecord } from '../Support/Bundles'

export const multitaskingTrayHeight =
  SpringBoardMetrics.cellWidth + SpringBoardMetrics.multitaskingTrayPadding

const pageAnimation = caAnimation(
  SpringBoardMetrics.pageTransitionDuration,
  CAMediaTimingFunction.easeInOut
)

const chunked = <T,>(items: readonly T[], size: number): T[][] => {
  const pages: T[][] = []
  for (let at = 0; at < items.length; at += size) pages.push(items.slice(at, at + size))
  return pages
}

export const MultitaskingTray = (props: {
  recents: readonly ApplicationRecord[]
  activeBundleId?: string
  jiggling: boolean
  onLaunch: (app: ApplicationRecord) => void
  onHold: () => void
  onQuit: (app: ApplicationRecord) => void
  onOpeniPod: () => void
}) => {
  const [page, setPage] = createSignal<number>(SpringBoardMetrics.multitaskingPages)

  const sections = () => {
    const visible = props.recents.filter((app) => app.bundleId !== props.activeBundleId)
    const pages = chunked(visible, SpringBoardMetrics.columns)
    return pages.length === 0 ? [[]] : pages
  }

  const pageCount = () => SpringBoardMetrics.multitaskingPages + sections().length

  let origin = 0

  return (
    <div
      class="relative w-full overflow-hidden"
      style={{
        height: `${multitaskingTrayHeight}px`,
        'background-image': `url(${assetURL('FolderSwitcherBG')})`,
        'background-repeat': 'repeat',
        'background-size': `${assetPointSize('FolderSwitcherBG').width}px ${assetPointSize('FolderSwitcherBG').height}px`
      }}
      onPointerDown={(event) => {
        origin = event.clientX
      }}
      onPointerUp={(event) => {
        const travel = event.clientX - origin
        if (Math.abs(travel) < SpringBoardMetrics.multitaskingSwipeThreshold) return
        const next = travel < 0 ? page() + 1 : page() - 1
        setPage(Math.min(Math.max(next, 0), pageCount() - 1))
      }}
    >
      <div
        class="flex h-full"
        style={{
          width: `${pageCount() * 100}%`,
          transform: `translateX(-${(page() * 100) / pageCount()}%)`,
          transition: caTransition(['transform'], pageAnimation)
        }}
      >
        <div class="h-full shrink-0" style={{ width: `${100 / pageCount()}%` }}>
          <MultitaskingAudioControls />
        </div>
        <div class="h-full shrink-0" style={{ width: `${100 / pageCount()}%` }}>
          <MultitaskingMusicControls onOpeniPod={props.onOpeniPod} />
        </div>
        <For each={sections()}>
          {(apps) => (
            <div class="h-full shrink-0" style={{ width: `${100 / pageCount()}%` }}>
            <MultitaskingAppSection
              apps={apps}
              jiggling={props.jiggling}
              onLaunch={props.onLaunch}
              onHold={props.onHold}
              onQuit={props.onQuit}
            />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
