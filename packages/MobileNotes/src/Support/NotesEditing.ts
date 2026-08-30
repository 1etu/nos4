import { createSignal } from 'solid-js'

const [focused, setFocused] = createSignal(false)
const [caret, setCaret] = createSignal(0)

export const notesEditing = focused
export const notesCaret = caret

export const beginEditingNote = (position: number): void => {
  setCaret(position)
  setFocused(true)
}

export const moveCaret = (position: number): void => {
  setCaret(position)
}

export const endEditingNote = (): void => {
  setFocused(false)
}

export const insertIntoNote = (content: string, text: string): string => {
  const at = Math.min(Math.max(caret(), 0), content.length)
  setCaret(at + text.length)
  return `${content.slice(0, at)}${text}${content.slice(at)}`
}

export const deleteFromNote = (content: string): string => {
  const at = Math.min(Math.max(caret(), 0), content.length)
  if (at === 0) return content
  setCaret(at - 1)
  return `${content.slice(0, at - 1)}${content.slice(at)}`
}
