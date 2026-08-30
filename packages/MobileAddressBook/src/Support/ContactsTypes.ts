export const ContactsScreen = {
  list: 'Contacts',
  detail: 'Contacts_Destination'
} as const

export type ContactsScreenValue = (typeof ContactsScreen)[keyof typeof ContactsScreen]

export interface ContactLabelledValue {
  readonly id: string
  readonly label: string
  readonly value: string
}

export interface ContactRecord {
  readonly id: string
  readonly givenName: string
  readonly familyName: string
  readonly company: string
  readonly phoneNumbers: readonly ContactLabelledValue[]
  readonly emailAddresses: readonly ContactLabelledValue[]
}
