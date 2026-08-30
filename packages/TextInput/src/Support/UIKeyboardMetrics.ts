export const UIKeyboardMetrics = {
  referenceWidth: 320,
  referenceHeight: 216,
  rowSlotY: [10, 64, 118, 172],
  rowPitch: 54,
  faceHeight: 38,
  slotWidth: 32,
  faceInsetX: 3,
  faceInsetY: 2,
  faceRadius: 4,
  topLipHeight: 1,
  presentDuration: 0.3
} as const

const rgb = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`

export const UIKeyboardPalette = {
  keyboardTop: rgb(145, 153, 164),
  keyboardBottom: rgb(68, 78, 92),
  keyboardTopDarkLip: rgb(58, 61, 66),
  keyboardTopBrightLip: rgb(178, 184, 191),
  lightRows: [
    { top: rgb(250, 250, 251), bottom: rgb(221, 223, 225), highlight: 'rgb(255,255,255)' },
    { top: rgb(245, 246, 247), bottom: rgb(217, 219, 221), highlight: 'rgb(255,255,255)' },
    { top: rgb(237, 238, 240), bottom: rgb(212, 214, 218), highlight: 'rgb(255,255,255)' },
    { top: rgb(224, 225, 228), bottom: rgb(179, 183, 190), highlight: 'rgb(255,255,255)' }
  ],
  darkRows: [
    { top: rgb(149, 157, 168), bottom: rgb(102, 111, 126), highlight: rgb(201, 205, 209) },
    { top: rgb(149, 157, 168), bottom: rgb(102, 111, 126), highlight: rgb(201, 205, 209) },
    { top: rgb(149, 157, 168), bottom: rgb(102, 111, 126), highlight: rgb(201, 205, 209) },
    { top: rgb(130, 138, 149), bottom: rgb(80, 89, 102), highlight: rgb(168, 174, 182) }
  ],
  blue: { top: rgb(66, 135, 245), bottom: rgb(25, 79, 220), highlight: rgb(108, 172, 249) },
  spacePressed: {
    top: rgb(169, 173, 180),
    bottom: rgb(122, 128, 139),
    highlight: rgb(201, 204, 209)
  }
} as const
