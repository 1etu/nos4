import { For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import {
  UIBarButton,
  UINavigationBar,
  UIPinstripeBackground,
  UIScrollView,
  UITableGroup,
  UITableGroupHeader,
  UITableMetrics,
  UITableRow
} from 'UIKit'
import { CalendarMetrics, CalendarPalette } from '../Support/CalendarMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const RowTitle = (props: { text: string; centered?: boolean }) => (
  <span
    class={props.centered ? 'flex-1 text-center' : ''}
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${UITableMetrics.rowFontSize}px`,
      'font-weight': '700',
      color: 'black'
    }}
  >
    {props.text}
  </span>
)

const OtherCalendars = ['Birthdays'] as const

export const CalendarsView = (props: { onDone: () => void }) => (
  <div class="h-full w-full overflow-hidden">
    <UIPinstripeBackground>
      <div class="flex h-full w-full flex-col">
        <UINavigationBar
          title="Calendars"
          trailing={<UIBarButton title="Done" tone="blue" onClick={props.onDone} />}
        />

        <UIScrollView class="min-h-0 flex-1">
          <div style={{ height: `${UITableMetrics.topSpacing}px` }} />

          <UITableGroup>
            <UITableRow>
              <RowTitle text="Hide All Calendars" centered />
            </UITableRow>
          </UITableGroup>

          <div style={{ height: `${UITableMetrics.sectionSpacing}px` }} />
          <UITableGroupHeader title="On My iPhone" />

          <UITableGroup>
            <UITableRow>
              <div
                class="shrink-0"
                style={{
                  width: `${CalendarMetrics.swatchSize}px`,
                  height: `${CalendarMetrics.swatchSize}px`,
                  'margin-left': `${UITableMetrics.rowInsetX}px`,
                  'border-radius': '9999px',
                  background: CalendarPalette.swatchFill,
                  border: `0.75px solid ${CalendarPalette.swatchStroke}`
                }}
              />
              <div style={{ width: `${CalendarMetrics.swatchGap}px` }} />
              <RowTitle text="Calendar" />
              <div class="flex-1" />
              <div style={{ 'padding-right': `${UITableMetrics.rowInsetX}px` }}>
                <CGImage name="UIPreferencesBlueCheck" />
              </div>
            </UITableRow>
          </UITableGroup>

          <div style={{ height: `${UITableMetrics.sectionSpacing}px` }} />
          <UITableGroupHeader title="Other" />

          <UITableGroup>
            <For each={OtherCalendars}>
              {(title) => (
                <UITableRow>
                  <div style={{ 'padding-left': `${UITableMetrics.rowInsetX}px` }}>
                    <CGImage name="birthday" />
                  </div>
                  <div style={{ width: `${CalendarMetrics.swatchGap}px` }} />
                  <RowTitle text={title} />
                  <div class="flex-1" />
                  <div style={{ 'padding-right': `${UITableMetrics.rowInsetX}px` }}>
                    <CGImage name="UIPreferencesBlueCheck" />
                  </div>
                </UITableRow>
              )}
            </For>
          </UITableGroup>
        </UIScrollView>
      </div>
    </UIPinstripeBackground>
  </div>
)
