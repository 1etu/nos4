import { UIKeyboardMetrics } from '../Support/UIKeyboardMetrics'

export type UIKeyboardPlane = 'letters' | 'numbers' | 'symbols'

export type UIKeyboardType = 'default' | 'url'

export type UIKeyboardReturnType = 'default' | 'go' | 'search'

export interface UIKeyboardConfiguration {
  readonly type: UIKeyboardType
  readonly returnType: UIKeyboardReturnType
  readonly autocapitalization: boolean
  readonly returnEnabled: boolean
}

export const UIKeyboardStandard: UIKeyboardConfiguration = {
  type: 'default',
  returnType: 'default',
  autocapitalization: true,
  returnEnabled: true
}

export const UIKeyboardCredential: UIKeyboardConfiguration = {
  type: 'default',
  returnType: 'default',
  autocapitalization: false,
  returnEnabled: true
}

export const UIKeyboardSearch = (returnEnabled: boolean): UIKeyboardConfiguration => ({
  type: 'default',
  returnType: 'search',
  autocapitalization: true,
  returnEnabled
})

export const UIKeyboardURL = (returnEnabled: boolean): UIKeyboardConfiguration => ({
  type: 'url',
  returnType: 'go',
  autocapitalization: false,
  returnEnabled
})

export type UIKeyboardKeyKind =
  | 'character'
  | 'shift'
  | 'delete'
  | 'space'
  | 'return'
  | 'switchToNumbers'
  | 'switchToLetters'
  | 'switchToSymbols'
  | 'planeChooser'

export type UIKeyboardKeyStyle = 'light' | 'dark' | 'blue'

export interface UIKeyboardFrame {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface UIKeyboardPlacedKey {
  readonly id: string
  readonly label: string
  readonly output?: string
  readonly kind: UIKeyboardKeyKind
  readonly style: UIKeyboardKeyStyle
  readonly row: number
  readonly visual: UIKeyboardFrame
  readonly hit: UIKeyboardFrame
}

const { rowSlotY, rowPitch, faceHeight, slotWidth, faceInsetX, faceInsetY } = UIKeyboardMetrics

const faceFrame = (slotX: number, row: number, width: number = slotWidth): UIKeyboardFrame => ({
  x: slotX + faceInsetX,
  y: (rowSlotY[row] ?? 0) + faceInsetY,
  width: Math.max(1, width - faceInsetX * 2),
  height: faceHeight
})

const hitFrame = (x: number, row: number, width: number): UIKeyboardFrame => ({
  x,
  y: (rowSlotY[row] ?? 0) - faceInsetY,
  width,
  height: rowPitch
})

const centeredFace = (hitLeft: number, hitRight: number, row: number): UIKeyboardFrame => ({
  x: hitLeft + (hitRight - hitLeft - faceHeight) / 2,
  y: (rowSlotY[row] ?? 0) + faceInsetY,
  width: faceHeight,
  height: faceHeight
})

const characterRow = (
  characters: string,
  row: number,
  slotStartX: number,
  prefix: string
): UIKeyboardPlacedKey[] =>
  [...characters].map((value, index) => {
    const slotX = slotStartX + index * slotWidth
    return {
      id: `${prefix}-${row}-${value}`,
      label: value.toUpperCase(),
      output: value,
      kind: 'character' as const,
      style: 'light' as const,
      row,
      visual: faceFrame(slotX, row),
      hit: hitFrame(slotX, row, slotWidth)
    }
  })

const ReturnTitle: Record<UIKeyboardReturnType, string> = {
  default: 'return',
  go: 'Go',
  search: 'Search'
}

const returnKey = (configuration: UIKeyboardConfiguration): UIKeyboardPlacedKey => ({
  id: 'return',
  label: ReturnTitle[configuration.returnType],
  kind: 'return',
  style:
    configuration.returnType !== 'default' && configuration.returnEnabled ? 'blue' : 'dark',
  row: 3,
  visual: { x: 243, y: (rowSlotY[3] ?? 0) + faceInsetY, width: 74, height: faceHeight },
  hit: { x: 240, y: 162, width: 80, height: rowPitch }
})

const bottomRow = (
  leftLabel: string,
  leftKind: UIKeyboardKeyKind,
  configuration: UIKeyboardConfiguration
): UIKeyboardPlacedKey[] => {
  const y = (rowSlotY[3] ?? 0) + faceInsetY
  return [
    {
      id: 'bottom-left',
      label: leftLabel,
      kind: leftKind,
      style: 'dark',
      row: 3,
      visual: { x: 3, y, width: 74, height: faceHeight },
      hit: { x: 0, y: 162, width: 80, height: rowPitch }
    },
    {
      id: 'space',
      label: 'space',
      output: ' ',
      kind: 'space',
      style: 'light',
      row: 3,
      visual: { x: 83, y, width: 154, height: faceHeight },
      hit: { x: 80, y: 162, width: 160, height: rowPitch }
    },
    returnKey(configuration)
  ]
}

const punctuationRow = (
  switchLabel: string,
  switchKind: UIKeyboardKeyKind
): UIKeyboardPlacedKey[] => {
  const marks = ['.', ',', '?', '!', "'"]
  const hitLefts = [46, 93, 138, 183, 228]
  const hitRights = [93, 138, 183, 228, 275]

  const keys: UIKeyboardPlacedKey[] = [
    {
      id: 'switch-plane',
      label: switchLabel,
      kind: switchKind,
      style: 'dark',
      row: 2,
      visual: faceFrame(0, 2, 46),
      hit: hitFrame(0, 2, 46)
    }
  ]

  marks.forEach((mark, index) => {
    const left = hitLefts[index] ?? 0
    const right = hitRights[index] ?? 0
    keys.push({
      id: `punctuation-${mark}`,
      label: mark,
      output: mark,
      kind: 'character',
      style: 'light',
      row: 2,
      visual: centeredFace(left, right, 2),
      hit: hitFrame(left, 2, right - left)
    })
  })

  keys.push({
    id: 'delete',
    label: '',
    kind: 'delete',
    style: 'dark',
    row: 2,
    visual: faceFrame(275, 2, 45),
    hit: hitFrame(275, 2, 45)
  })

  return keys
}

const alphabeticRows = (shifted: boolean): UIKeyboardPlacedKey[] => {
  const keys: UIKeyboardPlacedKey[] = [
    ...characterRow('qwertyuiop', 0, 0, 'char'),
    ...characterRow('asdfghjkl', 1, 16, 'char')
  ]

  keys.push({
    id: 'shift',
    label: '',
    kind: 'shift',
    style: 'dark',
    row: 2,
    visual: faceFrame(0, 2, 48),
    hit: hitFrame(0, 2, 48)
  })

  ;[...'zxcvbnm'].forEach((letter, index) => {
    const slotX = 48 + index * slotWidth
    keys.push({
      id: `char-third-${letter}`,
      label: letter.toUpperCase(),
      output: letter,
      kind: 'character',
      style: 'light',
      row: 2,
      visual: faceFrame(slotX, 2),
      hit: hitFrame(slotX, 2, slotWidth)
    })
  })

  keys.push({
    id: 'delete',
    label: '',
    kind: 'delete',
    style: 'dark',
    row: 2,
    visual: faceFrame(272, 2, 48),
    hit: hitFrame(272, 2, 48)
  })

  return keys.map((key) =>
    key.kind === 'character' && key.output
      ? { ...key, output: shifted ? key.output.toUpperCase() : key.output }
      : key
  )
}

const letters = (
  shifted: boolean,
  configuration: UIKeyboardConfiguration
): UIKeyboardPlacedKey[] => [
  ...alphabeticRows(shifted),
  ...bottomRow('.?123', 'switchToNumbers', configuration)
]

const numbers = (configuration: UIKeyboardConfiguration): UIKeyboardPlacedKey[] => [
  ...characterRow('1234567890', 0, 0, 'num'),
  ...['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'].map((value, index) => {
    const slotX = index * slotWidth
    return {
      id: `num-second-${index}`,
      label: value,
      output: value,
      kind: 'character' as const,
      style: 'light' as const,
      row: 1,
      visual: faceFrame(slotX, 1),
      hit: hitFrame(slotX, 1, slotWidth)
    }
  }),
  ...punctuationRow('#+=', 'switchToSymbols'),
  ...bottomRow('ABC', 'switchToLetters', configuration)
]

const symbols = (configuration: UIKeyboardConfiguration): UIKeyboardPlacedKey[] => [
  ...['[', ']', '{', '}', '#', '%', '^', '*', '+', '='].map((value, index) => {
    const slotX = index * slotWidth
    return {
      id: `sym-first-${index}`,
      label: value,
      output: value,
      kind: 'character' as const,
      style: 'light' as const,
      row: 0,
      visual: faceFrame(slotX, 0),
      hit: hitFrame(slotX, 0, slotWidth)
    }
  }),
  ...['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'].map((value, index) => {
    const slotX = index * slotWidth
    return {
      id: `sym-second-${index}`,
      label: value,
      output: value,
      kind: 'character' as const,
      style: 'light' as const,
      row: 1,
      visual: faceFrame(slotX, 1),
      hit: hitFrame(slotX, 1, slotWidth)
    }
  }),
  ...punctuationRow('123', 'switchToNumbers'),
  ...bottomRow('ABC', 'switchToLetters', configuration)
]

const UrlBottomBoundaries = [0, 80, 133, 186, 240, 320]

const urlBottomRow = (
  leftLabel: string,
  leftKind: UIKeyboardKeyKind,
  configuration: UIKeyboardConfiguration
): UIKeyboardPlacedKey[] => {
  const y = (rowSlotY[3] ?? 0) + faceInsetY
  const keys: UIKeyboardPlacedKey[] = [
    {
      id: 'bottom-left',
      label: leftLabel,
      kind: leftKind,
      style: 'dark',
      row: 3,
      visual: { x: 3, y, width: 74, height: faceHeight },
      hit: { x: 0, y: 162, width: 80, height: rowPitch }
    }
  ]

  ;['.', '/', '.com'].forEach((value, index) => {
    const left = UrlBottomBoundaries[index + 1] ?? 0
    const right = UrlBottomBoundaries[index + 2] ?? 0
    keys.push({
      id: `url-bottom-${value}`,
      label: value,
      output: value,
      kind: 'character',
      style: 'light',
      row: 3,
      visual: { x: left + faceInsetX, y, width: right - left - faceInsetX * 2, height: faceHeight },
      hit: { x: left, y: 162, width: right - left, height: rowPitch }
    })
  })

  keys.push(returnKey(configuration))
  return keys
}

const centeredSixKeyRow = (values: string[], row: number, prefix: string): UIKeyboardPlacedKey[] =>
  values.map((value, index) => {
    const slotX = 16 + index * 48
    return {
      id: `${prefix}-six-${index}-${value}`,
      label: value,
      output: value,
      kind: 'character' as const,
      style: 'light' as const,
      row,
      visual: faceFrame(slotX, row, 48),
      hit: hitFrame(slotX, row, 48)
    }
  })

const urlUtilityRow = (values: string[], prefix: string): UIKeyboardPlacedKey[] => {
  const keys: UIKeyboardPlacedKey[] = [
    {
      id: `${prefix}-plane-chooser`,
      label: '',
      kind: 'planeChooser',
      style: 'dark',
      row: 2,
      visual: faceFrame(0, 2, 48),
      hit: hitFrame(0, 2, 48)
    }
  ]

  values.forEach((value, index) => {
    const slotX = 48 + index * 56
    keys.push({
      id: `${prefix}-utility-${index}-${value}`,
      label: value,
      output: value,
      kind: 'character',
      style: 'light',
      row: 2,
      visual: faceFrame(slotX, 2, 56),
      hit: hitFrame(slotX, 2, 56)
    })
  })

  keys.push({
    id: `${prefix}-delete`,
    label: '',
    kind: 'delete',
    style: 'dark',
    row: 2,
    visual: faceFrame(272, 2, 48),
    hit: hitFrame(272, 2, 48)
  })

  return keys
}

const urlLetters = (
  shifted: boolean,
  configuration: UIKeyboardConfiguration
): UIKeyboardPlacedKey[] => [
  ...alphabeticRows(shifted),
  ...urlBottomRow('@123', 'switchToNumbers', configuration)
]

const urlNumbers = (configuration: UIKeyboardConfiguration): UIKeyboardPlacedKey[] => [
  ...characterRow('1234567890', 0, 0, 'url-num'),
  ...centeredSixKeyRow(['@', '&', '%', '?', ',', '='], 1, 'url-num'),
  ...urlUtilityRow(['_', ':', '-', '+'], 'url-num'),
  ...urlBottomRow('ABC', 'switchToLetters', configuration)
]

const urlSymbols = (configuration: UIKeyboardConfiguration): UIKeyboardPlacedKey[] => [
  ...characterRow('1234567890', 0, 0, 'url-sym'),
  ...centeredSixKeyRow(['*', '$', '#', '!', "'", '^'], 1, 'url-sym'),
  ...urlUtilityRow(['~', ';', '(', ')'], 'url-sym'),
  ...urlBottomRow('ABC', 'switchToLetters', configuration)
]

export const keyboardKeys = (
  plane: UIKeyboardPlane,
  shifted: boolean,
  configuration: UIKeyboardConfiguration
): UIKeyboardPlacedKey[] => {
  if (configuration.type === 'url') {
    if (plane === 'numbers') return urlNumbers(configuration)
    if (plane === 'symbols') return urlSymbols(configuration)
    return urlLetters(shifted, configuration)
  }
  if (plane === 'numbers') return numbers(configuration)
  if (plane === 'symbols') return symbols(configuration)
  return letters(shifted, configuration)
}
