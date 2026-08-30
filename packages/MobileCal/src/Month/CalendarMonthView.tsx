import { CalendarMonthGrid } from './CalendarMonthGrid'
import { CalendarMonthHeader } from './CalendarMonthHeader'
import { CalendarEventList } from '../Events/CalendarEventList'
import type { CalendarEvent } from '../Support/CalendarStore'

export const CalendarMonthView = (props: {
  month: Date
  selected: Date
  today: Date
  events: readonly CalendarEvent[]
  onSelect: (date: Date) => void
  onShiftMonth: (delta: number) => void
  onOpen: (event: CalendarEvent) => void
}) => (
  <div class="flex min-h-0 flex-1 flex-col">
    <CalendarMonthHeader
      month={props.month}
      onPrevious={() => props.onShiftMonth(-1)}
      onNext={() => props.onShiftMonth(1)}
    />
    <CalendarMonthGrid
      month={props.month}
      selected={props.selected}
      today={props.today}
      onSelect={props.onSelect}
    />
    <CalendarEventList events={props.events} onOpen={props.onOpen} />
  </div>
)
