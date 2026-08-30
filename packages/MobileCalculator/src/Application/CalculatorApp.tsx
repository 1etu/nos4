import { UIStatusBar, UIStatusBarMetrics } from 'UIKit'
import { CalculatorDisplay } from '../Display/CalculatorDisplay'
import { CalculatorKeypad } from '../Keypad/CalculatorKeypad'
import { calculatorPerform, calculatorState } from '../Support/CalculatorEngine'
import { calculatorDisplayText } from '../Support/CalculatorDisplayText'
import { CalculatorKeypadHeight, CalculatorMetrics } from '../Support/CalculatorMetrics'

export const CalculatorApp = (props: { width: number; height: number }) => {
  const scale = () => props.width / CalculatorMetrics.referenceWidth
  const stageHeight = () => (props.height - UIStatusBarMetrics.height) / scale()

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar />

      <div class="relative flex-1 overflow-hidden">
        <div
          class="absolute left-0 top-0 flex flex-col"
          style={{
            width: `${CalculatorMetrics.referenceWidth}px`,
            height: `${stageHeight()}px`,
            transform: `scale(${scale()})`,
            'transform-origin': 'top left'
          }}
        >
          <CalculatorDisplay
            height={stageHeight() - CalculatorKeypadHeight}
            text={calculatorDisplayText(calculatorState().entry)}
          />
          <CalculatorKeypad pending={calculatorState().pending} onPress={calculatorPerform} />
        </div>
      </div>
    </div>
  )
}
