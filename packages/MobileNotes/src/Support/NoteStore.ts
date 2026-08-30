import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

const NotesKey = 'notes'
const TitleLength = 30

export interface Note {
  readonly id: string
  readonly content: string
  readonly createdAt: number
  readonly editedAt: number
}

const seed: readonly Note[] = []

const stored = NSUserDefaults.object<Note[]>(NotesKey)

const [notes, setNotes] = createSignal<readonly Note[]>(stored ?? seed)

export const allNotes = notes

export const noteTitle = (note: Note): string =>
  note.content.slice(0, TitleLength).split('\n').join(' ')

export const sortedNotes = (): readonly Note[] =>
  [...notes()].filter((note) => note.content.length > 0).sort((a, b) => b.editedAt - a.editedAt)

const persist = (next: readonly Note[]): void => {
  setNotes(next)
  NSUserDefaults.setObject(NotesKey, [...next])
}

export const createNote = (): Note => {
  const now = Date.now()
  const note: Note = {
    id: `note-${now}-${Math.random().toString(36).slice(2, 8)}`,
    content: '',
    createdAt: now,
    editedAt: now
  }
  persist([...notes(), note])
  return note
}

export const updateNote = (id: string, content: string): void => {
  persist(
    notes().map((note) =>
      note.id === id ? { ...note, content, editedAt: Date.now() } : note
    )
  )
}

export const deleteNote = (id: string): void => {
  persist(notes().filter((note) => note.id !== id))
}

export const noteById = (id: string): Note | undefined =>
  notes().find((note) => note.id === id)

const startOfDay = (value: number): number => {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export const relativeDay = (value: number): string => {
  const days = Math.round((startOfDay(Date.now()) - startOfDay(value)) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export const stampLabel = (value: number): string => {
  const date = new Date(value)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const time = date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase()
  return `${month} ${date.getDate()}  ${time}`
}

export const dateLabel = (value: number): string =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: '2-digit'
  })
