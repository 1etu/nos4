import { createEffect, createSignal } from 'solid-js'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { StocksDetailPanel } from '../Views/StocksDetailPanel'
import { StocksQuoteList } from '../Views/StocksQuoteList'
import { StocksSettings } from '../Views/StocksSettings'
import { StocksMetrics } from '../Support/StocksMetrics'
import { stockQuotes, type StockQuote } from '../Support/StocksService'

const flipIn = caAnimation(StocksMetrics.flipDuration, CAMediaTimingFunction.easeIn)
const flipOut = caAnimation(StocksMetrics.flipDuration, CAMediaTimingFunction.easeOut)

export const StocksApp = (props: { height: number }) => {
  const [selected, setSelected] = createSignal<StockQuote | undefined>()
  const [showSettings, setShowSettings] = createSignal(false)
  const [switchToSettings, setSwitchToSettings] = createSignal(false)

  createEffect(() => {
    const current = selected()
    const quotes = stockQuotes()
    if (current && quotes.some((entry) => entry.symbol === current.symbol)) return
    setSelected(quotes[0])
  })

  const content = () =>
    props.height - StocksMetrics.topSpacing * 2 - StocksMetrics.panelGap

  const toSettings = () => {
    setSwitchToSettings(true)
    caAfter(StocksMetrics.flipHandoff, () => setShowSettings(true))
  }

  const toQuotes = () => {
    setShowSettings(false)
    caAfter(StocksMetrics.flipHandoff, () => setSwitchToSettings(false))
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden" style={{ background: 'black' }}>
      <UIStatusBar />

      <div class="relative flex-1 overflow-hidden" style={{ perspective: '900px' }}>
        <div
          class="absolute inset-0"
          style={{
            'transform-origin': 'left center',
            transform: `rotateY(${showSettings() ? 0 : 90}deg) translateX(${showSettings() ? 0 : 50}%)`,
            opacity: `${showSettings() ? 1 : 0}`,
            transition: caTransition(['transform', 'opacity'], flipOut)
          }}
        >
          <StocksSettings onDone={toQuotes} />
        </div>

        <div
          class="absolute inset-0 flex flex-col"
          style={{
            'transform-origin': 'right center',
            transform: `rotateY(${switchToSettings() ? -90 : 0}deg) translateX(${switchToSettings() ? -50 : 0}%)`,
            opacity: `${switchToSettings() ? 0 : 1}`,
            padding: `${StocksMetrics.topSpacing}px ${StocksMetrics.outerInsetX}px`,
            transition: caTransition(['transform', 'opacity'], flipIn)
          }}
        >
          <div
            class="overflow-hidden"
            style={{
              height: `${(content() * 2) / 3}px`,
              'border-radius': `${StocksMetrics.panelRadius}px`
            }}
          >
            <StocksQuoteList selected={selected()} onSelect={setSelected} />
          </div>

          <div style={{ height: `${StocksMetrics.panelGap}px`, 'flex-shrink': '0' }} />

          <div
            class="overflow-hidden"
            style={{
              height: `${content() / 3}px`,
              'border-radius': `${StocksMetrics.panelRadius}px`
            }}
          >
            <StocksDetailPanel quote={selected()} onSettings={toSettings} />
          </div>
        </div>
      </div>
    </div>
  )
}
