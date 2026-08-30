import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'

export const CalendarArrow = (props: { back: boolean }) => (
  <svg
    width={CalendarMetrics.arrowWidth}
    height={CalendarMetrics.arrowHeight}
    viewBox="0 0 14 17"
    aria-hidden="true"
  >
    <polygon
      points={props.back ? '13,0 13,17 0,8.5' : '1,0 1,17 14,8.5'}
      fill={CalendarPalette.arrow}
    />
  </svg>
)
