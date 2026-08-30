import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'
import { caAnimation, caTransition, CAMediaTimingFunction } from 'CoreAnimation'
import { UIKeyboardMetrics, UIKeyboardPalette } from '../Support/UIKeyboardMetrics'
import {
  keyboardKeys,
  type UIKeyboardPlacedKey,
  type UIKeyboardConfiguration,
  type UIKeyboardPlane
} from './UIKeyboardLayout'
import { KeyCapGlyphs, type KeyCapGlyphName } from '../Support/KeyCapGlyphs.gen'
import { uiKeyboardAttachHardware } from './UIKeyboardHardware'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const presentAnimation = caAnimation(
  UIKeyboardMetrics.presentDuration,
  CAMediaTimingFunction.easeInOut
)

const palette = (key: UIKeyboardPlacedKey) => {
  if (key.style === 'blue') return UIKeyboardPalette.blue
  const rows = key.style === 'dark' ? UIKeyboardPalette.darkRows : UIKeyboardPalette.lightRows
  return rows[key.row] ?? rows[0]
}

const SpaceColor = 'rgb(74,84,99)'

const labelSize = (key: UIKeyboardPlacedKey): number => {
  if (key.kind === 'character') return key.label.length > 1 ? 16 : 22
  if (
    key.kind === 'space' ||
    key.kind === 'return' ||
    key.kind === 'switchToLetters' ||
    key.kind === 'switchToNumbers' ||
    key.kind === 'switchToSymbols'
  ) {
    return 16
  }
  return 14
}

const labelColor = (key: UIKeyboardPlacedKey): string => {
  if (key.kind === 'space') return SpaceColor
  if (key.style === 'light') return 'rgba(0,0,0,0.94)'
  return 'rgba(255,255,255,0.98)'
}

const FilledShiftArrow = () => (
  <div class="relative flex items-center justify-center">
    <svg
      width="21"
      height="19"
      viewBox="0 0 21 19"
      aria-hidden="true"
      style={{ position: 'absolute', filter: 'blur(2.8px)' }}
    >
      <path d="M10.5 0.6 L20.4 10.2 h-5.4 v7.8 H6 v-7.8 H0.6 Z" fill="white" />
    </svg>
    <svg width="21" height="19" viewBox="0 0 21 19" aria-hidden="true" class="relative">
      <path d="M10.5 0.6 L20.4 10.2 h-5.4 v7.8 H6 v-7.8 H0.6 Z" fill="white" />
    </svg>
  </div>
)

const UnitsPerEm = 2048

const KeyCapGlyph = (props: { name: KeyCapGlyphName; size: number; color: string }) => {
  const glyph = KeyCapGlyphs[props.name]
  const factor = props.size / UnitsPerEm
  return (
    <svg
      width={glyph.width * factor}
      height={glyph.height * factor}
      viewBox={`0 0 ${glyph.width} ${glyph.height}`}
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.496))' }}
    >
      <path d={glyph.path} fill={props.color} />
    </svg>
  )
}

const KeyFace = (props: {
  entry: UIKeyboardPlacedKey
  pressed: boolean
  shifted: boolean
  symbols: boolean
}) => {
  const colors = () => (props.pressed ? UIKeyboardPalette.spacePressed : palette(props.entry))
  const isArrowKey = () =>
    props.entry.kind === 'shift' || props.entry.kind === 'planeChooser'
  const arrowFilled = () => (props.entry.kind === 'shift' ? props.shifted : props.symbols)
  return (
    <div
      class="absolute"
      style={{
        left: `${props.entry.visual.x}px`,
        top: `${props.entry.visual.y}px`,
        width: `${props.entry.visual.width}px`,
        height: `${props.entry.visual.height}px`,
        'border-radius': `${UIKeyboardMetrics.faceRadius}px`,
        background: `linear-gradient(to bottom, ${colors().top}, ${colors().bottom})`,
        'box-shadow': `0 3px 0 rgba(0,0,0,0.075), 0 2px 0 rgba(0,0,0,0.18), inset 0 0.75px 0 ${colors().highlight}`,
        border: '0.3px solid rgba(0,0,0,0.08)',
        'pointer-events': 'none'
      }}
    >
      <div
        class="flex h-full w-full items-center justify-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${labelSize(props.entry)}px`,
          color: labelColor(props.entry),
          'text-shadow':
            props.entry.kind === 'space'
              ? '0 1px 0 rgba(255,255,255,0.62)'
              : props.entry.style === 'light'
                ? 'none'
                : '0 -1px 0 rgba(0,0,0,0.496)'
        }}
      >
        <Show when={isArrowKey()}>
          <Show
            when={arrowFilled()}
            fallback={<KeyCapGlyph name="shiftSmall" size={23} color="rgba(255,255,255,0.98)" />}
          >
            <FilledShiftArrow />
          </Show>
        </Show>
        <Show when={props.entry.kind === 'delete'}>
          <KeyCapGlyph name="deleteWide" size={22} color="rgba(255,255,255,0.97)" />
        </Show>
        <Show when={!isArrowKey() && props.entry.kind !== 'delete'}>{props.entry.label}</Show>
      </div>
    </div>
  )
}

export const UIKeyboardView = (props: {
  visible: boolean
  width: number
  configuration: UIKeyboardConfiguration
  onInsert: (text: string) => void
  onDelete: () => void
  onReturn: () => void
}) => {
  const [plane, setPlane] = createSignal<UIKeyboardPlane>('letters')
  const [shifted, setShifted] = createSignal(true)
  const [pressed, setPressed] = createSignal<string | undefined>()

  const scale = () => props.width / UIKeyboardMetrics.referenceWidth
  const keys = () => keyboardKeys(plane(), shifted(), props.configuration)

  createEffect(() => {
    if (!props.visible) return
    setPlane('letters')
    setShifted(props.configuration.autocapitalization)
  })

  createEffect(() => {
    if (!props.visible) return
    const release = uiKeyboardAttachHardware({
      onInsert: props.onInsert,
      onDelete: props.onDelete,
      onReturn: props.onReturn
    })
    onCleanup(release)
  })

  const activate = (entry: UIKeyboardPlacedKey) => {
    if (entry.kind === 'character' && entry.output) {
      props.onInsert(shifted() && plane() === 'letters' ? entry.output.toUpperCase() : entry.output)
      if (plane() === 'letters') setShifted(false)
      return
    }
    if (entry.kind === 'space') {
      props.onInsert(' ')
      return
    }
    if (entry.kind === 'delete') {
      props.onDelete()
      return
    }
    if (entry.kind === 'return') {
      props.onReturn()
      return
    }
    if (entry.kind === 'shift') {
      setShifted(!shifted())
      return
    }
    if (entry.kind === 'planeChooser') {
      setPlane(plane() === 'symbols' ? 'numbers' : 'symbols')
      setShifted(false)
      return
    }
    if (entry.kind === 'switchToNumbers') setPlane('numbers')
    if (entry.kind === 'switchToSymbols') setPlane('symbols')
    if (entry.kind === 'switchToLetters') setPlane('letters')
  }

  return (
    <div
      class="absolute inset-x-0 bottom-0 overflow-hidden"
      style={{
        height: `${UIKeyboardMetrics.referenceHeight * scale()}px`,
        transform: `translateY(${props.visible ? 0 : 100}%)`,
        transition: caTransition(['transform'], presentAnimation)
      }}
    >
      <div
        class="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${UIKeyboardPalette.keyboardTop}, ${UIKeyboardPalette.keyboardBottom})`
        }}
      />
      <div
        class="absolute inset-x-0 top-0"
        style={{
          height: `${UIKeyboardMetrics.topLipHeight}px`,
          background: UIKeyboardPalette.keyboardTopDarkLip
        }}
      />
      <div
        class="absolute inset-x-0"
        style={{
          top: `${UIKeyboardMetrics.topLipHeight}px`,
          height: `${UIKeyboardMetrics.topLipHeight}px`,
          background: UIKeyboardPalette.keyboardTopBrightLip
        }}
      />

      <div
        class="absolute left-0 top-0"
        style={{
          width: `${UIKeyboardMetrics.referenceWidth}px`,
          height: `${UIKeyboardMetrics.referenceHeight}px`,
          transform: `scale(${scale()})`,
          'transform-origin': 'top left'
        }}
      >
        <For each={keys()}>
          {(entry) => (
            <>
              <KeyFace
                entry={entry}
                pressed={pressed() === entry.id}
                shifted={shifted()}
                symbols={plane() === 'symbols'}
              />
              <button
                type="button"
                class="absolute"
                style={{
                  left: `${entry.hit.x}px`,
                  top: `${entry.hit.y}px`,
                  width: `${entry.hit.width}px`,
                  height: `${entry.hit.height}px`,
                  background: 'transparent',
                  'touch-action': 'none'
                }}
                onMouseDown={(event) => event.preventDefault()}
                onPointerDown={() => setPressed(entry.id)}
                onPointerUp={() => {
                  setPressed(undefined)
                  activate(entry)
                }}
                onPointerLeave={() => setPressed(undefined)}
                onPointerCancel={() => setPressed(undefined)}
              />
            </>
          )}
        </For>
      </div>
    </div>
  )
}
