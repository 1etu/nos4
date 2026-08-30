import { createSignal } from 'solid-js'

export type ContactSearchState = 'None' | 'Active' | 'Active_Empty'

const [query, setQuery] = createSignal('')
const [editing, setEditing] = createSignal<ContactSearchState>('None')

export const contactSearchQuery = query
export const contactSearchState = editing

export const contactSearchIsActive = (): boolean => editing() !== 'None'

export const beginContactSearch = (): void => {
  setEditing(query().length === 0 ? 'Active_Empty' : 'Active')
}

export const setContactSearchQuery = (value: string): void => {
  setQuery(value)
  setEditing(value.length === 0 ? 'Active_Empty' : 'Active')
}

export const endContactSearch = (): void => {
  setQuery('')
  setEditing('None')
}

export const insertContactSearchText = (text: string): void =>
  setContactSearchQuery(query() + text)

export const deleteContactSearchBackward = (): void =>
  setContactSearchQuery(query().slice(0, -1))
