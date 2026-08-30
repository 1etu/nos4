import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'
import { smsStamp } from '../Support/MessageTime'
import type { SMSConversation } from '../Support/MessageStore'
import { MessageBubble } from './MessageBubble'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const StampRule = () => (
  <div class="flex-1" style={{ height: '1px', background: MessagesPalette.stampRule }} />
)

const ActionButton = (props: { title: string; onPress: () => void }) => (
  <button
    type="button"
    class="flex flex-1 items-center justify-center"
    style={{
      height: `${MessagesMetrics.actionRowHeight}px`,
      'border-radius': `${MessagesMetrics.actionRadius}px`,
      background: MessagesPalette.actionFace,
      border: `1px solid ${MessagesPalette.actionStroke}`
    }}
    onClick={() => props.onPress()}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MessagesMetrics.actionFontSize}px`,
        'font-weight': '700',
        color: MessagesPalette.actionLabel
      }}
    >
      {props.title}
    </span>
  </button>
)

export const ThreadView = (props: {
  conversation: SMSConversation
  width: number
  actions: readonly string[]
  bottomInset: number
  onAction: (title: string) => void
}) => (
  <UIScrollView class="min-h-0 flex-1" style={{ background: MessagesPalette.thread }}>
    <div
      class="flex"
      style={{
        padding: `${MessagesMetrics.actionRowTop}px ${MessagesMetrics.actionInsetX}px 0`,
        gap: `${MessagesMetrics.actionGap}px`
      }}
    >
      <For each={props.actions}>
        {(title) => <ActionButton title={title} onPress={() => props.onAction(title)} />}
      </For>
    </div>

    <Show when={props.conversation.messages[0]}>
      {(first) => (
        <div
          class="flex items-center"
          style={{
            padding: `0 ${MessagesMetrics.bubbleInsetX}px`,
            gap: `${MessagesMetrics.composeGap}px`,
            'margin-top': `${MessagesMetrics.stampMarginTop}px`,
            'margin-bottom': `${MessagesMetrics.stampMarginBottom}px`
          }}
        >
          <StampRule />
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MessagesMetrics.stampFontSize}px`,
              'font-weight': '700',
              'white-space': 'nowrap',
              color: MessagesPalette.stamp
            }}
          >
            {smsStamp(first().sent)}
          </span>
          <StampRule />
        </div>
      )}
    </Show>

    <For each={props.conversation.messages}>
      {(message) => (
        <MessageBubble
          text={message.text}
          outgoing={message.outgoing}
          width={props.width}
          tailId={`tail-${message.id}`}
        />
      )}
    </For>

    <div style={{ height: `${props.bottomInset}px` }} />
  </UIScrollView>
)
