import { Show } from 'solid-js'
import { UISwitch } from 'UIKit'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import { clockHour12, clockMeridiem, clockPad } from '../Support/ClockTime'
import type { ClockAlarm } from '../Support/AlarmStore'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const detailStyle = {
  'font-family': HelveticaNeue,
  'font-size': `${ClockMetrics.alarmDetailFontSize}px`,
  'line-height': '1',
  color: ClockPalette.day
} as const

const DeleteButton = (props: { onDelete: () => void }) => (
  <button
    type="button"
    class="flex shrink-0 items-center justify-center"
    style={{
      width: `${ClockMetrics.deleteButtonSize}px`,
      height: `${ClockMetrics.deleteButtonSize}px`,
      'margin-right': `${ClockMetrics.deleteButtonInset}px`,
      'border-radius': '50%',
      background: ClockPalette.deleteButton,
      'box-shadow': '0 1px 0 rgba(255,255,255,0.5)'
    }}
    onClick={props.onDelete}
  >
    <div
      style={{
        width: `${ClockMetrics.deleteGlyphWidth}px`,
        height: `${ClockMetrics.deleteGlyphHeight}px`,
        background: 'white'
      }}
    />
  </button>
)

export const AlarmRow = (props: {
  alarm: ClockAlarm
  editing: boolean
  onToggle: (on: boolean) => void
  onDelete: () => void
}) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      height: `${ClockMetrics.alarmRowHeight}px`,
      padding: `0 ${ClockMetrics.alarmInsetX}px`,
      background: ClockPalette.row,
      'border-top': `${ClockMetrics.rowHairline}px solid ${ClockPalette.rowHairline}`,
      'border-bottom': `${ClockMetrics.rowSeparator}px solid ${ClockPalette.rowSeparator}`
    }}
  >
    <Show when={props.editing}>
      <DeleteButton onDelete={props.onDelete} />
    </Show>

    <div class="flex flex-1 flex-col" style={{ gap: `${ClockMetrics.alarmDetailGap}px` }}>
      <div class="flex items-baseline" style={{ gap: `${ClockMetrics.alarmMeridiemGap}px` }}>
        <span style={{ ...detailStyle, 'font-size': `${ClockMetrics.alarmMeridiemFontSize}px` }}>
          {clockMeridiem(props.alarm.hours)}
        </span>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${ClockMetrics.alarmTimeFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: ClockPalette.time
          }}
        >
          {`${clockHour12(props.alarm.hours)}:${clockPad(props.alarm.minutes)}`}
        </span>
      </div>
      <span style={detailStyle}>{props.alarm.repeat}</span>
      <span style={detailStyle}>{props.alarm.label}</span>
    </div>

    <UISwitch on={props.alarm.enabled} onChange={props.onToggle} />
  </div>
)
