import { createSignal } from 'solid-js'

export type SearchEditingState = 'None' | 'Active' | 'Active_Empty'

const [query, setQuery] = createSignal('')
const [editing, setEditing] = createSignal<SearchEditingState>('None')

export const searchQuery = query
export const searchEditing = editing

export const isSearching = (): boolean => editing() !== 'None'

export const beginSearch = (): void => {
  setEditing(query().length === 0 ? 'Active_Empty' : 'Active')
}

export const setSearchQuery = (value: string): void => {
  setQuery(value)
  setEditing(value.length === 0 ? 'Active_Empty' : 'Active')
}

export const endSearch = (): void => {
  setQuery('')
  setEditing('None')
}

export const insertSearchText = (text: string): void => setSearchQuery(query() + text)

export const deleteSearchBackward = (): void => setSearchQuery(query().slice(0, -1))
