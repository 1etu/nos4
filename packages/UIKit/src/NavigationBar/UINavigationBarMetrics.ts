export const UINavigationBarMetrics = {
  height: 60,
  titleFontSize: 22,
  titleMaxWidth: 200,
  itemInset: 5,
  buttonHeight: 32,
  buttonRadius: 5.5,
  buttonPaddingX: 11,
  buttonFontSize: 13.25
} as const

export const UINavigationBarPalette = {
  default:
    'linear-gradient(to bottom, rgb(180,191,205) 0%, rgb(136,155,179) 49%, rgb(128,149,175) 49%, rgb(110,133,162) 100%)',
  black:
    'linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(84,84,84) 2%, rgb(59,59,59) 4%, rgb(29,29,29) 50%, rgb(8,8,8) 51%, rgb(8,8,8) 100%)',
  edge: 'rgb(45,48,51)',
  buttonTone: {
    gray: 'linear-gradient(to bottom, rgb(164,175,191) 0%, rgb(124,141,164) 51%, rgb(113,131,156) 51%, rgb(112,130,155) 100%)',
    blueGray:
      'linear-gradient(to bottom, rgb(142,166,196) 0%, rgb(88,119,166) 50%, rgb(71,105,153) 53.3%, rgb(74,108,155) 100%)',
    blue: 'linear-gradient(to bottom, rgb(137,173,238) 0%, rgb(80,140,231) 51%, rgb(43,120,228) 52%, rgb(46,123,229) 100%)',
    red: 'linear-gradient(to bottom, rgb(239,135,142) 0%, rgb(199,52,63) 48%, rgb(189,20,33) 49%, rgb(189,20,33) 100%)'
  }
} as const
