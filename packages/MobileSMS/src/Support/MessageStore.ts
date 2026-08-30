import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export interface SMSMessage {
  readonly id: string
  readonly text: string
  readonly outgoing: boolean
  readonly sent: number
}

export interface SMSConversation {
  readonly id: string
  readonly name: string
  readonly messages: readonly SMSMessage[]
}

const StorageKey = 'messages_conversations'

const Seed: readonly SMSConversation[] = [
  {
    id: 'dan-chase',
    name: 'Dan Chase',
    messages: [
      {
        id: 'dan-1',
        text: 'Hello. I can now search through SMS messages in iOS 4!',
        outgoing: true,
        sent: Date.parse('2011-01-06T20:36:00')
      },
      {
        id: 'dan-2',
        text: "That's cool!",
        outgoing: false,
        sent: Date.parse('2011-01-06T20:37:00')
      }
    ]
  },
  {
    id: 'terry-white',
    name: 'Terry White',
    messages: [
      {
        id: 'terry-1',
        text: 'What time does your flight get in?',
        outgoing: true,
        sent: Date.parse('2012-01-06T21:31:00')
      }
    ]
  },
  {
    id: 'att',
    name: '11113000',
    messages: [
      {
        id: 'att-1',
        text: 'AT&T Free Msg: An important software update is available for your iPhone. To update to iOS 4.2, connect to iTunes and follow the instructions.',
        outgoing: false,
        sent: Date.parse('2011-01-13T14:17:00')
      }
    ]
  }
]

const [conversations, setConversations] = createSignal<SMSConversation[]>(
  NSUserDefaults.object<SMSConversation[]>(StorageKey) ?? Seed.map((entry) => ({ ...entry }))
)

export const smsConversations = conversations

const persist = (next: SMSConversation[]): void => {
  setConversations(next)
  NSUserDefaults.setObject(StorageKey, next)
}

export const smsConversation = (id: string): SMSConversation | undefined =>
  conversations().find((entry) => entry.id === id)

export const smsLastMessage = (conversation: SMSConversation): SMSMessage | undefined =>
  conversation.messages[conversation.messages.length - 1]

export const sendSMS = (id: string, text: string): void => {
  if (text === '') return
  const message: SMSMessage = {
    id: `sms-${Date.now()}`,
    text,
    outgoing: true,
    sent: Date.now()
  }
  persist(
    conversations().map((entry) =>
      entry.id === id ? { ...entry, messages: [...entry.messages, message] } : entry
    )
  )
}

export const startSMSConversation = (name: string): string => {
  const id = `sms-${Date.now()}`
  persist([{ id, name, messages: [] }, ...conversations()])
  return id
}

export const removeSMSConversation = (id: string): void => {
  persist(conversations().filter((entry) => entry.id !== id))
}
