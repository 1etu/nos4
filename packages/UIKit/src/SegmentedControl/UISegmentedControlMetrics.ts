export const UISegmentedControlMetrics = {
  height: 30,
  dualWidth: 220,
  cornerRadius: 6,
  fontSize: 13,
  dividerWidth: 1,
  edgeWidth: 2,
  edgeFadeTop: 4.5,
  edgeFadeBottom: 1.5
} as const

export const UISegmentedControlPalette = {
  unselected:
    'linear-gradient(to bottom, rgb(158,173,191) 0%, rgb(137,155,178) 51%, rgb(127,148,176) 51%, rgb(126,148,178) 100%)',
  selected:
    'linear-gradient(to bottom, rgb(136,160,190) 0%, rgb(88,119,162) 51%, rgb(71,105,153) 51%, rgb(74,108,154) 100%)',
  divider:
    'linear-gradient(to bottom, rgb(73,85,98) 0%, rgb(92,118,156) 4%, rgb(58,90,136) 51%, rgb(51,84,131) 51%, rgb(37,72,120) 100%)',
  grayUnselected:
    'linear-gradient(to bottom, rgb(213,220,224) 0%, rgb(192,201,207) 53%, rgb(178,188,196) 100%)',
  graySelected: 'linear-gradient(to bottom, rgb(140,154,175) 0%, rgb(101,120,146) 100%)',
  grayDivider: 'rgb(109,126,145)',
  grayLabel: 'rgb(74,102,139)',
  grayLabelShadow: '0 0.66px 0 rgba(255,255,255,0.47)',
  graySelectedLabelShadow: '0 -0.66px 0 rgba(44,45,46,0.47)'
} as const
