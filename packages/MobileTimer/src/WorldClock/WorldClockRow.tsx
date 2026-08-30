import { Show } from 'solid-js'
import { ClockMetrics, ClockPalette } from '../Support/ClockMetrics'
import {
  clockDayLabel,
  clockIsDaylight,
  clockMeridiem,
  clockReading,
  clockTimeText
} from '../Support/ClockTime'
import type { ClockCity } from '../Support/WorldClockStore'
import { ClockFace } from './ClockFace'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

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

export const WorldClockRow = (props: {
  city: ClockCity
  now: Date
  editing: boolean
  onDelete: () => void
}) => {
  const reading = () => clockReading(props.city.zone, props.now)

  return (
    <div
      class="relative flex shrink-0 items-center"
      style={{
        height: `${ClockMetrics.rowHeight}px`,
        padding: `0 ${ClockMetrics.rowInsetRight}px 0 ${ClockMetrics.rowInsetLeft}px`,
        background: ClockPalette.row,
        'border-top': `${ClockMetrics.rowHairline}px solid ${ClockPalette.rowHairline}`,
        'border-bottom': `${ClockMetrics.rowSeparator}px solid ${ClockPalette.rowSeparator}`
      }}
    >
      <Show when={props.editing}>
        <DeleteButton onDelete={props.onDelete} />
      </Show>

      <span
        class="flex-1"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${ClockMetrics.cityFontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: ClockPalette.city
        }}
      >
        {props.city.name}
      </span>

      <ClockFace
        size={ClockMetrics.faceDiameter}
        reading={reading()}
        night={!clockIsDaylight(reading())}
      />

      <div
        class="flex flex-1 flex-col items-end justify-center"
        style={{
          gap: `${ClockMetrics.timeStackGap}px`,
          transform: `translateY(${ClockMetrics.timeStackOffsetY}px)`
        }}
      >
        <div class="flex items-baseline" style={{ gap: `${ClockMetrics.meridiemGap}px` }}>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${ClockMetrics.timeFontSize}px`,
              'font-weight': '700',
              'line-height': '1',
              color: ClockPalette.time
            }}
          >
            {clockTimeText(reading())}
          </span>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${ClockMetrics.meridiemFontSize}px`,
              'font-weight': '700',
              'line-height': '1',
              color: ClockPalette.time
            }}
          >
            {clockMeridiem(reading().hours)}
          </span>
        </div>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${ClockMetrics.dayFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: ClockPalette.day
          }}
        >
          {clockDayLabel(props.city.zone, props.now)}
        </span>
      </div>
    </div>
  )
}
