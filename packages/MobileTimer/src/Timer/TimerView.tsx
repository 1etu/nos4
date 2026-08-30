import { createEffect, createSignal, onCleanup, Show } from 'solid-js'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import { clockPad, countdownText } from '../Support/ClockTime'
import {
  setTimerHours,
  setTimerMinutes,
  setTimerTone,
  timerCancel,
  timerHours,
  timerMinutes,
  timerRemaining,
  timerRunning,
  timerStart,
  timerTone
} from '../Support/TimerEngine'
import { ClockButton } from '../Controls/ClockButton'
import { ClockPicker } from './ClockPicker'
import { ToneChooser } from './ToneChooser'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const CountdownInterval = 200
const HourValues = Array.from({ length: 24 }, (_, index) => String(index))
const MinuteValues = Array.from({ length: 60 }, (_, index) => clockPad(index))

const Chevron = () => (
  <svg
    width={ClockMetrics.chevronWidth}
    height={ClockMetrics.chevronHeight}
    viewBox="0 0 8 13"
    aria-hidden="true"
  >
    <path
      d="M1.4 1.4 6.4 6.5l-5 5.1"
      fill="none"
      stroke={ClockPalette.chevron}
      stroke-width={ClockMetrics.chevronStroke}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const TimerView = () => {
  const [choosingTone, setChoosingTone] = createSignal(false)
  const [remaining, setRemaining] = createSignal(timerRemaining())

  createEffect(() => {
    if (!timerRunning()) return
    setRemaining(timerRemaining())
    const ticker = setInterval(() => {
      const left = timerRemaining()
      setRemaining(left)
      if (left === 0) timerCancel()
    }, CountdownInterval)
    onCleanup(() => clearInterval(ticker))
  })

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        background: `${ClockPalette.timerBackdrop} top / 100% ${ClockMetrics.timerBackdropHeight}px no-repeat, ${ClockPalette.timerBase}`
      }}
    >
      <div class="shrink-0" style={{ height: `${ClockMetrics.wheelTopInset}px` }} />

      <Show
        when={!timerRunning()}
        fallback={
          <div
            class="flex shrink-0 items-center justify-center"
            style={{ height: `${ClockMetrics.wheelHeight}px` }}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${ClockMetrics.countdownFontSize}px`,
                'font-weight': '300',
                'line-height': '1',
                color: ClockPalette.mainReadout
              }}
            >
              {countdownText(remaining())}
            </span>
          </div>
        }
      >
        <ClockPicker
          wheels={[
            {
              values: HourValues,
              unit: 'hours',
              selected: timerHours(),
              onSelect: setTimerHours
            },
            {
              values: MinuteValues,
              unit: 'mins',
              selected: timerMinutes(),
              onSelect: setTimerMinutes
            }
          ]}
        />
      </Show>

      <div style={{ 'flex-grow': ClockMetrics.timerGapWeightTop, 'flex-basis': '0' }} />

      <button
        type="button"
        class="flex shrink-0 items-center justify-between"
        style={{
          height: `${ClockMetrics.timerRowHeight}px`,
          margin: `0 ${ClockMetrics.timerRowInsetX}px`,
          padding: `0 ${ClockMetrics.timerRowInsetX}px`,
          'border-radius': `${ClockMetrics.timerRowRadius}px`,
          background: ClockPalette.timerRow
        }}
        onClick={() => setChoosingTone(true)}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${ClockMetrics.timerRowFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: ClockPalette.timerRowLabel
          }}
        >
          When Timer Ends
        </span>
        <span class="flex items-center" style={{ gap: `${ClockMetrics.timerValueGap}px` }}>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${ClockMetrics.timerRowFontSize}px`,
              'font-weight': '700',
              'line-height': '1',
              color: ClockPalette.timerRowValue
            }}
          >
            {timerTone()}
          </span>
          <Chevron />
        </span>
      </button>

      <div style={{ 'flex-grow': ClockMetrics.timerGapWeightMiddle, 'flex-basis': '0' }} />

      <div class="flex shrink-0" style={{ margin: `0 ${ClockMetrics.timerStartInsetX}px` }}>
        <ClockButton
          title={timerRunning() ? 'Cancel' : 'Start'}
          tone={timerRunning() ? 'stop' : 'start'}
          height={ClockMetrics.timerStartHeight}
          fontSize={ClockMetrics.timerStartFontSize}
          onPress={timerRunning() ? timerCancel : timerStart}
        />
      </div>

      <div style={{ 'flex-grow': ClockMetrics.timerGapWeightBottom, 'flex-basis': '0' }} />

      <Show when={choosingTone()}>
        <div class="absolute inset-0">
          <ToneChooser
            selected={timerTone()}
            onSelect={(tone) => {
              setTimerTone(tone)
              setChoosingTone(false)
            }}
            onBack={() => setChoosingTone(false)}
          />
        </div>
      </Show>
    </div>
  )
}
