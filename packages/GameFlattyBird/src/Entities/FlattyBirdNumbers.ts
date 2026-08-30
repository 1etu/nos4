import { skAddChild, skMakeNode, skMakeSprite, type SKNode, type SKTexture } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'

export interface FlattyBirdNumbers {
  readonly node: SKNode
  readonly strip: SKNode
  readonly digits: readonly SKTexture[]
  readonly empty: SKTexture
  readonly scale: number
}

const rowOffset = (value: number): number => {
  if (value >= 1000) return FlattyBirdMetrics.numberOffsetThousands
  if (value >= 100) return FlattyBirdMetrics.numberOffsetHundreds
  if (value >= 10) return FlattyBirdMetrics.numberOffsetTens
  return FlattyBirdMetrics.numberOffsetUnits
}

export const flattyBirdMakeNumbers = (
  digits: readonly SKTexture[],
  empty: SKTexture,
  x: number,
  y: number,
  scale: number
): FlattyBirdNumbers => {
  const node = skMakeNode(
    x - FlattyBirdMetrics.numberCentreSlots * FlattyBirdMetrics.digitWidth * scale,
    y
  )
  const strip = skMakeNode(0, 0)
  skAddChild(node, strip)

  const width = FlattyBirdMetrics.digitWidth * scale
  for (let slot = 0; slot < FlattyBirdMetrics.numberSlots; slot += 1) {
    const digit = skMakeSprite(empty, slot * width, 0, 0, 0)
    if (digit.sprite) {
      digit.sprite.width = width
      digit.sprite.height = FlattyBirdMetrics.digitHeight * scale
    }
    skAddChild(strip, digit)
  }
  return { node, strip, digits, empty, scale }
}

const paint = (numbers: FlattyBirdNumbers, slot: number, texture: SKTexture): void => {
  const sprite = numbers.strip.children[slot]?.sprite
  if (sprite) sprite.texture = texture
}

export const flattyBirdSetNumber = (numbers: FlattyBirdNumbers, value: number): void => {
  const clamped = Math.min(value, FlattyBirdMetrics.numberMaximum)
  let trailingZero = true

  const thousands = Math.floor(clamped / 1000) % 10
  if (trailingZero && thousands <= 0) paint(numbers, 0, numbers.empty)
  else {
    trailingZero = false
    paint(numbers, 0, numbers.digits[thousands] ?? numbers.empty)
  }

  const hundreds = Math.floor(clamped / 100) % 10
  if (trailingZero && hundreds <= 0) paint(numbers, 1, numbers.empty)
  else {
    trailingZero = false
    paint(numbers, 1, numbers.digits[hundreds] ?? numbers.empty)
  }

  const tens = Math.floor(clamped / 10) % 10
  if (trailingZero && tens <= 0) paint(numbers, 2, numbers.empty)
  else paint(numbers, 2, numbers.digits[tens] ?? numbers.empty)

  const units = clamped % 10
  paint(numbers, 3, numbers.digits[units] ?? numbers.empty)

  numbers.strip.x = rowOffset(clamped) * numbers.scale
}
