import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { StocksMetrics, StocksPalette } from '../Support/StocksMetrics'
import { suffixNumber, type StockQuote } from '../Support/StocksService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const cellText = {
  'font-family': HelveticaNeue,
  'font-size': `${StocksMetrics.footerCellFontSize}px`,
  'font-weight': '700',
  color: 'white',
  'white-space': 'nowrap'
} as const

const Cell = (props: { label: string; value: string; trailing?: boolean }) => (
  <div class="relative flex-1">
    <span
      class="absolute inset-y-0 flex items-center"
      style={{
        left: `${props.trailing ? 0 : StocksMetrics.footerLabelInset}px`,
        ...cellText
      }}
    >
      {props.label}
    </span>
    <span
      class="absolute inset-y-0 flex items-center"
      style={{ left: `${StocksMetrics.footerValueInset}px`, ...cellText }}
    >
      {props.value}
    </span>
  </div>
)

export const StocksDetailPanel = (props: {
  quote: StockQuote | undefined
  onSettings: () => void
}) => {
  const rows = () => {
    const entry = props.quote
    if (!entry) return []
    return [
      ['Open:', entry.open.toFixed(2), 'Mkt Cap:', suffixNumber(entry.marketCap * 1000000)],
      ['High:', entry.high.toFixed(2), '52w High:', entry.week52High.toFixed(2)],
      ['Low:', entry.low.toFixed(2), '52w Low:', entry.week52Low.toFixed(2)],
      ['Vol:', suffixNumber(entry.volume * 1000000), 'Avg Vol:', suffixNumber(entry.avgVolume * 1000000)],
      ['P/E:', entry.peRatio.toFixed(2), 'Yield:', `${(entry.dividendYield * 100).toFixed(2)}%`]
    ]
  }

  return (
    <div class="relative flex h-full w-full flex-col">
      <div
        class="flex flex-1 flex-col overflow-hidden"
        style={{ background: StocksPalette.footerBody }}
      >
        <div class="flex shrink-0 items-center justify-center">
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${StocksMetrics.footerNameFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'white-space': 'nowrap'
            }}
          >
            {props.quote?.name ?? ''}
          </span>
        </div>

        <For each={rows()}>
          {(row, at) => (
            <>
              <Show when={at() > 0}>
                <div
                  style={{
                    height: `${StocksMetrics.footerRuleHeight}px`,
                    background: StocksPalette.footerRule
                  }}
                />
              </Show>
              <div class="flex flex-1 items-center">
                <Cell label={row[0] ?? ''} value={row[1] ?? ''} />
                <Cell label={row[2] ?? ''} value={row[3] ?? ''} trailing />
              </div>
            </>
          )}
        </For>
      </div>

      <div
        class="flex shrink-0 items-center"
        style={{
          height: `${StocksMetrics.footerBarHeight}px`,
          background: StocksPalette.footerBar
        }}
      >
        <div style={{ 'padding-left': `${StocksMetrics.quoteInsetX}px` }}>
          <CGImage name="ViewStockButton" />
        </div>
        <div class="flex-1" />
        <button
          type="button"
          style={{ 'padding-right': `${StocksMetrics.quoteInsetX}px` }}
          onClick={props.onSettings}
        >
          <CGImage name="InfoButton" />
        </button>
      </div>
    </div>
  )
}
