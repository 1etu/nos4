import { createSignal } from 'solid-js'
import { cnAddContact, cnUpdateContact, type CNContact } from './ContactStore'

export type CNEditorField = 'first' | 'last' | 'company' | 'phone' | 'email' | 'url'

type CNEditorDraft = Record<CNEditorField, string>

const Blank: CNEditorDraft = {
  first: '',
  last: '',
  company: '',
  phone: '',
  email: '',
  url: ''
}

const [draft, setDraft] = createSignal<CNEditorDraft>({ ...Blank })
const [focus, setFocus] = createSignal<CNEditorField | undefined>()
const [editing, setEditing] = createSignal('')

export const contactDraft = draft
export const contactEditorFocus = focus
export const contactEditorIsUpdate = (): boolean => editing() !== ''

export const focusContactField = (field: CNEditorField): void => {
  setFocus(field)
}

export const setContactField = (field: CNEditorField, value: string): void => {
  setDraft({ ...draft(), [field]: value })
}

export const insertContactText = (text: string): void => {
  const field = focus()
  if (!field) return
  setContactField(field, draft()[field] + text)
}

export const deleteContactBackward = (): void => {
  const field = focus()
  if (!field) return
  setContactField(field, draft()[field].slice(0, -1))
}

export const blurContactField = (): void => setFocus(undefined)

export const resetContactEditor = (): void => {
  setDraft({ ...Blank })
  setFocus(undefined)
  setEditing('')
}

export const loadContactIntoEditor = (contact: CNContact): void => {
  setDraft({
    first: contact.givenName,
    last: contact.familyName,
    company: contact.organizationName,
    phone: contact.phoneNumbers[0]?.value ?? '',
    email: contact.emailAddresses[0]?.value ?? '',
    url: contact.urlAddresses[0]?.value ?? ''
  })
  setFocus(undefined)
  setEditing(contact.identifier)
}

export const commitContactEditor = (): void => {
  const fields = draft()
  const values = [fields.first, fields.last, fields.company, fields.phone, fields.email, fields.url]
  if (values.every((value) => value === '')) return

  const contact: CNContact = {
    identifier: editing() !== '' ? editing() : `contact-${Date.now()}`,
    givenName: fields.first,
    familyName: fields.last,
    organizationName: fields.company,
    phoneNumbers: fields.phone === '' ? [] : [{ label: 'mobile', value: fields.phone }],
    emailAddresses: fields.email === '' ? [] : [{ label: 'home', value: fields.email }],
    urlAddresses: fields.url === '' ? [] : [{ label: 'home page', value: fields.url }]
  }

  if (editing() !== '') {
    cnUpdateContact(contact)
    return
  }
  cnAddContact(contact)
}
