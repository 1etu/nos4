import { CalculatorMetrics, CalculatorPalette } from '../Support/CalculatorMetrics'
import { calculatorDisplayFontSize } from '../Support/CalculatorDisplayText'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const CalculatorDisplay = (props: { height: number; text: string }) => (
  <div
    class="flex shrink-0 items-center justify-end overflow-hidden"
    style={{
      height: `${props.height}px`,
      padding: `0 ${CalculatorMetrics.sideInset}px`,
      background: CalculatorPalette.display
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${calculatorDisplayFontSize(props.text)}px`,
        'line-height': '1',
        color: CalculatorPalette.displayText,
        'white-space': 'pre'
      }}
    >
      {props.text}
    </span>
  </div>
)
