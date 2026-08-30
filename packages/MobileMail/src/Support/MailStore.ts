import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { MailIdentifier, MailStoreDidChange } from './MailNotifications'
import type { MailAccount, MailFolder, MailMessage, MailProviderValue } from './MailTypes'

const MessagesKey = 'mail.messages'
const AccountKey = 'mail.account'
const UpdatedKey = 'mail.updated'

const Minute = 60000
const Hour = 60 * Minute
const Day = 24 * Hour

export const MailFolders: readonly MailFolder[] = [
  { id: 'inbox', name: 'Inbox', path: 'INBOX', icon: 'inmbox' },
  { id: 'drafts', name: 'Drafts', path: 'Drafts', icon: 'draftsmbox' },
  { id: 'sent', name: 'Sent Mail', path: 'Sent Mail', icon: 'sentmbox' },
  { id: 'trash', name: 'Trash', path: 'Trash', icon: 'trashmbox' }
]

const address = (displayName: string, mailbox: string) => ({ displayName, mailbox })

const seed = (): readonly MailMessage[] => {
  const now = Date.now()
  const draft = (
    uid: number,
    folder: string,
    sender: [string, string],
    subject: string,
    preview: string,
    body: string,
    ago: number,
    seen: boolean
  ): MailMessage => ({
    uid,
    folder,
    sender: address(sender[0], sender[1]),
    to: address('Me', 'me@example.com'),
    subject,
    preview,
    body,
    received: now - ago,
    seen
  })

  return [
    draft(
      1201,
      'INBOX',
      ['Dana Whitfield', 'dana.whitfield@example.com'],
      'Notes from this morning',
      'Thanks for making time earlier. I wrote up the three things we agreed on so nothing gets lost.',
      '<p>Thanks for making time earlier. I wrote up the three things we agreed on so nothing gets lost.</p><p>1. Lock the schedule by Friday.<br>2. Get the revised numbers from Priya.<br>3. Send the summary to the wider group.</p><p>Shout if I have any of that wrong.</p><p>Dana</p>',
      42 * Minute,
      false
    ),
    draft(
      1200,
      'INBOX',
      ['Marcus Feld', 'm.feld@example.com'],
      'Re: shipping estimate',
      'The revised estimate came back lower than expected, which gives us a bit of room on the timeline.',
      '<p>The revised estimate came back lower than expected, which gives us a bit of room on the timeline.</p><p>I would still plan for the original date and treat the difference as buffer.</p><p>Marcus</p>',
      3 * Hour,
      false
    ),
    draft(
      1199,
      'INBOX',
      ['Priya Raman', 'praman@example.com'],
      'Quarterly figures attached',
      'Everything is reconciled except the two line items we flagged. Those are still with accounting.',
      '<p>Everything is reconciled except the two line items we flagged. Those are still with accounting.</p><p>I should have the last pieces by Tuesday.</p>',
      6 * Hour,
      true
    ),
    draft(
      1198,
      'INBOX',
      ['Helen Vasquez', 'helen@example.com'],
      'Lunch next week?',
      'I am in town Tuesday through Thursday and would love to catch up if you have an hour free.',
      '<p>I am in town Tuesday through Thursday and would love to catch up if you have an hour free.</p><p>No pressure if the week is already full.</p><p>Helen</p>',
      Day + 2 * Hour,
      true
    ),
    draft(
      1197,
      'INBOX',
      ['Building Management', 'notices@example.com'],
      'Scheduled maintenance Saturday',
      'Water will be shut off between 9am and noon this Saturday while the risers are serviced.',
      '<p>Water will be shut off between 9am and noon this Saturday while the risers are serviced.</p><p>We expect the work to finish early, and we will post a notice in the lobby when service is restored.</p>',
      2 * Day,
      true
    ),
    draft(
      1196,
      'INBOX',
      ['Toby Nakamura', 'toby.n@example.com'],
      'That article you mentioned',
      'Finally tracked it down. It is a longer read than I remembered but the middle section is the useful part.',
      '<p>Finally tracked it down. It is a longer read than I remembered but the middle section is the useful part.</p><p>Curious what you make of it.</p>',
      3 * Day,
      true
    ),
    draft(
      1195,
      'INBOX',
      ['Renewals', 'billing@example.com'],
      'Your plan renews next month',
      'No action is needed. Your plan renews automatically on the 14th at the current rate.',
      '<p>No action is needed. Your plan renews automatically on the 14th at the current rate.</p><p>You can review or change your plan at any time from your account settings.</p>',
      5 * Day,
      true
    ),
    draft(
      1194,
      'INBOX',
      ['Sam Oyelaran', 'sam.o@example.com'],
      'Draft for review',
      'Attached the second pass. I took out the long tangent in the middle and tightened the opening.',
      '<p>Attached the second pass. I took out the long tangent in the middle and tightened the opening.</p><p>Let me know if it still runs long.</p>',
      9 * Day,
      true
    ),
    draft(
      1150,
      'Sent Mail',
      ['Me', 'me@example.com'],
      'Re: Notes from this morning',
      'That all matches what I had. I will take the summary and send it out tomorrow.',
      '<p>That all matches what I had. I will take the summary and send it out tomorrow.</p>',
      30 * Minute,
      true
    ),
    draft(
      1149,
      'Sent Mail',
      ['Me', 'me@example.com'],
      'Availability next week',
      'Tuesday afternoon or Thursday morning both work on my end.',
      '<p>Tuesday afternoon or Thursday morning both work on my end.</p>',
      Day,
      true
    ),
    draft(
      1100,
      'Trash',
      ['Weekly Digest', 'digest@example.com'],
      'Your week in review',
      'Here is what happened across your subscriptions this week.',
      '<p>Here is what happened across your subscriptions this week.</p>',
      4 * Day,
      true
    )
  ]
}

const storedMessages = NSUserDefaults.object<MailMessage[]>(MessagesKey)
const [messages, setMessages] = createSignal<readonly MailMessage[]>(
  storedMessages && storedMessages.length > 0 ? storedMessages : seed()
)
const [account, setAccount] = createSignal<MailAccount | undefined>(
  NSUserDefaults.object<MailAccount>(AccountKey)
)
const [updated, setUpdated] = createSignal<number>(
  NSUserDefaults.object<number>(UpdatedKey) ?? Date.now()
)
const [refreshing, setRefreshing] = createSignal(false)

export const mailMessages = messages
export const mailAccount = account
export const mailUpdated = updated
export const mailRefreshing = refreshing

const persist = (next: readonly MailMessage[]) => {
  setMessages(next)
  NSUserDefaults.setObject(MessagesKey, [...next])
  NSNotificationCenter.post(MailStoreDidChange, MailIdentifier, { count: next.length })
}

export const mailMessagesIn = (path: string): readonly MailMessage[] =>
  messages()
    .filter((entry) => entry.folder === path)
    .sort((a, b) => b.received - a.received)

export const mailUnreadIn = (path: string): number =>
  messages().filter((entry) => entry.folder === path && !entry.seen).length

export const mailTotalIn = (path: string): number =>
  messages().filter((entry) => entry.folder === path).length

export const mailMarkSeen = (uid: number): void => {
  persist(messages().map((entry) => (entry.uid === uid ? { ...entry, seen: true } : entry)))
}

export const mailMoveMessage = (uid: number, folder: string): void => {
  persist(messages().map((entry) => (entry.uid === uid ? { ...entry, folder } : entry)))
}

export const mailDeleteMessage = (uid: number): void => {
  const entry = messages().find((candidate) => candidate.uid === uid)
  if (!entry) return
  if (entry.folder === 'Trash') {
    persist(messages().filter((candidate) => candidate.uid !== uid))
    return
  }
  mailMoveMessage(uid, 'Trash')
}

export const mailSendMessage = (
  to: string,
  subject: string,
  body: string
): void => {
  const uid = Math.max(...messages().map((entry) => entry.uid)) + 1
  persist([
    ...messages(),
    {
      uid,
      folder: 'Sent Mail',
      sender: address('Me', account()?.email ?? 'me@example.com'),
      to: address(to, to),
      subject,
      preview: body,
      body: `<p>${body}</p>`,
      received: Date.now(),
      seen: true
    }
  ])
}

export const mailBeginRefresh = (onDone: () => void): void => {
  setRefreshing(true)
  onDone()
}

export const mailEndRefresh = (): void => {
  setRefreshing(false)
  const now = Date.now()
  setUpdated(now)
  NSUserDefaults.setObject(UpdatedKey, now)
}

export const mailSignIn = (provider: MailProviderValue): void => {
  const next: MailAccount = {
    email: 'me@example.com',
    name: 'Me',
    description: 'My Account',
    provider
  }
  setAccount(next)
  NSUserDefaults.setObject(AccountKey, next)
}

export const mailSignOut = (): void => {
  setAccount(undefined)
  NSUserDefaults.removeObject(AccountKey)
}
