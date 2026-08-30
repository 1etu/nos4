import { createSignal } from 'solid-js'

export type EditingState = 'None' | 'Active' | 'Active_Empty'

export type SafariField = 'url' | 'query' | 'bookmark'

const [urlText, setUrlText] = createSignal('')
const [urlState, setUrlState] = createSignal<EditingState>('None')
const [queryText, setQueryText] = createSignal('')
const [queryState, setQueryState] = createSignal<EditingState>('None')
const [bookmarkText, setBookmarkText] = createSignal('')
const [bookmarkState, setBookmarkState] = createSignal<EditingState>('None')

export const safariUrlText = urlText
export const safariUrlState = urlState
export const safariQueryText = queryText
export const safariQueryState = queryState
export const safariBookmarkText = bookmarkText
export const safariBookmarkState = bookmarkState

export const focusedField = (): SafariField | undefined => {
  if (urlState() !== 'None') return 'url'
  if (queryState() !== 'None') return 'query'
  if (bookmarkState() !== 'None') return 'bookmark'
  return undefined
}

export const isEditingChrome = (): boolean => {
  const field = focusedField()
  return field === 'url' || field === 'query'
}

export const fieldText = (field: SafariField): string => {
  if (field === 'url') return urlText()
  if (field === 'query') return queryText()
  return bookmarkText()
}

export const setFieldText = (field: SafariField, text: string): void => {
  const state: EditingState = text.length === 0 ? 'Active_Empty' : 'Active'
  if (field === 'url') {
    setUrlText(text)
    setUrlState(state)
    return
  }
  if (field === 'query') {
    setQueryText(text)
    setQueryState(state)
    return
  }
  setBookmarkText(text)
  setBookmarkState(state)
}

export const syncUrlText = (text: string): void => {
  if (urlState() !== 'None') return
  setUrlText(text)
}

export const beginEditing = (field: SafariField): void => {
  if (field === 'url') {
    setUrlState(urlText().length === 0 ? 'Active_Empty' : 'Active')
    return
  }
  if (field === 'query') {
    setQueryState('Active')
    return
  }
  setBookmarkState(bookmarkText().length === 0 ? 'Active_Empty' : 'Active')
}

export const endEditing = (): void => {
  setUrlState('None')
  setQueryState('None')
  setBookmarkState('None')
}

export const clearField = (field: SafariField): void => setFieldText(field, '')

export const resetQuery = (): void => {
  setQueryText('')
}

export const startBookmarkName = (name: string): void => {
  setBookmarkText(name)
  setBookmarkState('None')
}

export const insertText = (text: string): void => {
  const field = focusedField()
  if (!field) return
  setFieldText(field, fieldText(field) + text)
}

export const deleteBackward = (): void => {
  const field = focusedField()
  if (!field) return
  setFieldText(field, fieldText(field).slice(0, -1))
}
