import { createSignal } from 'solid-js'
import { UIBarButton, UINavigationBar } from 'UIKit'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import { clockPad } from '../Support/ClockTime'
import { ClockPicker } from '../Timer/ClockPicker'

const HourValues = Array.from({ length: 12 }, (_, index) => String(index + 1))
const MinuteValues = Array.from({ length: 60 }, (_, index) => clockPad(index))
const MeridiemValues = ['AM', 'PM']
const RepeatValues = ['Never', 'Weekdays', 'Weekends', 'Every Day']

export const AlarmEditor = (props: {
  onCancel: () => void
  onSave: (hours: number, minutes: number, repeat: string) => void
}) => {
  const [hour, setHour] = createSignal(7)
  const [minute, setMinute] = createSignal(0)
  const [meridiem, setMeridiem] = createSignal(0)
  const [repeat, setRepeat] = createSignal(0)

  const hours24 = () => {
    const twelve = hour() + 1
    const wrapped = twelve === 12 ? 0 : twelve
    return meridiem() === 0 ? wrapped : wrapped + 12
  }

  return (
    <div
      class="flex h-full w-full flex-col overflow-hidden"
      style={{ background: ClockPalette.timerBase }}
    >
      <UINavigationBar
        title="Add Alarm"
        leading={<UIBarButton title="Cancel" tone="gray" onClick={props.onCancel} />}
        trailing={
          <UIBarButton
            title="Save"
            tone="blue"
            onClick={() => props.onSave(hours24(), minute(), RepeatValues[repeat()] ?? 'Never')}
          />
        }
      />

      <div style={{ height: `${ClockMetrics.wheelTopInset}px` }} />

      <ClockPicker
        wheels={[
          { values: HourValues, unit: '', selected: hour(), onSelect: setHour },
          { values: MinuteValues, unit: '', selected: minute(), onSelect: setMinute },
          { values: MeridiemValues, unit: '', selected: meridiem(), onSelect: setMeridiem }
        ]}
      />

      <div class="flex-1" />

      <ClockPicker
        wheels={[{ values: RepeatValues, unit: '', selected: repeat(), onSelect: setRepeat }]}
      />
    </div>
  )
}
