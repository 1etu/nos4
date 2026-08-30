export const UISliderMetrics = {
  trackHeight: 8.5,
  trackRadius: 4.25,
  trackStroke: 0.25,
  knobSize: 21,
  knobStroke: 0.25,
  capGap: 6,
  rowHeight: 21
} as const

export const UISliderPalette = {
  fill: 'linear-gradient(180deg, rgb(47,100,183) 0%, rgb(119,173,246) 100%)',
  fillInnerShadow: 'inset 0 1px 1.4px rgba(17,63,139,0.67)',
  empty: 'linear-gradient(180deg, rgb(180,180,180) 0%, rgb(250,250,250) 55%)',
  emptyInnerShadow: 'inset 0 1px 1.4px rgba(0,0,0,0.28)',
  trackStroke: 'rgb(128,128,128)',
  knob: 'linear-gradient(180deg, rgb(166,166,166) 0%, rgb(252,252,252) 100%)',
  knobStroke: 'rgb(128,128,128)',
  knobShadow: '0 1px 1px rgba(0,0,0,0.56)'
} as const
