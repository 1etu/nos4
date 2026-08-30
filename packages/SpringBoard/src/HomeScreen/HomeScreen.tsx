import { createEffect, createSignal, on, onCleanup, Show } from 'solid-js'
import { DeviceContentHeight, DeviceMetrics } from 'Device'
import { assetURL } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition, type CAAnimation } from 'CoreAnimation'
import { UIStatusBar , uiWallpaperHome } from 'UIKit'
import { Dock } from './Dock'
import { FolderStrip } from './FolderStrip'
import { IconPage } from './IconPage'
import { PageIndicator } from './PageIndicator'
import { SearchPage } from './SearchPage'
import type { ApplicationRecord } from '../Support/Bundles'
import {
  sbIconExtractFromFolder,
  sbIconPages,
  sbIconReorderFolder,
  type SBIconEntry
} from '../Support/SBIconState'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

export const SearchPageIndex = 0
export const AppsPageIndex = 1
const PageCount = 3
const SwipeThreshold = 45
const EdgeResistance = 0.35
const StageWidth = DeviceMetrics.stageWidth

const pageAnimation = caAnimation(
  SpringBoardMetrics.pageTransitionDuration,
  CAMediaTimingFunction.easeInOut
)

interface OpenFolder {
  readonly page: number
  readonly index: number
  readonly stripTop: number
  readonly notchCx: number
}

export interface SBHomeAction {
  current?: () => boolean
}

export const HomeScreen = (props: {
  appsScale: number
  dockOffset: number
  page: number
  animation: CAAnimation
  editing: boolean
  homeAction: SBHomeAction
  onBeginEditing: () => void
  onPageChange: (page: number) => void
  onLaunch: (app: ApplicationRecord) => void
  onFolderLaunch: (app: ApplicationRecord) => void
}) => {
  const [drag, setDrag] = createSignal(0)
  const [openFolder, setOpenFolder] = createSignal<OpenFolder | undefined>()
  const [folderPresented, setFolderPresented] = createSignal(false)
  const [folderOpen, setFolderOpen] = createSignal(false)
  let origin: number | undefined
  let root!: HTMLDivElement
  let startFrame = 0

  const folderOffset = () => (folderOpen() ? SpringBoardMetrics.folderOffsetMax : 0)
  const folderTransition = `transform ${SpringBoardMetrics.folderDuration}s linear`

  const cancelStart = () => {
    if (startFrame === 0) return
    cancelAnimationFrame(startFrame)
    startFrame = 0
  }

  onCleanup(cancelStart)

  createEffect(
    on(
      () => props.editing,
      (editing) => {
        if (!editing) return
        origin = undefined
        setDrag(0)
      },
      { defer: true }
    )
  )

  const folderEntry = (): Extract<SBIconEntry, { kind: 'folder' }> | undefined => {
    const open = openFolder()
    if (!open) return undefined
    const entry = sbIconPages()[open.page]?.[open.index]
    return entry?.kind === 'folder' ? entry : undefined
  }

  const showFolder = () => openFolder() !== undefined

  const presentFolder = (page: number, index: number, tile: DOMRect) => {
    const rect = root.getBoundingClientRect()
    const scale = rect.width / StageWidth
    const stripTop = (tile.bottom - rect.top) / scale + SpringBoardMetrics.folderStripGap
    const notchCx = (tile.left + tile.width / 2 - rect.left) / scale
    cancelStart()
    setOpenFolder({ page, index, stripTop, notchCx })
    startFrame = requestAnimationFrame(() => {
      startFrame = 0
      setFolderPresented(true)
      setFolderOpen(true)
    })
  }

  const dismissFolder = () => {
    if (!showFolder()) return
    cancelStart()
    setFolderPresented(false)
    setFolderOpen(false)
  }

  props.homeAction.current = () => {
    if (!showFolder()) return false
    dismissFolder()
    return true
  }

  const onPointerDown = (event: PointerEvent) => {
    if (showFolder()) return
    origin = event.clientX
  }

  const onPointerMove = (event: PointerEvent) => {
    if (origin === undefined) return
    setDrag(event.clientX - origin)
  }

  const onPointerUp = () => {
    if (origin === undefined) return
    const travelled = drag()
    origin = undefined
    setDrag(0)
    if (travelled <= -SwipeThreshold) props.onPageChange(Math.min(props.page + 1, PageCount - 1))
    if (travelled >= SwipeThreshold) props.onPageChange(Math.max(props.page - 1, 0))
  }

  const trackOffset = () => {
    const raw = drag()
    const atStart = props.page === 0 && raw > 0
    const atEnd = props.page === PageCount - 1 && raw < 0
    const travel = atStart || atEnd ? raw * EdgeResistance : raw
    return `calc(-${(props.page * 100) / PageCount}% + ${travel}px)`
  }

  const splitEdge = () => {
    const open = openFolder()
    if (!open) return ''
    return `polygon(0 ${open.stripTop}px, ${StageWidth}px ${open.stripTop}px, ${StageWidth}px ${DeviceContentHeight}px, 0 ${DeviceContentHeight}px)`
  }

  const folderPage = (page: number) => {
    const open = openFolder()
    return open && open.page === page ? open.index : undefined
  }

  return (
    <div ref={root} class="relative h-full w-full overflow-hidden" style={{ isolation: 'isolate' }}>
      <img
        src={assetURL(uiWallpaperHome())}
        alt=""
        class="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      <Show when={openFolder()}>
        {(open) => (
          <>
            <div
              class="pointer-events-none absolute inset-x-0"
              style={{ top: `${open().stripTop}px`, 'z-index': '1' }}
            >
              <FolderStrip
                name={folderEntry()?.name ?? ''}
                bundleIds={folderEntry()?.bundleIds ?? []}
                notchCx={open().notchCx}
                editing={props.editing}
                interactive={folderOffset() > 0}
                onLaunch={props.onFolderLaunch}
                onBeginEditing={props.onBeginEditing}
                onReorder={(from, to) => sbIconReorderFolder(open().page, open().index, from, to)}
                onExtract={(bundleId) => {
                  sbIconExtractFromFolder(open().page, open().index, bundleId)
                  dismissFolder()
                }}
              />
            </div>
            <div
              class="pointer-events-none absolute inset-0"
              style={{
                transform: `translateY(${folderOffset()}px)`,
                transition: folderTransition,
                'z-index': '2'
              }}
              onTransitionEnd={(event) => {
                if (event.propertyName !== 'transform' || folderOpen()) return
                setOpenFolder(undefined)
              }}
            >
              <div class="absolute inset-0" style={{ 'clip-path': splitEdge() }}>
                <img
                  src={assetURL(uiWallpaperHome())}
                  alt=""
                  class="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                <div
                  class="absolute inset-x-0"
                  style={{
                    top: `${open().stripTop}px`,
                    height: `${SpringBoardMetrics.folderWallpaperShadowBlur}px`,
                    background: `linear-gradient(to bottom, rgba(0,0,0,${SpringBoardMetrics.folderWallpaperShadowOpacity}), transparent)`,
                    opacity: folderOpen() ? 1 : 0,
                    transition: `opacity ${SpringBoardMetrics.folderDuration}s linear`
                  }}
                />
              </div>
            </div>
          </>
        )}
      </Show>

      <div
        class="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: `${DeviceContentHeight / SpringBoardMetrics.homeGradientDivisor}px`,
          background: 'linear-gradient(to bottom, rgba(158,158,158,0), rgb(34,34,34))',
          'z-index': '3'
        }}
      />

      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          top: `${DeviceMetrics.statusBarHeight}px`,
          background: 'black',
          opacity: `${props.page === SearchPageIndex ? SpringBoardMetrics.searchDimOpacity : 0}`,
          transition: caTransition(['opacity'], pageAnimation),
          'z-index': '3',
          'pointer-events': 'none'
        }}
      />

      <div
        class="relative flex h-full w-full flex-col"
        style={{ 'z-index': '4', 'pointer-events': showFolder() ? 'none' : 'auto' }}
      >
        <UIStatusBar />
        <div style={{ height: `${SpringBoardMetrics.homeStatusBarSpacer}px` }} />

        <div
          class="relative flex-1"
          style={{ 'touch-action': 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            class="flex h-full"
            style={{
              width: `${PageCount * 100}%`,
              transform: `translateX(${trackOffset()})`,
              transition: drag() === 0 ? caTransition(['transform'], pageAnimation) : 'none'
            }}
          >
            <div class="h-full overflow-hidden" style={{ width: `${100 / PageCount}%` }}>
              <SearchPage onLaunch={props.onLaunch} />
            </div>
            <div class="h-full" style={{ width: `${100 / PageCount}%` }}>
              <IconPage
                entries={sbIconPages()[0] ?? []}
                page={0}
                active={props.page === AppsPageIndex}
                appsScale={props.appsScale}
                dockOffset={props.dockOffset}
                animation={props.animation}
                editing={props.editing}
                openFolderIndex={folderPage(0)}
                folderDimmed={folderPresented() && folderPage(0) !== undefined}
                folderOffset={folderOffset()}
                onBeginEditing={props.onBeginEditing}
                onLaunch={props.onLaunch}
                onOpenFolder={(index, tile) => presentFolder(0, index, tile)}
              />
            </div>
            <div class="h-full" style={{ width: `${100 / PageCount}%` }}>
              <IconPage
                entries={sbIconPages()[1] ?? []}
                page={1}
                active={props.page === AppsPageIndex + 1}
                appsScale={props.appsScale}
                dockOffset={props.dockOffset}
                animation={props.animation}
                editing={props.editing}
                openFolderIndex={folderPage(1)}
                folderDimmed={folderPresented() && folderPage(1) !== undefined}
                folderOffset={folderOffset()}
                onBeginEditing={props.onBeginEditing}
                onLaunch={props.onLaunch}
                onOpenFolder={(index, tile) => presentFolder(1, index, tile)}
              />
            </div>
          </div>
        </div>

        <div
          class="absolute inset-x-0 bottom-0"
          style={{
            transform: `translateY(${props.dockOffset}px)`,
            transition: caTransition(['transform'], props.animation)
          }}
        >
          <div
            style={{
              transform: `translateY(${folderOffset()}px)`,
              transition: folderTransition
            }}
          >
          <div
            class="absolute inset-x-0"
            style={{ bottom: `${SpringBoardMetrics.pageIndicatorBottom}px` }}
          >
            <PageIndicator page={props.page} count={PageCount} onSelect={props.onPageChange} />
          </div>
          <Dock
            jiggling={props.editing}
            onLaunch={(app) => {
              if (props.editing) return
              props.onLaunch(app)
            }}
          />
          </div>
        </div>
      </div>

      <Show when={showFolder()}>
        <div
          class="absolute inset-x-0 top-0"
          style={{ height: `${openFolder()?.stripTop ?? 0}px`, 'z-index': '5' }}
          onClick={() => {
            if (folderOffset() === SpringBoardMetrics.folderOffsetMax) dismissFolder()
          }}
        />
        <div
          class="absolute inset-x-0 bottom-0"
          style={{
            top: `${(openFolder()?.stripTop ?? 0) + SpringBoardMetrics.folderStripHeight}px`,
            'z-index': '5'
          }}
          onClick={() => {
            if (folderOffset() === SpringBoardMetrics.folderOffsetMax) dismissFolder()
          }}
        />
      </Show>
    </div>
  )
}
