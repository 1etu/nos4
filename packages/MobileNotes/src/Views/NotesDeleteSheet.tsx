import { type JSX } from 'solid-js'
import { uiInnerShadowTop } from 'UIKit'
import { NotesMetrics, NotesPalette } from '../Support/NotesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const SheetButton = (props: {
  label: string
  face: string
  stroke: string
  dimmed?: boolean
  style?: JSX.CSSProperties
  onClick: () => void
}) => (
  <button
    type="button"
    class="relative flex shrink-0 items-center justify-center"
    style={{
      height: `${NotesMetrics.deleteButtonHeight}px`,
      'margin-left': `${NotesMetrics.deleteButtonInsetX}px`,
      'margin-right': `${NotesMetrics.deleteButtonInsetX}px`,
      'border-radius': `${NotesMetrics.deleteButtonRadius}px`,
      background: NotesPalette.sheetShell,
      opacity: props.dimmed ? '0.6' : '1',
      ...props.style
    }}
    onClick={props.onClick}
  >
    <span
      class="pointer-events-none absolute inset-0"
      style={{
        'border-radius': `${NotesMetrics.deleteButtonRadius}px`,
        padding: '0.5px',
        background: NotesPalette.sheetShellStroke,
        '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude'
      }}
    />
    <span
      class="absolute"
      style={{
        inset: `${NotesMetrics.deleteButtonInset}px`,
        'border-radius': `${NotesMetrics.deleteButtonInnerRadius}px`,
        background: props.face
      }}
    />
    <span
      class="pointer-events-none absolute"
      style={{
        inset: `${NotesMetrics.deleteButtonInset}px`,
        'border-radius': `${NotesMetrics.deleteButtonInnerRadius}px`,
        padding: '0.4px',
        background: props.stroke,
        '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude'
      }}
    />
    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${NotesMetrics.deleteButtonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.6)'
      }}
    >
      {props.label}
    </span>
  </button>
)

export const NotesDeleteSheet = (props: {
  height: number
  onDelete: () => void
  onCancel: () => void
}) => (
  <div class="relative w-full" style={{ height: `${props.height}px`, contain: 'paint' }}>
    <div class="absolute inset-0 flex flex-col" style={{ opacity: '0.8' }}>
      <div
        style={{
          height: `${NotesMetrics.deleteSheetTopBar}px`,
          'flex-shrink': '0',
          background: `${uiInnerShadowTop('rgba(255,255,255,0.735)', NotesMetrics.sheetGlossHeight)}, ${NotesPalette.sheetTop}`,
          'border-top': '1px solid black'
        }}
      />
      <div class="flex-1" style={{ background: NotesPalette.sheetBody }} />
    </div>

    <div class="absolute inset-0 flex flex-col">
      <SheetButton
        label="Delete Note"
        face={NotesPalette.deleteFace}
        stroke={NotesPalette.faceStroke}
        style={{ 'margin-top': `${NotesMetrics.deleteTopPadding}px` }}
        onClick={props.onDelete}
      />
      <div class="flex-1" />
      <SheetButton
        label="Cancel"
        face={NotesPalette.cancelFace}
        stroke={NotesPalette.cancelStroke}
        dimmed
        style={{ 'margin-bottom': `${NotesMetrics.deleteBottomPadding}px` }}
        onClick={props.onCancel}
      />
    </div>
  </div>
)
