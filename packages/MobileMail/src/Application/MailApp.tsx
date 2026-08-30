import { Match, Show, Switch, createMemo, createSignal, onCleanup } from 'solid-js'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition, type CATransaction } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { MailTitleBar } from '../Chrome/MailTitleBar'
import { MailToolBar } from '../Chrome/MailToolBar'
import { MailComposeView } from '../Compose/MailComposeView'
import { MailContactView } from '../Contact/MailContactView'
import { MailMailboxList } from '../Mailboxes/MailMailboxList'
import { MailBodyView } from '../Message/MailBodyView'
import { MailMessageList } from '../Messages/MailMessageList'
import { MailMoveView } from '../Move/MailMoveView'
import { MailWelcomeView } from '../Setup/MailWelcomeView'
import { MailMetrics } from '../Support/MailMetrics'
import {
  MailFolders,
  mailAccount,
  mailBeginRefresh,
  mailDeleteMessage,
  mailEndRefresh,
  mailMarkSeen,
  mailMessagesIn,
  mailMoveMessage,
  mailSendMessage,
  mailSignIn,
  mailUnreadIn
} from '../Support/MailStore'
import { MailScreen, type MailFolder, type MailMessage } from '../Support/MailTypes'

const slide = caAnimation(MailMetrics.navDuration, CAMediaTimingFunction.linear)
const sheet = caAnimation(MailMetrics.sheetDuration, CAMediaTimingFunction.linear)

const InboxFolder = MailFolders[0]

export const MailApp = (props: { width: number; height: number }) => {
  const [view, setView] = createSignal<string>(MailScreen.inbox)
  const [outgoing, setOutgoing] = createSignal<string | undefined>()
  const [backward, setBackward] = createSignal(false)
  const [entering, setEntering] = createSignal(false)
  const [folder, setFolder] = createSignal<MailFolder | undefined>(InboxFolder)
  const [selected, setSelected] = createSignal<MailMessage | undefined>()
  const [search, setSearch] = createSignal('')
  const [composing, setComposing] = createSignal(false)
  const [moving, setMoving] = createSignal(false)

  let settle: CATransaction | undefined
  let refresh: CATransaction | undefined
  let dismiss: CATransaction | undefined

  onCleanup(() => {
    settle?.cancel()
    refresh?.cancel()
    dismiss?.cancel()
  })

  const transition = (next: string, isBack: boolean) => {
    settle?.cancel()
    setBackward(isBack)
    setOutgoing(view())
    setView(next)
    setEntering(true)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setEntering(false)
        settle = caAfter(MailMetrics.navDuration, () => setOutgoing(undefined))
      })
    )
  }

  const activePath = () => folder()?.path ?? 'INBOX'
  const isDetail = () => view() === MailScreen.message || view() === MailScreen.otherMessage
  const isContact = () => view() === MailScreen.contact || view() === MailScreen.otherContact

  const visibleMessages = createMemo(() => {
    const query = search().trim().toLowerCase()
    const list = mailMessagesIn(activePath())
    if (query.length === 0) return list
    return list.filter(
      (entry) =>
        entry.sender.displayName.toLowerCase().includes(query) ||
        entry.subject.toLowerCase().includes(query) ||
        entry.preview.toLowerCase().includes(query)
    )
  })

  const inboxLabel = () => `Inbox (${mailUnreadIn('INBOX')})`

  const title = createMemo(() => {
    if (view() === MailScreen.mailboxes) return 'Mailboxes'
    if (isContact()) return 'Sender'
    if (isDetail()) {
      const list = mailMessagesIn(activePath())
      const index = list.findIndex((entry) => entry.uid === selected()?.uid)
      if (view() === MailScreen.message) return `${index + 1} of ${list.length}`
      return folder()?.name ?? ''
    }
    if (view() === MailScreen.otherMailbox) return folder()?.name ?? ''
    return inboxLabel()
  })

  const backLabel = createMemo(() => {
    if (view() === MailScreen.mailboxes) return undefined
    if (isContact()) return 'Message'
    if (isDetail()) return inboxLabel()
    return 'Mailboxes'
  })

  const goBack = () => {
    if (isContact()) {
      transition(
        view() === MailScreen.contact ? MailScreen.message : MailScreen.otherMessage,
        true
      )
      return
    }
    if (isDetail()) {
      transition(
        view() === MailScreen.message ? MailScreen.inbox : MailScreen.otherMailbox,
        true
      )
      return
    }
    transition(MailScreen.mailboxes, true)
  }

  const openFolder = (next: MailFolder) => {
    setFolder(next)
    transition(next.path === 'INBOX' ? MailScreen.inbox : MailScreen.otherMailbox, false)
  }

  const openMessage = (message: MailMessage) => {
    setSelected(message)
    mailMarkSeen(message.uid)
    transition(
      activePath() === 'INBOX' ? MailScreen.message : MailScreen.otherMessage,
      false
    )
  }

  const openSender = () =>
    transition(
      view() === MailScreen.message ? MailScreen.contact : MailScreen.otherContact,
      false
    )

  const onRefresh = () => {
    refresh?.cancel()
    mailBeginRefresh(() => {
      refresh = caAfter(MailMetrics.refreshSeconds, mailEndRefresh)
    })
  }

  const onDelete = () => {
    const message = selected()
    if (!message) return
    mailDeleteMessage(message.uid)
    goBack()
  }

  const onMove = (path: string) => {
    const message = selected()
    if (!message) return
    mailMoveMessage(message.uid, path)
    dismiss?.cancel()
    dismiss = caAfter(MailMetrics.moveDismissDelay, () => setMoving(false))
    goBack()
  }

  const offscreen = () => (backward() ? -props.width : props.width)

  const screenFor = (id: string) => (
    <Switch fallback={<MailMailboxList onOpen={openFolder} />}>
      <Match when={id === MailScreen.inbox || id === MailScreen.otherMailbox}>
        <MailMessageList
          path={activePath()}
          messages={visibleMessages()}
          search={search()}
          onSearch={setSearch}
          onOpen={openMessage}
          onLoadMore={onRefresh}
        />
      </Match>
      <Match when={id === MailScreen.message || id === MailScreen.otherMessage}>
        <Show when={selected()}>
          {(message) => <MailBodyView message={message()} onOpenSender={openSender} />}
        </Show>
      </Match>
      <Match when={id === MailScreen.contact || id === MailScreen.otherContact}>
        <Show when={selected()}>
          {(message) => <MailContactView sender={message().sender} />}
        </Show>
      </Match>
    </Switch>
  )

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden" style={{ background: 'white' }}>
      <Show
        when={mailAccount()}
        fallback={
          <>
            <UIStatusBar style="inApp" />
            <MailTitleBar title="Welcome to Mail" />
            <div class="flex-1 overflow-hidden">
              <MailWelcomeView onSelect={mailSignIn} />
            </div>
          </>
        }
      >
        <UIStatusBar style="inApp" />
        <MailTitleBar
          title={title()}
          back={backLabel()}
          stepping={isDetail()}
          onBack={goBack}
        />

        <div class="relative flex-1 overflow-hidden">
          <Show when={outgoing()}>
            {(previous) => (
              <div
                class="absolute inset-0"
                style={{
                  transform: entering() ? 'translateX(0px)' : `translateX(${-offscreen()}px)`,
                  transition: entering() ? 'none' : caTransition(['transform'], slide)
                }}
              >
                {screenFor(previous())}
              </div>
            )}
          </Show>
          <div
            class="absolute inset-0"
            style={{
              transform: entering() ? `translateX(${offscreen()}px)` : 'translateX(0px)',
              transition: entering() ? 'none' : caTransition(['transform'], slide)
            }}
          >
            {screenFor(view())}
          </div>
        </div>

        <div
          style={{
            height: `${MailMetrics.toolBarHeight}px`,
            transform: isContact() ? `translateY(${MailMetrics.toolBarHeight}px)` : 'none',
            transition: caTransition(['transform'], slide)
          }}
        >
          <MailToolBar
            detail={isDetail()}
            onRefresh={onRefresh}
            onCompose={() => setComposing(true)}
            onMove={() => setMoving(true)}
            onDelete={onDelete}
          />
        </div>
      </Show>

      <div
        class="absolute inset-0"
        style={{
          transform: composing() ? 'translateY(0)' : `translateY(${props.height}px)`,
          transition: caTransition(['transform'], sheet),
          'pointer-events': composing() ? 'auto' : 'none'
        }}
      >
        <MailComposeView
          onCancel={() => setComposing(false)}
          onSend={(to, subject, body) => {
            mailSendMessage(to, subject, body)
            setComposing(false)
          }}
        />
      </div>

      <Show when={selected()}>
        {(message) => (
          <div
            class="absolute inset-0"
            style={{
              transform: moving() ? 'translateY(0)' : `translateY(${props.height}px)`,
              transition: caTransition(['transform'], sheet),
              'pointer-events': moving() ? 'auto' : 'none'
            }}
          >
            <MailMoveView
              message={message()}
              onCancel={() => setMoving(false)}
              onMove={onMove}
            />
          </div>
        )}
      </Show>
    </div>
  )
}
