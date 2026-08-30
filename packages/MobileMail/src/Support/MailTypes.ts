import type { AssetName } from 'CoreGraphics'

export const MailScreen = {
  inbox: 'Main',
  otherMailbox: 'Other',
  message: 'Destination',
  otherMessage: 'Destination_Other',
  mailboxes: 'Mailboxes',
  contact: 'Contact',
  otherContact: 'Contact_Other'
} as const

export type MailScreenValue = (typeof MailScreen)[keyof typeof MailScreen]

export const MailProvider = {
  exchange: 'exchange',
  mobileme: 'mobileme',
  gmail: 'gmail',
  yahoo: 'yahoo',
  aol: 'aol',
  other: 'other'
} as const

export type MailProviderValue = (typeof MailProvider)[keyof typeof MailProvider]

export interface MailAddress {
  readonly displayName: string
  readonly mailbox: string
}

export interface MailMessage {
  readonly uid: number
  readonly folder: string
  readonly sender: MailAddress
  readonly to: MailAddress
  readonly subject: string
  readonly preview: string
  readonly body: string
  readonly received: number
  readonly seen: boolean
}

export interface MailFolder {
  readonly id: string
  readonly name: string
  readonly path: string
  readonly icon: AssetName
}

export interface MailAccount {
  readonly email: string
  readonly name: string
  readonly description: string
  readonly provider: MailProviderValue
}
