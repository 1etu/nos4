import { createSignal, For, Show } from 'solid-js'
import { CGImage, CGResizableImage, assetPointSize, assetURL } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { UIBarButton, UIScrollView } from 'UIKit'
import { StocksMetrics, StocksPalette } from '../Support/StocksMetrics'
import {
  addTicker,
  availableTickers,
  setStockMode,
  stockMode,
  stockQuotes,
  type StockMode
} from '../Support/StocksService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Modes: readonly StockMode[] = ['%', 'Price', 'Mkt Cap']

const revealAnimation = caAnimation(
  StocksMetrics.revealDuration,
  CAMediaTimingFunction.linear
)

const PlusButton = (props: { onClick: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${StocksMetrics.plusButtonSize}px`,
      height: `${StocksMetrics.plusButtonSize}px`
    }}
    onClick={props.onClick}
  >
    <CGResizableImage
      name="UINavigationBarBlackTranslucentButton"
      width={StocksMetrics.plusButtonSize}
      height={StocksMetrics.plusButtonSize}
      class="absolute inset-0"
    />
    <CGImage
      name="UIButtonBarPlus"
      class="relative"
      style={{ width: `${StocksMetrics.plusIconWidth}px`, height: 'auto' }}
    />
  </button>
)

const ModeControl = () => (
  <div
    class="flex overflow-hidden"
    style={{
      height: `${StocksMetrics.segmentHeight}px`,
      'border-radius': `${StocksMetrics.segmentRadius}px`,
      'box-shadow': '0 0.8px 0 rgba(255,255,255,0.28)'
    }}
  >
    <For each={Modes}>
      {(entry, at) => {
        const active = () => stockMode() === entry
        const divides = () =>
          at() > 0 && stockMode() !== entry && stockMode() !== Modes[at() - 1]
        return (
          <button
            type="button"
            class="flex flex-1 items-center justify-center"
            style={{
              background: active() ? StocksPalette.segmentActive : StocksPalette.segmentIdle,
              'box-shadow': active() ? 'inset 0 3px 6px rgba(0,0,0,0.4)' : 'none',
              'border-left': divides()
                ? `${StocksMetrics.segmentDividerWidth}px solid ${StocksPalette.segmentDivider}`
                : 'none'
            }}
            onClick={() => setStockMode(entry)}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${StocksMetrics.segmentFontSize}px`,
                'font-weight': '700',
                'line-height': `${StocksMetrics.textLineHeight}`,
                color: active() ? 'white' : StocksPalette.segmentIdleText,
                'text-shadow': active()
                  ? '0 -0.66px 0 rgba(0,0,0,0.4)'
                  : '0 0.99px 0 rgba(255,255,255,0.9)'
              }}
            >
              {entry}
            </span>
          </button>
        )
      }}
    </For>
  </div>
)

export const StocksSettings = (props: { onDone: () => void }) => {
  const [pending, setPending] = createSignal('')
  const tile = assetPointSize('Weather_Settings_BackgroundTile')

  const canRemove = () => stockQuotes().length > 1

  return (
    <div
      class="flex h-full w-full flex-col"
      style={{
        'background-image': `url(${assetURL('Weather_Settings_BackgroundTile')})`,
        'background-repeat': 'repeat',
        'background-size': `${tile.width}px ${tile.height}px`
      }}
    >
      <div
        class="relative flex shrink-0 items-center"
        style={{ height: `${StocksMetrics.settingsTitleBarHeight}px` }}
      >
        <div
          class="absolute inset-0"
          style={{
            background: StocksPalette.barGradient,
            'border-bottom': `1px solid ${StocksPalette.barBorderBottom}`,
            opacity: `${StocksMetrics.settingsBarOpacity}`
          }}
        />
        <div class="relative" style={{ 'margin-left': `${StocksMetrics.settingsRowInset}px` }}>
          <PlusButton
            onClick={() => {
              const next = availableTickers()[0]
              if (!next) return
              addTicker(next)
            }}
          />
        </div>
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${StocksMetrics.settingsTitleFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
            }}
          >
            Stocks
          </span>
        </div>
        <div
          class="relative ml-auto"
          style={{ 'margin-right': `${StocksMetrics.settingsRowInset}px` }}
        >
          <UIBarButton title="Done" tone="blue" onClick={props.onDone} />
        </div>
      </div>

      <div class="shrink-0" style={{ height: `${StocksMetrics.settingsGap}px` }} />

      <UIScrollView
        class="flex-1"
        style={{
          'margin-left': `${StocksMetrics.settingsInsetX}px`,
          'margin-right': `${StocksMetrics.settingsInsetX}px`,
          'border-radius': `${StocksMetrics.panelRadius}px`,
          background: 'white'
        }}
      >
        <For each={stockQuotes()}>
          {(entry) => (
            <>
              <div
                class="flex items-center"
                style={{
                  height: `${StocksMetrics.settingsRowHeight - StocksMetrics.hairline}px`,
                  'padding-left': `${StocksMetrics.settingsRowInset}px`
                }}
              >
                <div
                  class="shrink-0"
                  style={{ width: `${StocksMetrics.settingsRowLeadSpacer}px` }}
                />

                <Show when={canRemove()}>
                  <button
                    type="button"
                    class="relative flex shrink-0 items-center justify-center"
                    style={{
                      'margin-left': `${StocksMetrics.settingsRowSpacing}px`,
                      transform: `translateX(${-StocksMetrics.minusOffsetX}px)`
                    }}
                    onClick={() => setPending(pending() === entry.symbol ? '' : entry.symbol)}
                  >
                    <CGImage name="UIRemoveControlMinus" />
                    <span
                      class="absolute"
                      style={{
                        color: 'white',
                        'font-size': `${StocksMetrics.minusGlyphFontSize}px`,
                        'font-weight': '900',
                        'line-height': '1',
                        transform: `translateY(${pending() === entry.symbol ? -1.3 : -2}px) rotate(${pending() === entry.symbol ? -90 : 0}deg)`,
                        transition: caTransition(['transform'], revealAnimation)
                      }}
                    >
                      &#8212;
                    </span>
                  </button>
                </Show>

                <div
                  class="flex min-w-0 flex-col items-start"
                  style={{
                    'margin-left': `${StocksMetrics.settingsRowSpacing}px`,
                    gap: `${StocksMetrics.settingsNameSpacing}px`
                  }}
                >
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${StocksMetrics.settingsSymbolFontSize}px`,
                      'font-weight': '700',
                      'line-height': `${StocksMetrics.textLineHeight}`,
                      color: 'black',
                      'white-space': 'nowrap'
                    }}
                  >
                    {entry.symbol}
                  </span>
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${StocksMetrics.settingsNameFontSize}px`,
                      'font-weight': '700',
                      'line-height': `${StocksMetrics.textLineHeight}`,
                      color: StocksPalette.rowName,
                      'white-space': 'nowrap',
                      overflow: 'hidden',
                      'text-overflow': 'ellipsis',
                      'max-width': '100%'
                    }}
                  >
                    {entry.name}
                  </span>
                </div>

                <div class="relative ml-auto flex shrink-0 items-center">
                  <CGImage
                    name="UITableGrabber"
                    style={{
                      'margin-right': `${StocksMetrics.settingsInsetX}px`,
                      opacity: `${pending() === entry.symbol ? 0 : 1}`,
                      transition: caTransition(['opacity'], revealAnimation)
                    }}
                  />
                  <div
                    class="absolute right-0"
                    style={{
                      'margin-right': `${StocksMetrics.settingsInsetX}px`,
                      opacity: `${pending() === entry.symbol ? 1 : 0}`,
                      'pointer-events': pending() === entry.symbol ? 'auto' : 'none',
                      transform: `translateX(${pending() === entry.symbol ? 0 : 100}%)`,
                      transition: caTransition(['opacity', 'transform'], revealAnimation)
                    }}
                  >
                    <UIBarButton title="Delete" tone="red" onClick={() => undefined} />
                  </div>
                </div>
              </div>
              <div
                style={{
                  height: `${StocksMetrics.hairline}px`,
                  background: StocksPalette.rowSeparator
                }}
              />
            </>
          )}
        </For>
      </UIScrollView>

      <div class="shrink-0" style={{ height: `${StocksMetrics.settingsGap}px` }} />

      <div
        class="shrink-0"
        style={{
          'margin-left': `${StocksMetrics.settingsInsetX}px`,
          'margin-right': `${StocksMetrics.settingsInsetX}px`
        }}
      >
        <ModeControl />
      </div>

      <div class="shrink-0" style={{ height: `${StocksMetrics.settingsGap}px` }} />

      <div class="flex shrink-0 justify-center">
        <CGImage name="YahooFinance" />
      </div>

      <div class="shrink-0" style={{ height: `${StocksMetrics.settingsGap}px` }} />
    </div>
  )
}
