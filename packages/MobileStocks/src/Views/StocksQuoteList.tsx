import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { StocksMetrics, StocksPalette } from '../Support/StocksMetrics'
import { deltaLabel, stockQuotes, type StockQuote } from '../Support/StocksService'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const QuoteText = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${StocksMetrics.quoteFontSize}px`,
      'font-weight': '700',
      color: 'white',
      'text-transform': 'uppercase',
      'text-shadow': '0 -0.66px 0.25px rgba(0,0,0,0.8)',
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

const DeltaCapsule = (props: { label: string; gain: boolean }) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      width: `${StocksMetrics.capsuleWidth}px`,
      height: `${StocksMetrics.capsuleHeight}px`,
      'border-radius': `${StocksMetrics.capsuleRadius}px`,
      background: props.gain ? StocksPalette.gainFill : StocksPalette.lossFill,
      border: `${StocksMetrics.capsuleStroke}px solid transparent`,
      'background-clip': 'padding-box',
      'margin-right': `${StocksMetrics.quoteInsetX}px`
    }}
  >
    <span
      class="pointer-events-none absolute inset-0"
      style={{
        'border-radius': `${StocksMetrics.capsuleRadius}px`,
        padding: `${StocksMetrics.capsuleStroke}px`,
        background: props.gain ? StocksPalette.gainStroke : StocksPalette.lossStroke,
        '-webkit-mask': 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude'
      }}
    />
    <Show
      when={props.gain}
      fallback={
        <div
          class="relative shrink-0"
          style={{
            width: `${StocksMetrics.capsuleMinusWidth}px`,
            height: `${StocksMetrics.capsuleMinusHeight}px`,
            background: 'white',
            'margin-left': '8.5px',
            'box-shadow': '0 -0.66px 0.25px rgba(0,0,0,0.75)'
          }}
        />
      }
    >
      <CGImage name="UITintedCircularButtonPlus" class="relative shrink-0" />
    </Show>
    <div class="flex-1" />
    <span class="relative" style={{ 'padding-right': '5px' }}>
      <QuoteText text={props.label} />
    </span>
  </div>
)

export const StocksQuoteList = (props: {
  selected: StockQuote | undefined
  onSelect: (quote: StockQuote) => void
}) => (
  <UIScrollView class="h-full w-full">
    <For each={stockQuotes()}>
      {(entry, at) => (
        <button
          type="button"
          class="relative flex w-full items-center"
          style={{
            height: `${StocksMetrics.quoteRowHeight}px`,
            background: at() % 2 === 0 ? StocksPalette.rowEven : StocksPalette.rowOdd
          }}
          onClick={() => props.onSelect(entry)}
        >
          <div
            class="pointer-events-none absolute inset-0"
            style={{
              background: `repeating-linear-gradient(to right, ${StocksPalette.grid} 0 ${StocksMetrics.gridLineWidth}px, transparent ${StocksMetrics.gridLineWidth}px ${StocksMetrics.gridSpacing}px)`
            }}
          />
          <Show when={props.selected?.symbol === entry.symbol}>
            <div
              class="pointer-events-none absolute inset-0"
              style={{ background: StocksPalette.rowSelected }}
            />
          </Show>

          <div
            class="relative"
            style={{ 'padding-left': `${StocksMetrics.quoteInsetX}px` }}
          >
            <QuoteText text={entry.symbol} />
          </div>
          <div class="flex-1" />
          <div
            class="relative"
            style={{ 'padding-right': `${StocksMetrics.quoteInsetX}px` }}
          >
            <QuoteText text={entry.currentPrice.toFixed(2)} />
          </div>
          <DeltaCapsule label={deltaLabel(entry).replace('-', '')} gain={entry.change >= 0} />
        </button>
      )}
    </For>
  </UIScrollView>
)
