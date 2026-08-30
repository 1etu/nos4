import { type JSX } from 'solid-js'
import { UITableMetrics, UITablePalette } from './UITableMetrics'

export const UIPinstripeBackground = (props: { children: JSX.Element }) => (
  <div class="h-full w-full" style={{ background: UITablePalette.pinstripe }}>
    {props.children}
  </div>
)

export const UITableGroup = (props: { children: JSX.Element }) => (
  <div style={{ padding: `0 ${UITableMetrics.groupInsetX}px` }}>
    <div
      class="flex flex-col overflow-hidden"
      style={{
        'border-radius': `${UITableMetrics.groupRadius}px`,
        background: 'white',
        border: `${UITableMetrics.groupStroke}px solid ${UITablePalette.groupStroke}`
      }}
    >
      {props.children}
    </div>
  </div>
)

export const UITableRow = (props: { separator?: boolean; children: JSX.Element }) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      height: `${UITableMetrics.rowHeight}px`,
      'border-bottom': props.separator
        ? `${UITableMetrics.groupStroke}px solid ${UITablePalette.groupStroke}`
        : 'none'
    }}
  >
    {props.children}
  </div>
)

export const UITableGroupHeader = (props: { title: string }) => (
  <div
    class="flex items-center"
    style={{ padding: `0 ${UITableMetrics.headerInsetX}px` }}
  >
    <span
      style={{
        'font-family': "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        'font-size': `${UITableMetrics.headerFontSize}px`,
        'font-weight': '700',
        color: UITablePalette.headerText,
        'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
      }}
    >
      {props.title}
    </span>
  </div>
)
