export const CompassMetrics = {
  arrowTopInset: 24,
  arrowWidth: 44,
  arrowHeight: 32,
  headingTopInset: 6,
  headingFontSize: 48,
  toolBarHeight: 45,
  toolBarInsetX: 5,
  toolBarHighlightRatio: 0.025,
  toolBarHighlightScale: 1.5,
  toolBarBorderWidth: 0.95,
  toolBarOpacity: 0.65,
  coordinateFontSize: 16,
  buttonHeight: 32,
  buttonRadius: 5.5,
  locateGlyphWidth: 19,
  locateGlyphPaddingX: 7,
  infoGlyphWidth: 7,
  infoGlyphPaddingX: 13,
  faceTopRatio: 433 / 2007,
  bezelRatio: 586 / 640,
  discRatio: 500 / 640,
  highlightWidthRatio: 320 / 586,
  highlightHeightRatio: 204 / 586,
  highlightOffsetYRatio: 130 / 586,
  rimRatio: 488 / 586,
  rimInset: 12,
  directionRatio: 375 / 586,
  directionOffsetXRatio: (2 * 375) / (586 * 400),
  directionOffsetYRatio: (8 * 375) / (586 * 400),
  pivotRatio: 100 / 586,
  backgroundWidth: 320,
  backgroundHeight: 480,
  backgroundStretchRatio: 838 / 960
} as const

export const CompassToolBarHighlight =
  CompassMetrics.toolBarHeight *
  CompassMetrics.toolBarHighlightScale *
  CompassMetrics.toolBarHighlightRatio

const rgb = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`

export const CompassPalette = {
  text: rgb(255, 255, 255),
  textShadow: '0 -1px 0 rgba(0,0,0,0.8)',
  toolBar:
    'linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(84,84,84) 0.5%, rgb(59,59,59) 4%, rgb(29,29,29) 50%, rgb(8,8,8) 51%, rgb(8,8,8) 100%)',
  toolBarHighlight: 'linear-gradient(to bottom, rgba(230,230,230,0.75), rgba(230,230,230,0))',
  toolBarBorder: rgb(0, 0, 0),
  buttonFace:
    'linear-gradient(to bottom, rgb(95,95,95) 0%, rgb(32,32,32) 51%, rgb(8,8,8) 51%, rgb(8,8,8) 100%)',
  buttonShadow: 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
} as const
