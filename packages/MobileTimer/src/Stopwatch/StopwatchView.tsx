import { createEffect, createSignal, For, onCleanup } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import { stopwatchText } from '../Support/ClockTime'
import {
  stopwatchElapsed,
  stopwatchLap,
  stopwatchLapElapsed,
  stopwatchLaps,
  stopwatchReset,
  stopwatchRunning,
  stopwatchStart,
  stopwatchStop
} from '../Support/StopwatchEngine'
import { ClockButton } from '../Controls/ClockButton'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const StopwatchView = () => {
  const [total, setTotal] = createSignal(stopwatchElapsed())
  const [lap, setLap] = createSignal(stopwatchLapElapsed())

  const sample = () => {
    setTotal(stopwatchElapsed())
    setLap(stopwatchLapElapsed())
  }

  createEffect(() => {
    sample()
    if (!stopwatchRunning()) return
    let frame = requestAnimationFrame(function step() {
      sample()
      frame = requestAnimationFrame(step)
    })
    onCleanup(() => cancelAnimationFrame(frame))
  })

  return (
    <div class="flex h-full w-full flex-col overflow-hidden">
      <div
        class="relative shrink-0"
        style={{ height: `${ClockMetrics.panelHeight}px`, background: ClockPalette.panelBody }}
      >
        <div
          class="absolute inset-x-0 top-0"
          style={{
            height: `${ClockMetrics.panelHeaderHeight}px`,
            background: ClockPalette.panelHeader
          }}
        />

        <span
          class="absolute -translate-y-1/2"
          style={{
            top: `${ClockMetrics.lapReadoutCentreY}px`,
            right: `${ClockMetrics.lapReadoutInsetRight}px`,
            'font-family': HelveticaNeue,
            'font-size': `${ClockMetrics.lapReadoutFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: ClockPalette.lapReadout
          }}
        >
          {stopwatchText(lap())}
        </span>

        <span
          class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${ClockMetrics.mainReadoutCentreY}px`,
            'font-family': HelveticaNeue,
            'font-size': `${ClockMetrics.mainReadoutFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            'white-space': 'pre',
            color: ClockPalette.mainReadout
          }}
        >
          {stopwatchText(total())}
        </span>

        <div
          class="absolute flex"
          style={{
            top: `${ClockMetrics.buttonTop}px`,
            left: `${ClockMetrics.buttonInsetX}px`,
            right: `${ClockMetrics.buttonInsetX}px`,
            gap: `${ClockMetrics.buttonGap}px`
          }}
        >
          <ClockButton
            title={stopwatchRunning() ? 'Stop' : 'Start'}
            tone={stopwatchRunning() ? 'stop' : 'start'}
            height={ClockMetrics.buttonHeight}
            fontSize={ClockMetrics.buttonFontSize}
            onPress={stopwatchRunning() ? stopwatchStop : stopwatchStart}
          />
          <ClockButton
            title={stopwatchRunning() ? 'Lap' : 'Reset'}
            tone="neutral"
            disabled={!stopwatchRunning() && total() === 0}
            height={ClockMetrics.buttonHeight}
            fontSize={ClockMetrics.buttonFontSize}
            onPress={stopwatchRunning() ? stopwatchLap : stopwatchReset}
          />
        </div>
      </div>

      <UIScrollView class="flex-1" style={{ background: ClockPalette.panelBody }}>
        <For each={stopwatchLaps()}>
          {(value, index) => (
            <div
              class="relative flex shrink-0 items-center"
              style={{
                height: `${ClockMetrics.lapRowHeight}px`,
                background: ClockPalette.lapRow,
                'border-bottom': `1px solid ${ClockPalette.lapSeparator}`
              }}
            >
              <span
                style={{
                  'margin-left': `${ClockMetrics.lapLabelInsetX}px`,
                  'font-family': HelveticaNeue,
                  'font-size': `${ClockMetrics.lapLabelFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  color: ClockPalette.lapLabel
                }}
              >
                {`lap ${stopwatchLaps().length - index()}`}
              </span>
              <span
                class="flex-1 text-right"
                style={{
                  'margin-right': `${ClockMetrics.lapTimeInsetRight}px`,
                  'font-family': HelveticaNeue,
                  'font-size': `${ClockMetrics.lapTimeFontSize}px`,
                  'font-weight': '700',
                  'line-height': '1',
                  color: ClockPalette.lapTime
                }}
              >
                {stopwatchText(value)}
              </span>
            </div>
          )}
        </For>
      </UIScrollView>
    </div>
  )
}
