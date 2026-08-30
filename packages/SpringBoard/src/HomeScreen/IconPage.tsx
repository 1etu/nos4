import { createMemo, createSignal, For, Show } from 'solid-js'
import { DeviceMetrics } from 'Device'
import type { CAAnimation } from 'CoreAnimation'
import { caTransition } from 'CoreAnimation'
import { FolderIcon } from './FolderIcon'
import { IconTile } from './IconTile'
import { applicationForBundle, type ApplicationRecord } from '../Support/Bundles'
import {
  SBFolderCapacity,
  sbIconAddToFolder,
  sbIconCreateFolder,
  sbIconMove,
  type SBIconEntry
} from '../Support/SBIconState'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const flyX = DeviceMetrics.stageWidth * SpringBoardMetrics.flyXRatio
const flyY = DeviceMetrics.stageHeight * SpringBoardMetrics.flyYRatio

const flyProgress = (appsScale: number): number =>
  Math.min(Math.max((appsScale - 1) / (SpringBoardMetrics.appsScaleMax - 1), 0), 1)

const quadrant = (index: number, appsScale: number): { x: number; y: number } => {
  const progress = flyProgress(appsScale)
  const column = index % SpringBoardMetrics.columns
  const row = Math.floor(index / SpringBoardMetrics.columns)
  return {
    x: (column < SpringBoardMetrics.columns / 2 ? -flyX : flyX) * progress,
    y: (row < 2 ? -flyY : flyY) * progress
  }
}

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

interface IconDrag {
  readonly index: number
  readonly slot: number
  readonly target: number | undefined
  readonly x: number
  readonly y: number
}

export const IconPage = (props: {
  entries: readonly SBIconEntry[]
  page: number
  active: boolean
  appsScale: number
  dockOffset: number
  animation: CAAnimation
  editing: boolean
  openFolderIndex: number | undefined
  folderDimmed: boolean
  folderOffset: number
  onBeginEditing: () => void
  onLaunch: (app: ApplicationRecord) => void
  onOpenFolder: (index: number, tile: DOMRect) => void
}) => {
  const wobble = createMemo(() => props.entries.map(wobbleEntry))
  const [drag, setDrag] = createSignal<IconDrag | undefined>()

  let container!: HTMLDivElement
  let scale = 1
  let origin = { x: 0, y: 0 }
  let startClient = { x: 0, y: 0 }
  let slots: { x: number; y: number }[] = []
  let hold: ReturnType<typeof setTimeout> | undefined
  let holdTarget: Element | undefined
  let holdPointer = 0
  let dwell: ReturnType<typeof setTimeout> | undefined
  let dwellCandidate = -1

  const clearHold = () => {
    if (!hold) return
    clearTimeout(hold)
    hold = undefined
  }

  const clearDwell = () => {
    if (!dwell) return
    clearTimeout(dwell)
    dwell = undefined
  }

  const folderRow = () =>
    props.openFolderIndex === undefined
      ? -1
      : Math.floor(props.openFolderIndex / SpringBoardMetrics.columns)

  const foldShift = (index: number): number => {
    if (folderRow() < 0 || props.folderOffset === 0) return 0
    if (Math.floor(index / SpringBoardMetrics.columns) <= folderRow()) return 0
    return SpringBoardMetrics.folderStripHeight + SpringBoardMetrics.rowSpacing
  }

  const provisionalPosition = (index: number, held: IconDrag): number => {
    if (index === held.index) return held.slot
    if (held.index < index && held.slot >= index) return index - 1
    if (held.index > index && held.slot <= index) return index + 1
    return index
  }

  const beginDrag = (index: number, clientX: number, clientY: number) => {
    const rect = container.getBoundingClientRect()
    scale = rect.width / DeviceMetrics.stageWidth
    origin = { x: rect.left, y: rect.top }
    slots = [...container.children].map((cell) => {
      const r = cell.getBoundingClientRect()
      return { x: (r.left + r.width / 2 - rect.left) / scale, y: (r.top + r.height / 2 - rect.top) / scale }
    })
    startClient = { x: clientX, y: clientY }
    dwellCandidate = -1
    setDrag({ index, slot: index, target: undefined, x: 0, y: 0 })
  }

  const targetEligible = (dragged: number, slot: number): boolean => {
    if (slot === dragged) return false
    const entry = props.entries[dragged]
    if (entry?.kind !== 'app') return false
    const occupant = props.entries[slot]
    if (!occupant) return false
    if (occupant.kind === 'app') return true
    return occupant.bundleIds.length < SBFolderCapacity
  }

  const moveDrag = (event: PointerEvent) => {
    const held = drag()
    if (!held) {
      if (!hold) return
      const wander = Math.hypot(event.clientX - startClient.x, event.clientY - startClient.y)
      if (wander > SpringBoardMetrics.editHoldSlop * scaleGuess()) clearHold()
      return
    }
    const x = (event.clientX - startClient.x) / scale
    const y = (event.clientY - startClient.y) / scale
    const pointer = {
      x: (event.clientX - origin.x) / scale,
      y: (event.clientY - origin.y) / scale
    }
    let slot = held.index
    let nearest = Number.POSITIVE_INFINITY
    for (let i = 0; i < slots.length; i += 1) {
      const cell = slots[i]
      if (!cell) continue
      const gap = Math.hypot(cell.x - pointer.x, cell.y - pointer.y)
      if (gap < nearest) {
        nearest = gap
        slot = i
      }
    }

    const overIcon =
      nearest <= SpringBoardMetrics.folderTargetRadius && targetEligible(held.index, slot)

    if (overIcon) {
      if (held.target === slot) {
        setDrag({ index: held.index, slot: held.index, target: slot, x, y })
        return
      }
      if (dwellCandidate !== slot) {
        dwellCandidate = slot
        clearDwell()
        dwell = setTimeout(() => {
          const current = drag()
          if (!current) return
          setDrag({ index: current.index, slot: current.index, target: slot, x: current.x, y: current.y })
        }, SpringBoardMetrics.folderTargetDelay * 1000)
      }
      setDrag({ index: held.index, slot: held.index, target: held.target, x, y })
      return
    }

    dwellCandidate = -1
    clearDwell()
    setDrag({ index: held.index, slot, target: undefined, x, y })
  }

  const scaleGuess = () => (scale > 0 ? scale : 1)

  const measureTile = (index: number): DOMRect | undefined =>
    container.children[index]?.getBoundingClientRect()

  const endDrag = (event: PointerEvent) => {
    clearHold()
    clearDwell()
    const held = drag()
    if (!held) return
    setDrag(undefined)
    const wander = Math.hypot(event.clientX - startClient.x, event.clientY - startClient.y)
    const entry = props.entries[held.index]

    if (held.target !== undefined) {
      const occupant = props.entries[held.target]
      if (occupant?.kind === 'folder') {
        sbIconAddToFolder(props.page, held.target, held.index)
        return
      }
      const slot = sbIconCreateFolder(props.page, held.target, held.index)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const rect = measureTile(slot)
          if (rect) props.onOpenFolder(slot, rect)
        })
      )
      return
    }

    if (held.slot !== held.index) {
      sbIconMove(props.page, held.index, held.slot)
      return
    }

    if (entry?.kind === 'folder' && wander <= SpringBoardMetrics.editHoldSlop * scaleGuess()) {
      const rect = measureTile(held.index)
      if (rect) props.onOpenFolder(held.index, rect)
    }
  }

  const onTilePointerDown = (index: number, event: PointerEvent) => {
    if (!event.isPrimary) return
    startClient = { x: event.clientX, y: event.clientY }
    if (props.editing) {
      if (event.currentTarget instanceof Element) {
        event.currentTarget.setPointerCapture(event.pointerId)
      }
      beginDrag(index, event.clientX, event.clientY)
      event.preventDefault()
      event.stopPropagation()
      return
    }
    const rect = container.getBoundingClientRect()
    scale = rect.width / DeviceMetrics.stageWidth
    holdTarget = event.currentTarget instanceof Element ? event.currentTarget : undefined
    holdPointer = event.pointerId
    clearHold()
    hold = setTimeout(() => {
      hold = undefined
      props.onBeginEditing()
      holdTarget?.setPointerCapture(holdPointer)
      beginDrag(index, startClient.x, startClient.y)
    }, SpringBoardMetrics.editHoldDelay * 1000)
  }

  const onTilePointerMove = (event: PointerEvent) => {
    moveDrag(event)
    if (drag()) event.preventDefault()
  }

  const onTilePointerUp = (event: PointerEvent) => {
    endDrag(event)
    clearHold()
  }

  const onTilePointerLeave = () => {
    if (drag()) return
    clearHold()
  }

  return (
    <div
      ref={container}
      class="grid"
      style={{
        'grid-template-columns': `repeat(${SpringBoardMetrics.columns}, ${SpringBoardMetrics.cellWidth}px)`,
        'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px`,
        'row-gap': `${SpringBoardMetrics.rowSpacing}px`,
        'justify-content': 'center',
        'justify-items': 'center',
        'align-content': 'start',
        opacity: `${1 / (props.dockOffset + 1)}`,
        'user-select': 'none',
        transition: caTransition(['opacity'], props.animation)
      }}
    >
      <For each={props.entries}>
        {(entry, index) => {
          const held = () => drag()
          const dragging = () => held()?.index === index()
          const isTarget = () => held()?.target === index()
          const reflow = () => {
            const current = held()
            if (!current || dragging() || current.slot === current.index) return { x: 0, y: 0 }
            const from = slots[index()]
            const to = slots[provisionalPosition(index(), current)]
            if (!from || !to) return { x: 0, y: 0 }
            return { x: to.x - from.x, y: to.y - from.y }
          }
          const dimmed = () => props.folderDimmed && props.openFolderIndex !== index()
          const transform = () => {
            if (dragging()) {
              const current = held()
              return `translate(${current?.x ?? 0}px, ${current?.y ?? 0}px) scale(${SpringBoardMetrics.dragScale})`
            }
            const fly = props.active ? quadrant(index(), props.appsScale) : { x: 0, y: 0 }
            const slide = reflow()
            const grow = isTarget() ? ` scale(${SpringBoardMetrics.folderTargetScale})` : ''
            return `translate(${fly.x + slide.x}px, ${fly.y + slide.y}px)${grow}`
          }

          return (
            <div
              style={{
                transform:
                  foldShift(index()) === 0 ? 'none' : `translateY(${foldShift(index())}px)`,
                transition: `transform ${SpringBoardMetrics.folderDuration}s linear`,
                'z-index': drag()?.index === index() ? '2' : 'auto',
                position: drag()?.index === index() ? 'relative' : 'static'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  transform: transform(),
                  transition: `${
                    held()
                      ? dragging()
                        ? 'transform 0s'
                        : `transform ${SpringBoardMetrics.dragTransition}s ease`
                      : caTransition(['transform'], props.animation)
                  }, filter ${SpringBoardMetrics.folderDuration}s linear, opacity ${SpringBoardMetrics.folderDuration}s linear`,
                  'z-index': dragging() ? '2' : '1',
                  filter: dimmed() ? 'grayscale(0.99)' : 'none',
                  opacity: dimmed() ? SpringBoardMetrics.folderDimOpacity : 1
                }}
                onPointerDown={(event) => onTilePointerDown(index(), event)}
                onPointerMove={onTilePointerMove}
                onPointerUp={onTilePointerUp}
                onPointerCancel={onTilePointerUp}
                onPointerLeave={onTilePointerLeave}
                onContextMenu={(event) => event.preventDefault()}
              >
                <Show when={isTarget()}>
                  <div
                    class="pointer-events-none absolute"
                    style={{
                      left: `${(SpringBoardMetrics.cellWidth - SpringBoardMetrics.iconSize) / 2}px`,
                      top: '0',
                      width: `${SpringBoardMetrics.iconSize}px`,
                      height: `${SpringBoardMetrics.iconSize}px`,
                      transform: `scale(${SpringBoardMetrics.folderTargetScale + 0.15})`,
                      background: `rgba(0,0,0,${SpringBoardMetrics.folderTargetPlateOpacity})`,
                      'border-radius': `${SpringBoardMetrics.iconPressedRadius}px`,
                      'z-index': '0'
                    }}
                  />
                </Show>
                <div
                  style={{
                    animation: props.editing
                      ? `sbJiggle ${SpringBoardMetrics.jigglePeriod}s linear ${-(wobble()[index()]?.delay ?? 0)}s infinite`
                      : 'none',
                    '--jiggle-rotation': `${wobble()[index()]?.rotation ?? 0}deg`,
                    '--jiggle-shift': `${wobble()[index()]?.shift ?? 0}px`,
                    'pointer-events': props.editing ? 'none' : 'auto'
                  }}
                >
                  <Show
                    when={entry.kind === 'app' ? applicationForBundle(entry.bundleId) : undefined}
                    fallback={
                      entry.kind === 'folder' ? (
                        <FolderIcon
                          name={entry.name}
                          bundleIds={entry.bundleIds}
                          onOpen={() => {
                            if (props.editing) return
                            const rect = measureTile(index())
                            if (rect) props.onOpenFolder(index(), rect)
                          }}
                        />
                      ) : undefined
                    }
                  >
                    {(app) => (
                      <IconTile
                        app={app()}
                        onLaunch={() => {
                          if (props.editing || drag()) return
                          props.onLaunch(app())
                        }}
                      />
                    )}
                  </Show>
                </div>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
