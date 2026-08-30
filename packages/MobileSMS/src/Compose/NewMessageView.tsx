import { Show } from 'solid-js'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const NewMessageView = (props: {
  recipient: string
  focused: boolean
  onFocus: () => void
}) => (
  <div class="flex min-h-0 flex-1 flex-col" style={{ background: MessagesPalette.thread }}>
    <button
      type="button"
      class="flex w-full shrink-0 items-center"
      style={{
        height: `${MessagesMetrics.recipientRowHeight}px`,
        padding: `0 ${MessagesMetrics.recipientInsetX}px`,
        gap: `${MessagesMetrics.composeGap}px`,
        background: MessagesPalette.list,
        'border-bottom': `1px solid ${MessagesPalette.listSeparator}`
      }}
      onClick={() => props.onFocus()}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MessagesMetrics.recipientFontSize}px`,
          color: MessagesPalette.rowPreview
        }}
      >
        To:
      </span>
      <span
        class="min-w-0 truncate"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MessagesMetrics.recipientFontSize}px`,
          color: 'black'
        }}
      >
        {props.recipient}
      </span>
      <Show when={props.focused}>
        <div
          class="shrink-0"
          style={{
            width: `${MessagesMetrics.caretWidth}px`,
            height: `${MessagesMetrics.caretHeight}px`,
            background: MessagesPalette.caret
          }}
        />
      </Show>
    </button>

    <div class="flex-1" />
  </div>
)
