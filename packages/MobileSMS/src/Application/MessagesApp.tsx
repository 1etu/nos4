import { createSignal, Match, Show, Switch } from 'solid-js'
import { UIBarButton, UINavigationBar, UIStatusBar } from 'UIKit'
import { UIKeyboardMetrics, UIKeyboardStandard, UIKeyboardView } from 'TextInput'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { MessagesMetrics } from '../Support/MessagesMetrics'
import { ComposeButton } from './ComposeButton'
import { ConversationList } from '../Conversations/ConversationList'
import { NewMessageView } from '../Compose/NewMessageView'
import { ComposeBar } from '../Thread/ComposeBar'
import { ThreadView } from '../Thread/ThreadView'
import {
  sendSMS,
  smsConversation,
  startSMSConversation,
  type SMSConversation
} from '../Support/MessageStore'

type MessagesScreen = 'list' | 'thread' | 'compose'
type MessagesField = 'draft' | 'recipient'

const ThreadActions: readonly string[] = ['Call', 'Add to Contacts']

const liftAnimation = caAnimation(
  UIKeyboardMetrics.presentDuration,
  CAMediaTimingFunction.easeInOut
)

export const MessagesApp = (props: { width: number }) => {
  const now = new Date()
  const [screen, setScreen] = createSignal<MessagesScreen>('list')
  const [openId, setOpenId] = createSignal('')
  const [draft, setDraft] = createSignal('')
  const [recipient, setRecipient] = createSignal('')
  const [field, setField] = createSignal<MessagesField | undefined>()

  const open = () => smsConversation(openId())

  const keyboardHeight = () =>
    field() === undefined
      ? 0
      : (UIKeyboardMetrics.referenceHeight * props.width) / UIKeyboardMetrics.referenceWidth

  const title = () => {
    if (screen() === 'compose') return 'New Message'
    if (screen() === 'thread') return open()?.name ?? 'Messages'
    return 'Messages'
  }

  const enter = (conversation: SMSConversation) => {
    setOpenId(conversation.id)
    setScreen('thread')
    setField(undefined)
  }

  const send = () => {
    if (draft() === '') return
    if (screen() === 'compose') {
      if (recipient() === '') return
      const id = startSMSConversation(recipient())
      sendSMS(id, draft())
      setOpenId(id)
      setScreen('thread')
    } else {
      sendSMS(openId(), draft())
    }
    setDraft('')
    setField(undefined)
  }

  const current = () => (field() === 'recipient' ? recipient() : draft())
  const write = (next: string) => {
    if (field() === 'recipient') setRecipient(next)
    if (field() === 'draft') setDraft(next)
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar style="inApp" />

      <UINavigationBar
        title={title()}
        leading={
          <Show when={screen() === 'thread'}>
            <UIBarButton
              title="Messages"
              tone="blueGray"
              onClick={() => {
                setScreen('list')
                setField(undefined)
              }}
            />
          </Show>
        }
        trailing={
          <Switch>
            <Match when={screen() === 'list'}>
              <ComposeButton
                onPress={() => {
                  setRecipient('')
                  setDraft('')
                  setScreen('compose')
                }}
              />
            </Match>
            <Match when={screen() === 'thread'}>
              <UIBarButton title="Edit" tone="blueGray" onClick={() => setScreen('list')} />
            </Match>
            <Match when={screen() === 'compose'}>
              <UIBarButton
                title="Cancel"
                tone="blueGray"
                onClick={() => {
                  setScreen('list')
                  setField(undefined)
                }}
              />
            </Match>
          </Switch>
        }
      />

      <Switch>
        <Match when={screen() === 'list'}>
          <ConversationList now={now} onOpen={enter} />
        </Match>
        <Match when={screen() === 'thread'}>
          <Show when={open()}>
            {(conversation) => (
              <ThreadView
                conversation={conversation()}
                width={props.width}
                actions={ThreadActions}
                bottomInset={keyboardHeight() + MessagesMetrics.composeHeight}
                onAction={() => setField(undefined)}
              />
            )}
          </Show>
        </Match>
        <Match when={screen() === 'compose'}>
          <NewMessageView
            recipient={recipient()}
            focused={field() === 'recipient'}
            onFocus={() => setField('recipient')}
          />
        </Match>
      </Switch>

      <Show when={screen() !== 'list'}>
        <div
          class="relative shrink-0"
          style={{
            'z-index': '1',
            transform: `translateY(${-keyboardHeight()}px)`,
            transition: caTransition(['transform'], liftAnimation)
          }}
        >
        <ComposeBar
          value={draft()}
          placeholder="Text Message"
          focused={field() === 'draft'}
          onFocus={() => setField('draft')}
          onSend={send}
        />
        </div>
      </Show>

      <UIKeyboardView
        visible={field() !== undefined}
        width={props.width}
        configuration={UIKeyboardStandard}
        onInsert={(text) => write(current() + text)}
        onDelete={() => write(current().slice(0, -1))}
        onReturn={() => setField(undefined)}
      />
    </div>
  )
}
