import { createMemo, createSignal, For } from 'solid-js'
import { DeviceMetrics } from 'Device'
import { assetURL } from 'CoreGraphics'
import { IconTile } from './IconTile'
import { applicationForBundle, type ApplicationRecord } from '../Support/Bundles'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const StageWidth = DeviceMetrics.stageWidth
const StripHeight = SpringBoardMetrics.folderStripHeight
const Notch = SpringBoardMetrics.folderNotchHeight
const HalfBase = SpringBoardMetrics.folderNotchBase / 2
const GridLeft =
  (StageWidth -
    SpringBoardMetrics.columns * SpringBoardMetrics.cellWidth -
    (SpringBoardMetrics.columns - 1) * SpringBoardMetrics.gridColumnSpacing) /
  2

const notchClip = (cx: number): string =>
  `polygon(0 ${Notch}px, ${cx - HalfBase}px ${Notch}px, ${cx}px 0, ${cx + HalfBase}px ${Notch}px, ${StageWidth}px ${Notch}px, ${StageWidth}px ${StripHeight}px, 0 ${StripHeight}px)`

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

export const FolderStrip = (props: {
  name: string
  bundleIds: readonly string[]
  notchCx: number
  editing: boolean
  interactive: boolean
  onLaunch: (app: ApplicationRecord) => void
  onBeginEditing: () => void
  onReorder: (from: number, to: number) => void
  onExtract: (bundleId: string) => void
}) => {
  const apps = createMemo(() =>
    props.bundleIds
      .map((bundleId) => applicationForBundle(bundleId))
      .filter((record): record is ApplicationRecord => record !== undefined)
  )
  const wobble = createMemo(() => apps().map(wobbleEntry))
  const [drag, setDrag] = createSignal<
    { index: number; slot: number; x: number; y: number } | undefined
  >()

  let row!: HTMLDivElement
  let scale = 1
  let hold: ReturnType<typeof setTimeout> | undefined
  let start = { x: 0, y: 0 }
  let rowTop = 0
  let rowHeight = 0
  let centres: number[] = []

  const beginDrag = (index: number, event: PointerEvent) => {
    const rect = row.getBoundingClientRect()
    scale = rect.width / (StageWidth - GridLeft)
    rowTop = rect.top
    rowHeight = rect.height
    centres = [...row.children].map((cell) => {
      const r = cell.getBoundingClientRect()
      return (r.left + r.width / 2 - rect.left) / scale
    })
    start = { x: event.clientX, y: event.clientY }
    setDrag({ index, slot: index, x: 0, y: 0 })
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    event.stopPropagation()
  }

  const moveDrag = (event: PointerEvent) => {
    const held = drag()
    if (!held) return
    const x = (event.clientX - start.x) / scale
    const y = (event.clientY - start.y) / scale
    const pointerX = centres[held.index] !== undefined ? (centres[held.index] ?? 0) + x : x
    let slot = held.index
    let nearest = Number.POSITIVE_INFINITY
    for (let i = 0; i < centres.length; i += 1) {
      const gap = Math.abs((centres[i] ?? 0) - pointerX)
      if (gap < nearest) {
        nearest = gap
        slot = i
      }
    }
    setDrag({ index: held.index, slot, x, y })
  }

  const endDrag = (event: PointerEvent) => {
    const held = drag()
    if (!held) return
    setDrag(undefined)
    const outside = event.clientY < rowTop - rowHeight / 2 || event.clientY > rowTop + rowHeight * 1.5
    const bundleId = props.bundleIds[held.index]
    if (outside && bundleId) {
      props.onExtract(bundleId)
      return
    }
    if (held.slot !== held.index) props.onReorder(held.index, held.slot)
  }

  const shift = (index: number): number => {
    const held = drag()
    if (!held || index === held.index) return 0
    const stride = SpringBoardMetrics.cellWidth + SpringBoardMetrics.gridColumnSpacing
    if (held.index < index && held.slot >= index) return -stride
    if (held.index > index && held.slot <= index) return stride
    return 0
  }

  return (
    <div
      class="absolute inset-x-0"
      style={{
        height: `${StripHeight}px`,
        'pointer-events': props.interactive ? 'auto' : 'none',
        'user-select': 'none'
      }}
    >
      <div
        class="absolute inset-0"
        style={{
          'background-image': `url(${assetURL('FolderSwitcherBG')})`,
          'background-size': 'cover',
          'background-position': 'top',
          'box-shadow': `inset 0 ${SpringBoardMetrics.folderInnerShadowOffsetY}px ${SpringBoardMetrics.folderInnerShadowStroke}px rgba(0,0,0,${SpringBoardMetrics.folderInnerShadowOpacity})`,
          'clip-path': notchClip(props.notchCx)
        }}
      />
      <svg
        class="pointer-events-none absolute inset-0"
        width={StageWidth}
        height={StripHeight}
        viewBox={`0 0 ${StageWidth} ${StripHeight}`}
      >
        <path
          d={`M0 ${Notch + 0.5} L${props.notchCx - HalfBase} ${Notch + 0.5} L${props.notchCx} 0.5 L${props.notchCx + HalfBase} ${Notch + 0.5} L${StageWidth} ${Notch + 0.5}`}
          fill="none"
          stroke={`rgba(255,255,255,${SpringBoardMetrics.folderBorderOpacity})`}
          stroke-width="1"
        />
        <line
          x1="0"
          y1={StripHeight - 0.5}
          x2={StageWidth}
          y2={StripHeight - 0.5}
          stroke={`rgba(255,255,255,${SpringBoardMetrics.folderBorderOpacity})`}
          stroke-width="1"
        />
      </svg>

      <div class="relative flex h-full flex-col">
        <div style={{ height: `${SpringBoardMetrics.folderTitleTopSpacer}px` }} />
        <div class="flex-1" />
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${SpringBoardMetrics.folderTitleFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': `0 ${SpringBoardMetrics.labelShadowOffsetY}px ${SpringBoardMetrics.labelShadowBlur}px rgba(0,0,0,0.9)`,
            'padding-left': `${SpringBoardMetrics.folderTitleLeading}px`
          }}
        >
          {props.name}
        </span>
        <div style={{ height: `${SpringBoardMetrics.folderTitleBottomSpacer}px` }} />
        <div
          ref={row}
          class="flex"
          style={{
            'padding-left': `${GridLeft}px`,
            'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px`
          }}
        >
          <For each={apps()}>
            {(app, at) => (
              <div
                style={{
                  width: `${SpringBoardMetrics.cellWidth}px`,
                  transform:
                    drag()?.index === at()
                      ? `translate(${drag()?.x ?? 0}px, ${drag()?.y ?? 0}px) scale(${SpringBoardMetrics.dragScale})`
                      : `translateX(${shift(at())}px)`,
                  transition:
                    drag()?.index === at()
                      ? 'none'
                      : `transform ${SpringBoardMetrics.dragTransition}s ease`,
                  'z-index': drag()?.index === at() ? '2' : '1',
                  '--jiggle-rotation': `${wobble()[at()]?.rotation ?? 0}deg`,
                  '--jiggle-shift': `${wobble()[at()]?.shift ?? 0}px`
                }}
                onPointerDown={(event) => {
                  if (props.editing) {
                    beginDrag(at(), event)
                    return
                  }
                  if (hold) clearTimeout(hold)
                  hold = setTimeout(() => {
                    hold = undefined
                    props.onBeginEditing()
                  }, SpringBoardMetrics.editHoldDelay * 1000)
                }}
                onPointerMove={moveDrag}
                onPointerUp={(event) => {
                  if (hold) clearTimeout(hold)
                  hold = undefined
                  endDrag(event)
                }}
                onPointerCancel={(event) => {
                  if (hold) clearTimeout(hold)
                  hold = undefined
                  endDrag(event)
                }}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div
                  style={{
                    animation: props.editing
                      ? `sbJiggle ${SpringBoardMetrics.jigglePeriod}s linear ${-(wobble()[at()]?.delay ?? 0)}s infinite`
                      : 'none',
                    'pointer-events': props.editing ? 'none' : 'auto'
                  }}
                >
                  <IconTile
                    app={app}
                    onLaunch={() => {
                      if (props.editing) return
                      props.onLaunch(app)
                    }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
        <div class="flex-1" />
      </div>
    </div>
  )
}
