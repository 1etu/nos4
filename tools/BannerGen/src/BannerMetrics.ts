export const BannerMetrics = {
  scale: 2,
  paddingX: 34,
  paddingY: 26,
  columnGap: 34,
  deviceHeight: 340,
  reflectionHeight: 64,
  reflectionGap: 1,
  reflectionNear: 0.55,
  trimThreshold: 246,
  trimAlphaFloor: 8,
  trimInkFraction: 0.02,
  textColumnWidth: 296,
  iconSize: 96,
  iconGap: 24,
  headlineFontSize: 38,
  headlineWeight: 600,
  taglineFontSize: 20,
  taglineWeight: 400,
  taglineGap: 20,
  bodyFontSize: 17,
  bodyLineHeight: 25,
  bodyGap: 16,
  debuggerPort: 9455,
  launchTimeoutMilliseconds: 20000,
  pollIntervalMilliseconds: 250
} as const

export const BannerPalette = {
  background: 'rgb(255,255,255)',
  headline: 'rgb(0,0,0)',
  tagline: 'rgb(0,0,0)',
  body: 'rgb(0,0,0)',
  link: 'rgb(0,112,201)'
} as const

export const BannerFontFile = 'assets/fonts/Inter-Variable.ttf'
