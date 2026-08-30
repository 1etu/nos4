import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

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

const StorageKey = 'contacts'

const Seed: readonly CNContact[] = [
  {
    identifier: 'angela-adams',
    givenName: 'Angela',
    familyName: 'Adams',
    organizationName: '',
    phoneNumbers: [{ label: 'mobile', value: '(415) 555-0164' }],
    emailAddresses: [{ label: 'home', value: 'angela@example.com' }],
    urlAddresses: []
  },
  {
    identifier: 'dan-chase',
    givenName: 'Dan',
    familyName: 'Chase',
    organizationName: '',
    phoneNumbers: [
      { label: 'mobile', value: '(408) 555-0142' },
      { label: 'home', value: '(408) 555-0187' }
    ],
    emailAddresses: [{ label: 'home', value: 'dan@example.com' }],
    urlAddresses: [{ label: 'home page', value: 'example.com' }]
  },
  {
    identifier: 'nina-ortiz',
    givenName: 'Nina',
    familyName: 'Ortiz',
    organizationName: '',
    phoneNumbers: [{ label: 'iPhone', value: '(212) 555-0119' }],
    emailAddresses: [],
    urlAddresses: []
  },
  {
    identifier: 'marcus-reed',
    givenName: 'Marcus',
    familyName: 'Reed',
    organizationName: '',
    phoneNumbers: [
      { label: 'work', value: '(650) 555-0173' },
      { label: 'mobile', value: '(650) 555-0198' }
    ],
    emailAddresses: [{ label: 'work', value: 'marcus@example.com' }],
    urlAddresses: []
  },
  {
    identifier: 'terry-white',
    givenName: 'Terry',
    familyName: 'White',
    organizationName: '',
    phoneNumbers: [{ label: 'mobile', value: '(303) 555-0155' }],
    emailAddresses: [],
    urlAddresses: []
  },
  {
    identifier: 'support-line',
    givenName: 'Support',
    familyName: '',
    organizationName: 'Support',
    phoneNumbers: [{ label: 'main', value: '1 (800) 555-0199' }],
    emailAddresses: [],
    urlAddresses: []
  }
]

const [store, setStore] = createSignal<CNContact[]>(
  NSUserDefaults.object<CNContact[]>(StorageKey) ?? Seed.map((entry) => ({ ...entry }))
)

export const cnContactName = (contact: CNContact): string =>
  [contact.givenName, contact.familyName].filter((part) => part !== '').join(' ')

const sortKey = (contact: CNContact): string =>
  `${contact.familyName !== '' ? contact.familyName : contact.givenName} ${contact.givenName}`

export const cnContacts = () =>
  [...store()].sort((left, right) => sortKey(left).localeCompare(sortKey(right)))

const persist = (next: CNContact[]): void => {
  setStore(next)
  NSUserDefaults.setObject(StorageKey, next)
}

export const cnAddContact = (contact: CNContact): void => persist([...store(), contact])

export const cnUpdateContact = (contact: CNContact): void =>
  persist(store().map((entry) => (entry.identifier === contact.identifier ? contact : entry)))
