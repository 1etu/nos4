import { UIBarButton, UINavigationBarPalette, UISegmentedControl } from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'

const Segments = ['List', 'Day', 'Month'] as const

export type CalendarMode = (typeof Segments)[number]

export const CalendarModes: readonly CalendarMode[] = Segments

const InboxGlyph = () => (
  <svg width="17" height="15" viewBox="0 0 17 15" aria-hidden="true">
    <path
      d="M8.5 0.5v6.5M5.4 5.2 8.5 8.4l3.1-3.2"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M1 8.5v4.2h15V8.5"
      fill="none"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const CalendarToolBar = (props: {
  mode: CalendarMode
  onToday: () => void
  onSelectMode: (mode: CalendarMode) => void
  onInbox: () => void
}) => (
  <div
    class="flex shrink-0 items-center justify-between"
    style={{
      height: `${CalendarMetrics.toolBarHeight}px`,
      padding: `0 ${CalendarMetrics.toolBarInsetX}px`,
      gap: `${CalendarMetrics.toolBarGap}px`,
      background: UINavigationBarPalette.default,
      'border-top': `1px solid ${CalendarPalette.headerBorder}`
    }}
  >
    <UIBarButton title="Today" tone="gray" onClick={props.onToday} />

    <UISegmentedControl
      segments={Segments}
      selected={Segments.indexOf(props.mode)}
      width={CalendarMetrics.segmentWidth}
      onSelect={(index) => props.onSelectMode(Segments[index] ?? 'Month')}
    />

    <button
      type="button"
      class="flex items-center justify-center"
      style={{
        height: `${CalendarMetrics.inboxButtonHeight}px`,
        padding: `0 ${CalendarMetrics.inboxButtonPaddingX}px`,
        'border-radius': `${CalendarMetrics.inboxButtonRadius}px`,
        background: UINavigationBarPalette.buttonTone.gray,
        'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
      }}
      onClick={props.onInbox}
    >
      <InboxGlyph />
    </button>
  </div>
)
