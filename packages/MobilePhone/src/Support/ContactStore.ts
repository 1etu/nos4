import {
  addressBookAdd,
  addressBookContacts,
  addressBookUpdate,
  type ContactLabelledValue,
  type ContactRecord
} from 'MobileAddressBook'

export interface CNLabeledValue {
  readonly label: string
  readonly value: string
}

export interface CNContact {
  readonly identifier: string
  readonly givenName: string
  readonly familyName: string
  readonly organizationName: string
  readonly phoneNumbers: readonly CNLabeledValue[]
  readonly emailAddresses: readonly CNLabeledValue[]
  readonly urlAddresses: readonly CNLabeledValue[]
}

const labeled = (entries: readonly ContactLabelledValue[] | undefined): CNLabeledValue[] =>
  (entries ?? []).map(({ label, value }) => ({ label, value }))

const identified = (
  prefix: string,
  entries: readonly CNLabeledValue[]
): ContactLabelledValue[] =>
  entries.map(({ label, value }, index) => ({ id: `${prefix}${index}`, label, value }))

const fromRecord = (record: ContactRecord): CNContact => ({
  identifier: record.id,
  givenName: record.givenName,
  familyName: record.familyName,
  organizationName: record.company,
  phoneNumbers: labeled(record.phoneNumbers),
  emailAddresses: labeled(record.emailAddresses),
  urlAddresses: labeled(record.urlAddresses)
})

const toRecord = (contact: CNContact): ContactRecord => ({
  id: contact.identifier,
  givenName: contact.givenName,
  familyName: contact.familyName,
  company: contact.organizationName,
  phoneNumbers: identified(`${contact.identifier}-p`, contact.phoneNumbers),
  emailAddresses: identified(`${contact.identifier}-e`, contact.emailAddresses),
  urlAddresses: identified(`${contact.identifier}-u`, contact.urlAddresses)
})

export const cnContactName = (contact: CNContact): string =>
  [contact.givenName, contact.familyName].filter((part) => part !== '').join(' ')

const sortKey = (contact: CNContact): string =>
  `${contact.familyName !== '' ? contact.familyName : contact.givenName} ${contact.givenName}`

export const cnContacts = (): CNContact[] =>
  addressBookContacts()
    .map(fromRecord)
    .sort((left, right) => sortKey(left).localeCompare(sortKey(right)))

export const cnAddContact = (contact: CNContact): void => addressBookAdd(toRecord(contact))

export const cnUpdateContact = (contact: CNContact): void =>
  addressBookUpdate(toRecord(contact))
