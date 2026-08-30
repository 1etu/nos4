import { createSignal } from 'solid-js'

export type CalculatorOperator = 'add' | 'subtract' | 'multiply' | 'divide'

export type CalculatorAction =
  | { readonly kind: 'digit'; readonly value: number }
  | { readonly kind: 'decimal' }
  | { readonly kind: 'clear' }
  | { readonly kind: 'sign' }
  | { readonly kind: 'operator'; readonly operator: CalculatorOperator }
  | { readonly kind: 'equals' }
  | { readonly kind: 'memoryClear' }
  | { readonly kind: 'memoryAdd' }
  | { readonly kind: 'memorySubtract' }
  | { readonly kind: 'memoryRecall' }

interface CalculatorRepeat {
  readonly operator: CalculatorOperator
  readonly operand: number
}

export interface CalculatorState {
  readonly entry: string
  readonly typing: boolean
  readonly accumulator: number
  readonly pending: CalculatorOperator | undefined
  readonly repeat: CalculatorRepeat | undefined
  readonly memory: number
}

const MaxDigits = 9
const Zero = '0'
const Minus = '-'
const Point = '.'
const ErrorText = 'Error'
const UpperBound = 10 ** MaxDigits
const LowerBound = 10 ** -(MaxDigits - 1)
const ExponentDigits = 5

const Empty: CalculatorState = {
  entry: Zero,
  typing: false,
  accumulator: 0,
  pending: undefined,
  repeat: undefined,
  memory: 0
}

const trimTail = (text: string): string => {
  if (!text.includes(Point)) return text
  const trimmed = text.replace(/0+$/, '')
  return trimmed.endsWith(Point) ? trimmed.slice(0, -1) : trimmed
}

const exponential = (value: number): string =>
  value.toExponential(ExponentDigits).replace('e+', 'e')

export const calculatorFormat = (value: number): string => {
  if (!Number.isFinite(value)) return ErrorText
  if (value === 0) return Zero
  const magnitude = Math.abs(value)
  if (magnitude >= UpperBound || magnitude < LowerBound) return exponential(value)
  const integerDigits = Math.max(1, Math.floor(Math.log10(magnitude)) + 1)
  return trimTail(value.toFixed(MaxDigits - integerDigits))
}

const numberOf = (state: CalculatorState): number => Number(state.entry)

const digitCount = (text: string): number => text.replace(/\D/g, '').length

const apply = (operator: CalculatorOperator, left: number, right: number): number => {
  if (operator === 'add') return left + right
  if (operator === 'subtract') return left - right
  if (operator === 'multiply') return left * right
  return left / right
}

const typeDigit = (state: CalculatorState, value: number): CalculatorState => {
  const started = state.typing ? state.entry : Zero
  if (digitCount(started) >= MaxDigits) return state
  const negative = started.startsWith(Minus)
  const body = negative ? started.slice(1) : started
  const grown = body === Zero ? String(value) : body + String(value)
  return { ...state, entry: negative ? Minus + grown : grown, typing: true }
}

const typeDecimal = (state: CalculatorState): CalculatorState => {
  if (!state.typing) return { ...state, entry: Zero + Point, typing: true }
  if (state.entry.includes(Point)) return state
  return { ...state, entry: state.entry + Point }
}

const toggleSign = (state: CalculatorState): CalculatorState => {
  if (!state.typing) return { ...state, entry: calculatorFormat(-numberOf(state)) }
  const flipped = state.entry.startsWith(Minus) ? state.entry.slice(1) : Minus + state.entry
  return { ...state, entry: flipped }
}

const chooseOperator = (state: CalculatorState, operator: CalculatorOperator): CalculatorState => {
  if (!state.typing && state.pending) return { ...state, pending: operator }
  const operand = numberOf(state)
  const total = state.pending ? apply(state.pending, state.accumulator, operand) : operand
  return {
    ...state,
    entry: calculatorFormat(total),
    typing: false,
    accumulator: total,
    pending: operator,
    repeat: undefined
  }
}

const resolve = (state: CalculatorState): CalculatorState => {
  const operand = numberOf(state)
  if (state.pending) {
    const total = apply(state.pending, state.accumulator, operand)
    return {
      ...state,
      entry: calculatorFormat(total),
      typing: false,
      accumulator: total,
      pending: undefined,
      repeat: { operator: state.pending, operand }
    }
  }
  if (!state.repeat) return { ...state, typing: false, accumulator: operand }
  const total = apply(state.repeat.operator, operand, state.repeat.operand)
  return { ...state, entry: calculatorFormat(total), typing: false, accumulator: total }
}

const remember = (state: CalculatorState, amount: number): CalculatorState => ({
  ...state,
  typing: false,
  memory: state.memory + amount
})

const reduce = (state: CalculatorState, action: CalculatorAction): CalculatorState => {
  if (action.kind === 'digit') return typeDigit(state, action.value)
  if (action.kind === 'decimal') return typeDecimal(state)
  if (action.kind === 'sign') return toggleSign(state)
  if (action.kind === 'operator') return chooseOperator(state, action.operator)
  if (action.kind === 'equals') return resolve(state)
  if (action.kind === 'clear') return { ...Empty, memory: state.memory }
  if (action.kind === 'memoryAdd') return remember(state, numberOf(state))
  if (action.kind === 'memorySubtract') return remember(state, -numberOf(state))
  if (action.kind === 'memoryClear') return { ...state, memory: 0 }
  return { ...state, entry: calculatorFormat(state.memory), typing: false }
}

const [state, setState] = createSignal(Empty)

export const calculatorState = state

export const calculatorPerform = (action: CalculatorAction): void => {
  setState(reduce(state(), action))
}
