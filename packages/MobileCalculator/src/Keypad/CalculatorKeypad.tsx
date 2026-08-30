import { For } from 'solid-js'
import {
  CalculatorKeypadHeight,
  CalculatorMetrics,
  CalculatorPalette
} from '../Support/CalculatorMetrics'
import { CalculatorKeyLayout } from '../Support/CalculatorKeys'
import type { CalculatorAction, CalculatorOperator } from '../Support/CalculatorEngine'
import { CalculatorKey } from './CalculatorKey'

const isPending = (action: CalculatorAction, pending: CalculatorOperator | undefined): boolean =>
  action.kind === 'operator' && action.operator === pending

export const CalculatorKeypad = (props: {
  pending: CalculatorOperator | undefined
  onPress: (action: CalculatorAction) => void
}) => (
  <div
    class="relative shrink-0 overflow-hidden"
    style={{
      height: `${CalculatorKeypadHeight}px`,
      'background-color': CalculatorPalette.panel,
      'background-image': CalculatorPalette.panelTexture,
      'background-size': `${CalculatorMetrics.panelTextureTile}px ${CalculatorMetrics.panelTextureTile}px`,
      'box-shadow': `inset 0 ${CalculatorMetrics.panelShadowDepth}px ${CalculatorMetrics.panelShadowBlur}px ${CalculatorPalette.panelShadow}`
    }}
  >
    <For each={CalculatorKeyLayout}>
      {(definition) => (
        <CalculatorKey
          definition={definition}
          lit={isPending(definition.action, props.pending)}
          onPress={() => props.onPress(definition.action)}
        />
      )}
    </For>
  </div>
)
