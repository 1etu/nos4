import { createSignal, Show } from 'solid-js'
import {
  CalculatorLabelMetrics,
  CalculatorMetrics,
  CalculatorPalette
} from '../Support/CalculatorMetrics'
import { calculatorKeyFrame, type CalculatorKeyDefinition } from '../Support/CalculatorKeys'
import { CalculatorSignGlyph } from './CalculatorSignGlyph'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const KeyShadow = [
  `0 ${CalculatorMetrics.keyShadowDrop}px 0 ${CalculatorPalette.keyShadow}`,
  `0 ${CalculatorMetrics.keyLipDrop}px 0 ${CalculatorPalette.keyLip}`,
  `inset ${CalculatorMetrics.keyBevelWidth}px 0 ${CalculatorMetrics.keyBevelWidth}px ${-CalculatorMetrics.keyBevelInset}px ${CalculatorPalette.keyBevel}`,
  `inset ${-CalculatorMetrics.keyBevelWidth}px 0 ${CalculatorMetrics.keyBevelWidth}px ${-CalculatorMetrics.keyBevelInset}px ${CalculatorPalette.keyBevel}`
].join(', ')

export const CalculatorKey = (props: {
  definition: CalculatorKeyDefinition
  lit: boolean
  onPress: () => void
}) => {
  const [held, setHeld] = createSignal(false)
  const frame = () => calculatorKeyFrame(props.definition)
  const label = () =>
    props.definition.label === 'sign' ? undefined : CalculatorLabelMetrics[props.definition.label]
  const face = () =>
    props.lit || held()
      ? CalculatorPalette.faceLit[props.definition.tone]
      : CalculatorPalette.face[props.definition.tone]

  return (
    <button
      type="button"
      class="absolute"
      style={{
        left: `${frame().left}px`,
        top: `${frame().top}px`,
        width: `${frame().width}px`,
        height: `${frame().height}px`,
        'border-radius': `${CalculatorMetrics.keyRadius}px`,
        background: face(),
        'box-shadow': KeyShadow
      }}
      onPointerDown={() => {
        setHeld(true)
        props.onPress()
      }}
      onPointerUp={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onContextMenu={(event) => event.preventDefault()}
    >
      <div
        class="absolute bottom-0 left-0 flex items-center justify-center"
        style={{
          width: `${CalculatorMetrics.keyWidth}px`,
          height: `${CalculatorMetrics.keyHeight}px`
        }}
      >
        <Show when={label()} fallback={<CalculatorSignGlyph />}>
          {(metrics) => (
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${metrics().fontSize}px`,
                'font-weight': metrics().weight,
                'line-height': '1',
                color: CalculatorPalette.label,
                transform: `translateY(${metrics().shift}px)`
              }}
            >
              {props.definition.glyph}
            </span>
          )}
        </Show>
      </div>
    </button>
  )
}
