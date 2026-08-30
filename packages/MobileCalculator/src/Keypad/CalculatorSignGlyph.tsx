import { CalculatorMetrics, CalculatorPalette } from '../Support/CalculatorMetrics'

const Bar = (props: { width: number; height: number; x: number; y: number; angle: number }) => (
  <div
    class="absolute left-1/2 top-1/2"
    style={{
      width: `${props.width}px`,
      height: `${props.height}px`,
      background: CalculatorPalette.label,
      transform: `translate(-50%, -50%) translate(${props.x}px, ${props.y}px) rotate(${props.angle}deg)`
    }}
  />
)

export const CalculatorSignGlyph = () => (
  <div class="relative h-full w-full">
    <Bar
      width={CalculatorMetrics.signBarLength}
      height={CalculatorMetrics.signBarThickness}
      x={CalculatorMetrics.signPlusOffsetX}
      y={CalculatorMetrics.signPlusOffsetY}
      angle={0}
    />
    <Bar
      width={CalculatorMetrics.signBarThickness}
      height={CalculatorMetrics.signBarLength}
      x={CalculatorMetrics.signPlusOffsetX}
      y={CalculatorMetrics.signPlusOffsetY}
      angle={0}
    />
    <Bar
      width={CalculatorMetrics.signSlashThickness}
      height={CalculatorMetrics.signSlashLength}
      x={CalculatorMetrics.signSlashOffsetX}
      y={CalculatorMetrics.signSlashOffsetY}
      angle={CalculatorMetrics.signSlashAngle}
    />
    <Bar
      width={CalculatorMetrics.signBarLength}
      height={CalculatorMetrics.signBarThickness}
      x={CalculatorMetrics.signMinusOffsetX}
      y={CalculatorMetrics.signMinusOffsetY}
      angle={0}
    />
  </div>
)
