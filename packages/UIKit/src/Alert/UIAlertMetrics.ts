export const UIAlertMetrics = {
  insetX: 30,
  maxHeight: 200,
  radius: 12,
  stroke: 2,
  shadowBlur: 6,
  dimOpacity: 0.55,
  enterScale: 0.86,
  glossHeight: 45,
  glossOpacity: 0.3,
  titleFontSize: 18,
  titleTop: 15,
  messageFontSize: 14.5,
  messageTop: 8,
  messageBottom: 5,
  messageInsetX: 10,
  buttonHeight: 40,
  buttonRadius: 6,
  buttonInsetX: 8,
  buttonBottom: 8,
  presentDuration: 0.25
} as const

export const UIAlertPalette = {
  body: 'rgba(11,27,68,0.85)',
  rim: 'linear-gradient(to bottom, rgb(226,227,228) 0%, rgb(178,183,194) 19%)',
  gloss:
    'linear-gradient(to bottom, rgb(255,255,255) 20%, rgb(80,84,89) 100%)',
  button:
    'linear-gradient(to bottom, rgb(214,214,214) 0%, rgb(113,115,119) 49%, rgb(74,75,78) 50%, rgb(102,103,106) 100%)',
  buttonStroke: 'rgb(19,30,58)'
} as const
