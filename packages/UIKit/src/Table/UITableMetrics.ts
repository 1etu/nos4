export const UITableMetrics = {
  rowHeight: 50,
  groupInsetX: 12,
  groupRadius: 10,
  groupStroke: 1.25,
  rowInsetX: 12,
  rowFontSize: 18,
  headerInsetX: 24,
  headerFontSize: 17,
  sectionSpacing: 10,
  topSpacing: 15
} as const

export const UITablePalette = {
  pinstripe:
    'repeating-linear-gradient(to right, rgb(203,210,216) 0 1.5px, rgb(197,204,212) 1.5px 10.5px, rgb(203,210,216) 10.5px 12px)',
  groupStroke: 'rgb(171,171,171)',
  headerText: 'rgb(76,86,108)',
  rowValue: 'rgb(62,83,131)',
  rowDetail: 'rgb(143,143,143)'
} as const

export const uiInnerShadowTop = (color: string, height: number): string =>
  `linear-gradient(to bottom, ${color} 0%, transparent 100%) top / 100% ${height}px no-repeat`
