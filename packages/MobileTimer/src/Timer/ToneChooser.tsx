import { For } from 'solid-js'
import { UIBarButton, UINavigationBar, UIScrollView, UITableMetrics, UITablePalette } from 'UIKit'
import { TimerTones } from '../Support/TimerEngine'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const CheckWidth = 15
const CheckHeight = 13

const Checkmark = () => (
  <svg width={CheckWidth} height={CheckHeight} viewBox="0 0 15 13" aria-hidden="true">
    <path
      d="M1.5 6.8 5.6 11 13.5 1.8"
      fill="none"
      stroke={UITablePalette.rowValue}
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const ToneChooser = (props: {
  selected: string
  onSelect: (tone: string) => void
  onBack: () => void
}) => (
  <div class="flex h-full w-full flex-col overflow-hidden" style={{ background: 'white' }}>
    <UINavigationBar
      title="When Timer Ends"
      leading={<UIBarButton title="Timer" tone="gray" onClick={props.onBack} />}
    />
    <UIScrollView class="flex-1">
      <For each={TimerTones}>
        {(tone) => (
          <button
            type="button"
            class="flex w-full items-center justify-between"
            style={{
              height: `${UITableMetrics.rowHeight}px`,
              padding: `0 ${UITableMetrics.rowInsetX}px`,
              'border-bottom': `1px solid ${UITablePalette.groupStroke}`,
              background: 'white'
            }}
            onClick={() => props.onSelect(tone)}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${UITableMetrics.rowFontSize}px`,
                'line-height': '1',
                color: 'black'
              }}
            >
              {tone}
            </span>
            {props.selected === tone ? <Checkmark /> : undefined}
          </button>
        )}
      </For>
    </UIScrollView>
  </div>
)
