export const CalculatorMetrics = {
  referenceWidth: 320,
  columns: 4,
  rows: 6,
  sideInset: 11,
  keyWidth: 64,
  keyHeight: 39,
  columnGap: 14,
  rowGap: 22,
  keyRadius: 4,
  keypadTopInset: 14,
  keypadBottomInset: 14,
  keyShadowDrop: 0.75,
  keyLipDrop: 1.5,
  keyBevelWidth: 4,
  keyBevelInset: 3,
  panelShadowDepth: 1.5,
  panelShadowBlur: 1.5,
  panelTextureTile: 64,
  displayFontSize: 75,
  signBarLength: 11,
  signBarThickness: 3,
  signSlashLength: 18.5,
  signSlashThickness: 2,
  signSlashAngle: 45,
  signPlusOffsetX: -7.5,
  signPlusOffsetY: -4,
  signMinusOffsetX: 7.5,
  signMinusOffsetY: 6.4,
  signSlashOffsetX: -0.6,
  signSlashOffsetY: 1.7
} as const

export const CalculatorKeypadHeight =
  CalculatorMetrics.keypadTopInset +
  CalculatorMetrics.rows * CalculatorMetrics.keyHeight +
  (CalculatorMetrics.rows - 1) * CalculatorMetrics.rowGap +
  CalculatorMetrics.keypadBottomInset

export const CalculatorDisplayWidth =
  CalculatorMetrics.referenceWidth - CalculatorMetrics.sideInset * 2

export const CalculatorLabelMetrics = {
  memory: { fontSize: 17, weight: '700', shift: -1.5 },
  clear: { fontSize: 17, weight: '700', shift: 0 },
  digit: { fontSize: 21, weight: '700', shift: 0 },
  operator: { fontSize: 30, weight: '400', shift: -4 },
  decimal: { fontSize: 32, weight: '700', shift: -4 }
} as const

export const CalculatorAdvance = {
  digit: 0.556,
  separator: 0.278,
  sign: 0.333,
  operator: 0.584
} as const

const rgb = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`

interface CalculatorFaceTone {
  readonly rim: string
  readonly crown: string
  readonly waist: string
  readonly gloss: string
  readonly foot: string
  readonly edge: string
}

interface CalculatorFaceStops {
  readonly rim: number
  readonly crown: number
  readonly waist: number
  readonly gloss: number
  readonly glossEnd: number
  readonly foot: number
}

const KeyStops: CalculatorFaceStops = {
  rim: 1.5,
  crown: 3,
  waist: 44,
  gloss: 45.5,
  glossEnd: 63,
  foot: 98
}

const EqualsStops: CalculatorFaceStops = {
  rim: 0.5,
  crown: 1.2,
  waist: 22.6,
  gloss: 22.7,
  glossEnd: 34,
  foot: 96
}

const face = (tone: CalculatorFaceTone, stops: CalculatorFaceStops): string =>
  `linear-gradient(to bottom, ${tone.rim} 0%, ${tone.rim} ${stops.rim}%, ${tone.crown} ${stops.crown}%, ${tone.waist} ${stops.waist}%, ${tone.gloss} ${stops.gloss}%, ${tone.gloss} ${stops.glossEnd}%, ${tone.foot} ${stops.foot}%, ${tone.edge} 100%)`

const Memory: CalculatorFaceTone = {
  rim: rgb(221, 221, 221),
  crown: rgb(169, 172, 174),
  waist: rgb(113, 118, 122),
  gloss: rgb(98, 104, 108),
  foot: rgb(69, 74, 78),
  edge: rgb(58, 62, 65)
}

const MemoryLit: CalculatorFaceTone = {
  rim: rgb(248, 248, 248),
  crown: rgb(214, 217, 219),
  waist: rgb(160, 166, 170),
  gloss: rgb(146, 152, 156),
  foot: rgb(112, 118, 122),
  edge: rgb(98, 103, 107)
}

const Operator: CalculatorFaceTone = {
  rim: rgb(216, 214, 213),
  crown: rgb(175, 166, 160),
  waist: rgb(124, 108, 99),
  gloss: rgb(110, 92, 82),
  foot: rgb(79, 63, 55),
  edge: rgb(68, 54, 46)
}

const OperatorLit: CalculatorFaceTone = {
  rim: rgb(246, 244, 243),
  crown: rgb(219, 209, 203),
  waist: rgb(171, 152, 141),
  gloss: rgb(157, 136, 124),
  foot: rgb(120, 100, 88),
  edge: rgb(107, 88, 76)
}

const Digit: CalculatorFaceTone = {
  rim: rgb(161, 161, 161),
  crown: rgb(91, 91, 91),
  waist: rgb(20, 20, 20),
  gloss: rgb(0, 0, 0),
  foot: rgb(0, 0, 0),
  edge: rgb(0, 0, 0)
}

const DigitLit: CalculatorFaceTone = {
  rim: rgb(214, 214, 214),
  crown: rgb(146, 146, 146),
  waist: rgb(66, 66, 66),
  gloss: rgb(48, 48, 48),
  foot: rgb(30, 30, 30),
  edge: rgb(22, 22, 22)
}

const Equals: CalculatorFaceTone = {
  rim: rgb(251, 230, 212),
  crown: rgb(251, 186, 131),
  waist: rgb(247, 129, 30),
  gloss: rgb(247, 129, 30),
  foot: rgb(236, 118, 19),
  edge: rgb(218, 109, 17)
}

const EqualsLit: CalculatorFaceTone = {
  rim: rgb(255, 244, 232),
  crown: rgb(253, 209, 171),
  waist: rgb(250, 163, 74),
  gloss: rgb(250, 163, 74),
  foot: rgb(244, 152, 62),
  edge: rgb(228, 140, 52)
}

const NoiseTexture =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='g' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='0.2' intercept='0.014'/%3E%3CfeFuncG type='linear' slope='0.2' intercept='0.014'/%3E%3CfeFuncB type='linear' slope='0.2' intercept='0.014'/%3E%3CfeFuncA type='linear' slope='0' intercept='1'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='64' height='64' filter='url(%23g)'/%3E%3C/svg%3E\")"

export const CalculatorPalette = {
  display: `linear-gradient(to bottom, ${rgb(249, 250, 245)} 0%, ${rgb(237, 239, 225)} 1.5%, ${rgb(217, 221, 191)} 50.4%, ${rgb(213, 217, 184)} 50.6%, ${rgb(213, 217, 184)} 62%, ${rgb(233, 235, 218)} 100%)`,
  displayText: rgb(6, 37, 18),
  panel: rgb(28, 28, 28),
  panelTexture: NoiseTexture,
  panelShadow: 'rgba(0,0,0,0.9)',
  keyShadow: rgb(0, 0, 0),
  keyLip: rgb(82, 82, 82),
  keyBevel: 'rgba(0,0,0,0.4)',
  label: rgb(255, 255, 255),
  face: {
    memory: face(Memory, KeyStops),
    operator: face(Operator, KeyStops),
    digit: face(Digit, KeyStops),
    equals: face(Equals, EqualsStops)
  },
  faceLit: {
    memory: face(MemoryLit, KeyStops),
    operator: face(OperatorLit, KeyStops),
    digit: face(DigitLit, KeyStops),
    equals: face(EqualsLit, EqualsStops)
  }
} as const

export type CalculatorTone = keyof typeof CalculatorPalette.face
export type CalculatorLabelStyle = keyof typeof CalculatorLabelMetrics
