export const UIScreenMetrics = {
  compactWidth: 820,
  defaultBrightness: 0.85,
  minimumBrightness: 0.08,
  dimCeiling: 0.82,
  autoBrightnessDefault: true,
  sceneHiddenDefault: true
} as const

export const UIScreenDefaultsKey = {
  brightness: 'screenBrightness',
  autoBrightness: 'screenAutoBrightness',
  sceneHidden: 'screenSceneHidden'
} as const
