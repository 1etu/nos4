import { Show } from 'solid-js'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'
import { smsListStamp } from '../Support/MessageTime'
import { smsLastMessage, type SMSConversation } from '../Support/MessageStore'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Chevron = () => (
  <svg
    width={MessagesMetrics.rowChevronWidth}
    height={MessagesMetrics.rowChevronHeight}
    viewBox="0 0 9 14"
    aria-hidden="true"
  >
    <path
      d="M1.5 1.5 7 7l-5.5 5.5"
      fill="none"
      stroke={MessagesPalette.chevron}
      stroke-width="2.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

export const ConversationRow = (props: {
  conversation: SMSConversation
  now: Date
  onOpen: () => void
}) => {
  const last = () => smsLastMessage(props.conversation)

  return (
    <button
      type="button"
      class="flex w-full shrink-0 items-center"
      style={{
        height: `${MessagesMetrics.rowHeight}px`,
        padding: `0 ${MessagesMetrics.rowInsetX}px`,
        gap: `${MessagesMetrics.rowStampGap}px`,
        background: MessagesPalette.list,
        'border-bottom': `1px solid ${MessagesPalette.listSeparator}`
      }}
      onClick={() => props.onOpen()}
    >
      <div
        class="flex min-w-0 flex-1 flex-col items-start"
        style={{ gap: `${MessagesMetrics.rowTextGap}px` }}
      >
        <span
          class="w-full truncate text-left"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MessagesMetrics.rowNameFontSize}px`,
            'font-weight': '700',
            'line-height': '1.1',
            color: MessagesPalette.rowName
          }}
        >
          {props.conversation.name}
        </span>
        <Show when={last()}>
          {(message) => (
            <span
              class="w-full truncate text-left"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${MessagesMetrics.rowPreviewFontSize}px`,
                'line-height': '1.1',
                color: MessagesPalette.rowPreview
              }}
            >
              {message().text}
            </span>
          )}
        </Show>
      </div>

      <Show when={last()}>
        {(message) => (
          <span
            class="shrink-0"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MessagesMetrics.rowStampFontSize}px`,
              'font-weight': '700',
              color: MessagesPalette.rowStamp
            }}
          >
            {smsListStamp(message().sent, props.now)}
          </span>
        )}
      </Show>

      <Chevron />
    </button>
  )
}
