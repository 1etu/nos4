import { CalculatorAdvance, CalculatorDisplayWidth, CalculatorMetrics } from './CalculatorMetrics'

const Point = '.'
const Minus = '-'
const Exponent = 'e'
const Grouping = /\B(?=(\d{3})+$)/g

const advanceOf = (character: string): number => {
  if (character === Point || character === ',') return CalculatorAdvance.separator
  if (character === Minus) return CalculatorAdvance.sign
  if (character === '+') return CalculatorAdvance.operator
  return CalculatorAdvance.digit
}

export const calculatorDisplayText = (entry: string): string => {
  if (entry.includes(Exponent)) return entry
  const negative = entry.startsWith(Minus)
  const body = negative ? entry.slice(1) : entry
  const point = body.indexOf(Point)
  const whole = point === -1 ? body : body.slice(0, point)
  const rest = point === -1 ? '' : body.slice(point)
  const grouped = whole.replace(Grouping, ',') + rest
  return negative ? Minus + grouped : grouped
}

export const calculatorDisplayFontSize = (text: string): number => {
  const advance = [...text].reduce((total, character) => total + advanceOf(character), 0)
  const fitted = CalculatorDisplayWidth / advance
  return Math.min(CalculatorMetrics.displayFontSize, fitted)
}
