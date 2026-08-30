import { type JSX } from 'solid-js'
import { PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

export type KeypadKeyKind = 'digit' | 'add' | 'delete' | 'call'

const Width = PhoneMetrics.keyBorderWidth
const TopEdge = `inset 0 ${Width}px 0 ${PhonePalette.keyEdgeTop}`
const BottomEdge = `inset 0 -${Width}px 0 ${PhonePalette.keyEdgeBottom}`

const edges = (kind: KeypadKeyKind, column: number): string => {
  if (kind === 'call') {
    return [
      `inset 0 ${Width}px 0 ${PhonePalette.keyGreenEdgeTop}`,
      `inset 0 ${PhoneMetrics.keyGreenHighlightWidth}px 0 ${PhonePalette.keyGreenEdgeHighlight}`,
      `inset 0 -${Width}px 0 ${PhonePalette.keyGreenEdgeBottom}`,
      `inset ${Width}px 0 0 ${PhonePalette.keyGreenEdgeLeading}`
    ].join(', ')
  }

  if (kind === 'add') {
    return [
      TopEdge,
      BottomEdge,
      `inset ${Width}px 0 0 ${PhonePalette.keyEdgeOuter}`,
      `inset -${Width}px 0 0 ${PhonePalette.keyEdgeDark}`
    ].join(', ')
  }

  if (kind === 'delete') {
    return [
      TopEdge,
      `inset 0 -${Width}px 0 ${PhonePalette.keyBlueEdgeBottom}`,
      `inset -${Width}px 0 0 ${PhonePalette.keyEdgeLight}`
    ].join(', ')
  }

  return [
    TopEdge,
    BottomEdge,
    `inset ${Width}px 0 0 ${column === 0 ? PhonePalette.keyEdgeOuter : PhonePalette.keyEdgeLight}`,
    `inset -${Width}px 0 0 ${column === 2 ? PhonePalette.keyEdgeLight : PhonePalette.keyEdgeDark}`
  ].join(', ')
}

const face = (kind: KeypadKeyKind, pressed: boolean): string => {
  if (kind === 'call') return pressed ? PhonePalette.keyGreenPressed : PhonePalette.keyGreen
  if (pressed) return PhonePalette.keyPressed
  return kind === 'digit' ? PhonePalette.keyDark : PhonePalette.keyBlue
}

export const KeypadKey = (props: {
  kind: KeypadKeyKind
  column: number
  pressed: boolean
  onDown: () => void
  onUp: () => void
  children: JSX.Element
}) => (
  <button
    type="button"
    class="relative flex flex-1 flex-col items-center justify-center"
    style={{
      background: face(props.kind, props.pressed),
      'box-shadow': edges(props.kind, props.column)
    }}
    onPointerDown={() => props.onDown()}
    onPointerUp={() => props.onUp()}
    onPointerLeave={() => props.onUp()}
    onPointerCancel={() => props.onUp()}
  >
    {props.children}
  </button>
)
