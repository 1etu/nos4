export const UISwitchMetrics = {
  width: 115,
  height: 33,
  knobSize: 31,
  knobInset: 1,
  radius: 16.5,
  labelFontSize: 14,
  labelInset: 9,
  travel: 82
} as const

const rgb = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`

export const UISwitchPalette = {
  track: rgb(224, 224, 224),
  trackStroke: rgb(148, 148, 148),
  onFill:
    'linear-gradient(to bottom, rgb(46,110,183) 0%, rgb(60,152,222) 12%, rgb(102,190,243) 50%, rgb(70,163,231) 52%, rgb(120,205,247) 100%)',
  orangeFill:
    'linear-gradient(to bottom, rgb(255,140,14) 0%, rgb(255,140,15) 50%, rgb(253,168,61) 53%, rgb(253,177,72) 100%)',
  offFill:
    'linear-gradient(to bottom, rgb(226,226,226) 0%, rgb(246,246,246) 14%, rgb(255,255,255) 55%, rgb(250,250,250) 100%)',
  onLabel: rgb(255, 255, 255),
  offLabel: rgb(150, 150, 150),
  knob:
    'linear-gradient(to bottom, rgb(255,255,255) 0%, rgb(247,247,247) 48%, rgb(226,226,226) 52%, rgb(240,240,240) 100%)',
  knobStroke: rgb(140, 140, 140),
  wellShadow: 'inset 0 1.5px 2.5px rgba(0,0,0,0.35)',
  knobShadow: '0 1px 2px rgba(0,0,0,0.35)'
} as const
