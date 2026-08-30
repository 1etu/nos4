import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { NSUserDefaults } from 'NSUserDefaults'
import { ContactsDidChange, ContactsIdentifier } from './ContactsNotifications'
import { ContactsAlphabet } from './ContactsMetrics'
import type { ContactRecord } from './ContactsTypes'

const ContactsKey = 'addressbook.contacts'

const make = (
  id: string,
  givenName: string,
  familyName: string,
  company: string,
  phones: readonly (readonly [string, string])[],
  emails: readonly (readonly [string, string])[]
): ContactRecord => ({
  id,
  givenName,
  familyName,
  company,
  phoneNumbers: phones.map(([label, value], index) => ({
    id: `${id}-p${index}`,
    label,
    value
  })),
  emailAddresses: emails.map(([label, value], index) => ({
    id: `${id}-e${index}`,
    label,
    value
  }))
})

const seed = (): readonly ContactRecord[] => [
  make('c1', 'Adrian', 'Bell', 'Northwind Design', [['mobile', '(415) 555-0142']], [['home', 'adrian.bell@example.com']]),
  make('c2', 'Priya', 'Raman', 'Lantern Analytics', [['mobile', '(408) 555-0188'], ['work', '(408) 555-0190']], [['work', 'praman@example.com']]),
  make('c3', 'Marcus', 'Feld', 'Feld Logistics', [['work', '(212) 555-0119']], [['work', 'm.feld@example.com']]),
  make('c4', 'Helen', 'Vasquez', '', [['mobile', '(310) 555-0164']], [['home', 'helen@example.com']]),
  make('c5', 'Toby', 'Nakamura', '', [['mobile', '(206) 555-0173']], [['home', 'toby.n@example.com']]),
  make('c6', 'Dana', 'Whitfield', 'Meridian Studio', [['mobile', '(503) 555-0155'], ['home', '(503) 555-0121']], [['work', 'dana.whitfield@example.com']]),
  make('c7', 'Sam', 'Oyelaran', '', [['mobile', '(646) 555-0137']], [['home', 'sam.o@example.com']]),
  make('c8', 'Nadia', 'Kowalski', 'Harbour Press', [['work', '(617) 555-0148']], [['work', 'n.kowalski@example.com']]),
  make('c9', 'Owen', 'Brennan', '', [['mobile', '(773) 555-0159']], []),
  make('c10', 'Grace', 'Lindqvist', 'Atlas Field Co', [['mobile', '(602) 555-0126']], [['home', 'grace.l@example.com']]),
  make('c11', 'Isaac', 'Moreau', '', [['home', '(305) 555-0181']], [['home', 'imoreau@example.com']]),
  make('c12', ' Roadside', 'Assistance', '', [['other', '(800) 555-0199']], [])
]

const stored = NSUserDefaults.object<ContactRecord[]>(ContactsKey)
const [contacts, setContacts] = createSignal<readonly ContactRecord[]>(
  stored && stored.length > 0 ? stored : seed()
)

export const addressBookContacts = contacts

const persist = (next: readonly ContactRecord[]) => {
  setContacts(next)
  NSUserDefaults.setObject(ContactsKey, [...next])
  NSNotificationCenter.post(ContactsDidChange, ContactsIdentifier, { count: next.length })
}

export const contactDisplayName = (contact: ContactRecord): string =>
  [contact.givenName, contact.familyName].filter((part) => part.trim().length > 0).join(' ').trim()

export const contactIndexLetter = (contact: ContactRecord): string => {
  const source =
    contact.familyName.trim().length > 0 ? contact.familyName.trim() : contactDisplayName(contact)
  const first = source.charAt(0).toUpperCase()
  return ContactsAlphabet.includes(first) ? first : '#'
}

const letterRank = (letter: string): number => {
  const index = ContactsAlphabet.indexOf(letter)
  return index === -1 ? ContactsAlphabet.length : index
}

export const addressBookSections = (): readonly {
  letter: string
  contacts: readonly ContactRecord[]
}[] => {
  const buckets = new Map<string, ContactRecord[]>()
  for (const contact of contacts()) {
    const letter = contactIndexLetter(contact)
    const bucket = buckets.get(letter)
    if (bucket) {
      bucket.push(contact)
      continue
    }
    buckets.set(letter, [contact])
  }
  return [...buckets.entries()]
    .map(([letter, group]) => ({
      letter,
      contacts: [...group].sort((a, b) =>
        contactDisplayName(a).localeCompare(contactDisplayName(b))
      )
    }))
    .sort((a, b) => letterRank(a.letter) - letterRank(b.letter))
}

export const addressBookSearch = (query: string): readonly ContactRecord[] => {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return []
  return contacts().filter((contact) =>
    contactDisplayName(contact).toLowerCase().includes(needle)
  )
}

export const addressBookAdd = (contact: ContactRecord): void => {
  persist([...contacts(), contact])
}
