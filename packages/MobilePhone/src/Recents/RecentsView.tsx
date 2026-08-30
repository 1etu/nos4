import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { phRecentCalls, type PHRecentCall } from '../Support/RecentsStore'

const recentDate = (value: number): string => {
  const date = new Date(value)
  return `${date.getMonth() + 1}/${date.getDate()}/${String(date.getFullYear()).slice(-2)}`
}

const RecentRow = (props: { call: PHRecentCall; onCall: () => void }) => (
  <>
    <button
      type="button"
      class="flex w-full items-center"
      style={{
        height: `${PhoneMetrics.rowHeight - PhoneMetrics.hairline}px`,
        'padding-left': `${PhoneMetrics.rowLeading}px`
      }}
      onClick={() => props.onCall()}
    >
      <div
        class="flex min-w-0 flex-1 flex-col items-start"
        style={{
          gap: `${PhoneMetrics.recentRowSpacing}px`,
          'padding-right': `${PhoneMetrics.rowTextTrailing}px`
        }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${PhoneMetrics.recentNumberFontSize}px`,
            'line-height': `${PhoneMetrics.recentLineHeight}`,
            'font-weight': '700',
            color: 'black',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'max-width': '100%'
          }}
        >
          {props.call.number}
        </span>
        <div class="flex items-center" style={{ gap: `${PhoneMetrics.recentTypeGap}px` }}>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${PhoneMetrics.recentTypeFontSize}px`,
              'line-height': `${PhoneMetrics.recentLineHeight}`,
              color: PhonePalette.recentType,
              'white-space': 'nowrap'
            }}
          >
            {props.call.type}
          </span>
          <CGImage name="outgoingcall" />
        </div>
      </div>

      <span
        class="shrink-0"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhoneMetrics.recentDateFontSize}px`,
          color: PhonePalette.recentDate,
          'white-space': 'nowrap'
        }}
      >
        {recentDate(props.call.date)}
      </span>
      <div class="shrink-0" style={{ 'padding-right': `${PhoneMetrics.chevronTrailing}px` }}>
        <CGImage name="ABTableNextButton" />
      </div>
    </button>
    <div style={{ height: `${PhoneMetrics.hairline}px`, background: PhonePalette.separator }} />
  </>
)

export const RecentsView = (props: {
  segment: number
  onCall: (call: PHRecentCall) => void
}) => (
  <UIScrollView class="min-h-0 flex-1" style={{ background: 'white' }}>
    <Show when={props.segment === 0}>
      <For each={[...phRecentCalls()].reverse()}>
        {(call) => <RecentRow call={call} onCall={() => props.onCall(call)} />}
      </For>
    </Show>
  </UIScrollView>
)
