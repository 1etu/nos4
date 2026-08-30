import { createSignal, Show } from 'solid-js'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { UIKeyboardMetrics, UIKeyboardStandard, UIKeyboardView } from 'TextInput'
import { NotesDeleteSheet } from '../Views/NotesDeleteSheet'
import { NotesEditorView } from '../Views/NotesEditorView'
import { NotesListView } from '../Views/NotesListView'
import { NotesTitleBar } from '../Views/NotesTitleBar'
import { NotesMetrics } from '../Support/NotesMetrics'
import {
  createNote,
  deleteNote,
  noteById,
  noteTitle,
  sortedNotes,
  updateNote,
  type Note
} from '../Support/NoteStore'
import {
  deleteFromNote,
  endEditingNote,
  insertIntoNote,
  notesEditing
} from '../Support/NotesEditing'

const Newline = String.fromCharCode(10)

const navAnimation = caAnimation(NotesMetrics.navDuration, CAMediaTimingFunction.linear)
const sheetAnimation = caAnimation(NotesMetrics.sheetDuration, CAMediaTimingFunction.easeInOut)

export const NotesApp = (props: { width: number; height: number }) => {
  const [selected, setSelected] = createSignal<string | undefined>()
  const [editing, setEditing] = createSignal(false)
  const [showDelete, setShowDelete] = createSignal(false)

  const current = (): Note | undefined => {
    const id = selected()
    return id ? noteById(id) : undefined
  }

  const title = () => {
    const note = current()
    if (note) return noteTitle(note)
    return `Notes (${sortedNotes().length})`
  }

  const keyboardHeight = () =>
    notesEditing()
      ? (UIKeyboardMetrics.referenceHeight * props.width) / UIKeyboardMetrics.referenceWidth
      : 0

  const write = (next: string) => {
    const note = current()
    if (!note) return
    updateNote(note.id, next)
  }

  const contentHeight = () =>
    props.height - NotesMetrics.statusBarHeight - NotesMetrics.titleBarHeight

  const goBack = () => {
    endEditingNote()
    setEditing(false)
    setShowDelete(false)
    setSelected(undefined)
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar />

      <NotesTitleBar
        title={title()}
        showBack={current() !== undefined}
        editing={editing()}
        onBack={goBack}
        onNew={() => {
          const note = createNote()
          setSelected(note.id)
          setEditing(false)
        }}
        onDone={() => {
          endEditingNote()
          setEditing(false)
        }}
      />

      <div class="relative flex-1 overflow-hidden">
        <div
          class="absolute inset-0"
          style={{
            transform: `translateX(${current() ? -100 : 0}%)`,
            transition: caTransition(['transform'], navAnimation)
          }}
        >
          <NotesListView
            onOpen={(note) => {
              setSelected(note.id)
              setEditing(false)
            }}
          />
        </div>

        <div
          class="absolute inset-0"
          style={{
            transform: `translateX(${current() ? 0 : 100}%)`,
            transition: caTransition(['transform'], navAnimation)
          }}
        >
          <Show when={current()}>
            {(note) => (
              <NotesEditorView
                note={note()}
                keyboardHeight={keyboardHeight()}
                onChange={(content) => updateNote(note().id, content)}
                onFocus={() => setEditing(true)}
                onSelect={(next) => setSelected(next.id)}
                onDelete={() => setShowDelete(true)}
              />
            )}
          </Show>
        </div>
      </div>

      <UIKeyboardView
        visible={notesEditing()}
        width={props.width}
        configuration={UIKeyboardStandard}
        onInsert={(text) => write(insertIntoNote(current()?.content ?? '', text))}
        onDelete={() => write(deleteFromNote(current()?.content ?? ''))}
        onReturn={() => write(insertIntoNote(current()?.content ?? '', Newline))}
      />

      <div
        class="absolute inset-0"
        style={{
          background: 'black',
          opacity: `${showDelete() ? 0.35 : 0}`,
          'pointer-events': showDelete() ? 'auto' : 'none',
          transition: caTransition(['opacity'], sheetAnimation)
        }}
        onClick={() => setShowDelete(false)}
      />
      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          transform: `translateY(${showDelete() ? 0 : 100}%)`,
          'pointer-events': showDelete() ? 'auto' : 'none',
          'will-change': 'transform',
          transition: caTransition(['transform'], sheetAnimation)
        }}
      >
        <NotesDeleteSheet
          height={contentHeight() * NotesMetrics.deleteSheetRatio}
          onCancel={() => setShowDelete(false)}
          onDelete={() => {
            const note = current()
            setShowDelete(false)
            if (!note) return
            deleteNote(note.id)
            goBack()
          }}
        />
      </div>
    </div>
  )
}
