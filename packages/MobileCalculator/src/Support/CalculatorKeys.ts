import { CalculatorMetrics, type CalculatorLabelStyle, type CalculatorTone } from './CalculatorMetrics'
import type { CalculatorAction } from './CalculatorEngine'

export interface CalculatorKeyDefinition {
  readonly id: string
  readonly glyph: string
  readonly tone: CalculatorTone
  readonly label: CalculatorLabelStyle | 'sign'
  readonly action: CalculatorAction
  readonly column: number
  readonly row: number
  readonly columns: number
  readonly rows: number
}

export interface CalculatorKeyFrame {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

const key = (
  id: string,
  glyph: string,
  tone: CalculatorTone,
  label: CalculatorLabelStyle | 'sign',
  action: CalculatorAction,
  column: number,
  row: number,
  columns = 1,
  rows = 1
): CalculatorKeyDefinition => ({ id, glyph, tone, label, action, column, row, columns, rows })

const digit = (value: number, column: number, row: number): CalculatorKeyDefinition =>
  key(String(value), String(value), 'digit', 'digit', { kind: 'digit', value }, column, row)

export const CalculatorKeyLayout: readonly CalculatorKeyDefinition[] = [
  key('memoryClear', 'mc', 'memory', 'memory', { kind: 'memoryClear' }, 0, 0),
  key('memoryAdd', 'm+', 'memory', 'memory', { kind: 'memoryAdd' }, 1, 0),
  key('memorySubtract', 'm-', 'memory', 'memory', { kind: 'memorySubtract' }, 2, 0),
  key('memoryRecall', 'mr', 'memory', 'memory', { kind: 'memoryRecall' }, 3, 0),
  key('clear', 'C', 'operator', 'clear', { kind: 'clear' }, 0, 1),
  key('sign', '', 'operator', 'sign', { kind: 'sign' }, 1, 1),
  key('divide', '÷', 'operator', 'operator', { kind: 'operator', operator: 'divide' }, 2, 1),
  key('multiply', '×', 'operator', 'operator', { kind: 'operator', operator: 'multiply' }, 3, 1),
  digit(7, 0, 2),
  digit(8, 1, 2),
  digit(9, 2, 2),
  key('subtract', '−', 'operator', 'operator', { kind: 'operator', operator: 'subtract' }, 3, 2),
  digit(4, 0, 3),
  digit(5, 1, 3),
  digit(6, 2, 3),
  key('add', '+', 'operator', 'operator', { kind: 'operator', operator: 'add' }, 3, 3),
  digit(1, 0, 4),
  digit(2, 1, 4),
  digit(3, 2, 4),
  key('equals', '=', 'equals', 'operator', { kind: 'equals' }, 3, 4, 1, 2),
  key('zero', '0', 'digit', 'digit', { kind: 'digit', value: 0 }, 0, 5, 2),
  key('decimal', '.', 'digit', 'decimal', { kind: 'decimal' }, 2, 5)
]

export const calculatorKeyFrame = (definition: CalculatorKeyDefinition): CalculatorKeyFrame => ({
  left:
    CalculatorMetrics.sideInset +
    definition.column * (CalculatorMetrics.keyWidth + CalculatorMetrics.columnGap),
  top:
    CalculatorMetrics.keypadTopInset +
    definition.row * (CalculatorMetrics.keyHeight + CalculatorMetrics.rowGap),
  width:
    definition.columns * CalculatorMetrics.keyWidth +
    (definition.columns - 1) * CalculatorMetrics.columnGap,
  height:
    definition.rows * CalculatorMetrics.keyHeight +
    (definition.rows - 1) * CalculatorMetrics.rowGap
})
