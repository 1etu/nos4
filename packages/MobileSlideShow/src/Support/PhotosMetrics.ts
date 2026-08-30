export const PhotosMetrics = {
  titleBarHeight: 60,
  barOpacity: 0.65,
  toolBarHeight: 44,
  toolBarButtonHeight: 32,
  toolBarButtonRadius: 5.5,
  toolBarButtonPaddingX: 12,
  toolBarButtonIconWidth: 22,
  titleFontSize: 22,
  contentInsetTop: 84,
  gridColumns: 4,
  gridSpacing: 5,
  gridPadding: 8,
  gridMinimumCell: 60,
  videoOverlayDivisor: 5,
  videoDurationFontSize: 11,
  bottomInfoFontSize: 20,
  bottomInfoPaddingBottom: 12,
  albumRowThumbSize: 59.05,
  albumRowTitleFontSize: 16,
  albumRowTitleLeading: 6,
  albumRowTitleTrailing: 40,
  albumRowChevronTrailing: 12,
  separatorHeight: 0.95,
  backButtonHeight: 33,
  backButtonAlbumsWidth: 70,
  backButtonCameraRollWidth: 95,
  backButtonFontSize: 13,
  backButtonLabelLeading: 5,
  backButtonLabelOffsetY: -1.1,
  backButtonLeading: 8,
  actionButtonTrailing: 8,
  tabBarHeight: 57,
  tabButtonHeight: 55,
  tabHighlightHeight: 51,
  tabHighlightRadius: 3,
  tabHighlightInset: 5,
  tabIconSize: 30,
  tabIconSelectedSize: 30.5,
  tabLabelFontSize: 11,
  tabStackSpacing: 2
} as const

export const PhotosPalette = {
  barGradient:
    'linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(84,84,84) 0.5%, rgb(59,59,59) 4%, rgb(29,29,29) 50%, rgb(7,7,7) 51%, rgb(7,7,7) 100%)',
  barBorderBottom: 'rgb(45,48,51)',
  contentGradient:
    'linear-gradient(to bottom, rgb(227,231,236) 0%, rgb(227,231,236) 50%, rgb(255,255,255) 50%, rgb(255,255,255) 100%)',
  separator: 'rgb(224,224,224)',
  albumCount: 'rgb(127,127,127)',
  bottomInfo: 'rgb(142,142,147)',
  tabIconSelected:
    'linear-gradient(to bottom, rgb(197,210,229) 0%, rgb(99,162,216) 47%, rgb(0,145,230) 49%, rgb(21,197,252) 100%)',
  tabIconIdle: 'linear-gradient(to bottom, rgb(157,157,157), rgb(89,89,89))',
  tabLabelIdle: 'rgb(168,168,168)',
  blackButtonGradient:
    'linear-gradient(to bottom, rgb(95,95,95) 0%, rgb(32,32,32) 51%, rgb(7,7,7) 51%, rgb(7,7,7) 100%)'
} as const
