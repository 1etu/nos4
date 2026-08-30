export const UITabBarMetrics = {
  height: 57,
  rowHeight: 55,
  iconSize: 30,
  iconGap: 2,
  labelFontSize: 11,
  labelPaddingBottom: 2,
  selectionInset: 5,
  selectionHeight: 51,
  selectionRadius: 3
} as const

const rgb = (r: number, g: number, b: number): string => `rgb(${r},${g},${b})`

export const UITabBarPalette = {
  chrome:
    'linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(84,84,84) 2%, rgb(59,59,59) 4%, rgb(29,29,29) 50%, rgb(8,8,8) 51%, rgb(8,8,8) 100%)',
  selection: 'rgba(255,255,255,0.1)',
  labelIdle: rgb(168, 168, 168),
  labelSelected: rgb(255, 255, 255),
  iconIdle: 'linear-gradient(to bottom, rgb(157,157,157), rgb(89,89,89))',
  iconSelected:
    'linear-gradient(to bottom, rgb(197,210,229) 0%, rgb(99,162,216) 47%, rgb(0,145,230) 49%, rgb(21,197,252) 100%)',
  iconRim: 'linear-gradient(to bottom, rgb(205,233,249), rgb(75,220,251))'
} as const
