import { GameCenterMetrics } from './GameCenterMetrics'

const DefaultAdvance = 0.62

const Advances: Record<string, number> = {
  A: 0.626,
  B: 0.561,
  C: 0.614,
  D: 0.635,
  E: 0.46,
  F: 0.448,
  G: 0.697,
  H: 0.616,
  I: 0.296,
  J: 0.379,
  K: 0.635,
  L: 0.441,
  M: 0.769,
  N: 0.638,
  O: 0.74,
  P: 0.569,
  Q: 0.74,
  R: 0.583,
  S: 0.45,
  T: 0.466,
  U: 0.617,
  V: 0.653,
  W: 0.866,
  X: 0.573,
  Y: 0.587,
  Z: 0.518,
  '0': 0.578,
  '1': 0.316,
  '2': 0.43,
  '3': 0.401,
  '4': 0.469,
  '5': 0.406,
  '6': 0.544,
  '7': 0.453,
  '8': 0.514,
  '9': 0.544,
  ' ': 0.2,
  _: 0.439,
  '-': 0.314,
  '.': 0.274,
  '@': 0.874
}

export const gkAliasFontSize = (alias: string, width: number): number => {
  const advance = [...alias.toUpperCase()].reduce(
    (total, character) => total + (Advances[character] ?? DefaultAdvance),
    0
  )
  if (advance === 0) return GameCenterMetrics.aliasFontSize
  const available = width - GameCenterMetrics.aliasInsetX * 2
  return Math.min(GameCenterMetrics.aliasFontSize, available / advance)
}
