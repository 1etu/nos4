import { Show, createSignal, onCleanup } from 'solid-js'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition, type CATransaction } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { ContactsTitleBar } from '../Chrome/ContactsTitleBar'
import { ContactsDetail } from '../Detail/ContactsDetail'
import { ContactEditorView } from '../Edit/ContactEditorView'
import { ContactsList } from '../List/ContactsList'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import { addressBookRemove, addressBookUpdate } from '../Support/ContactsStore'
import { ContactsScreen, type ContactRecord } from '../Support/ContactsTypes'

interface EditorSession {
  readonly contact: ContactRecord | undefined
}

const slide = caAnimation(ContactsMetrics.navDuration, CAMediaTimingFunction.linear)
const sheet = caAnimation(ContactsMetrics.sheetDuration, CAMediaTimingFunction.linear)

export const ContactsApp = (props: { width: number; height: number }) => {
  const [view, setView] = createSignal<string>(ContactsScreen.list)
  const [outgoing, setOutgoing] = createSignal<string | undefined>()
  const [backward, setBackward] = createSignal(false)
  const [entering, setEntering] = createSignal(false)
  const [selected, setSelected] = createSignal<ContactRecord | undefined>()
  const [search, setSearch] = createSignal('')
  const [editing, setEditing] = createSignal(false)
  const [editor, setEditor] = createSignal<EditorSession | undefined>()
  const [sheetUp, setSheetUp] = createSignal(false)

  let handoff: CATransaction | undefined
  let settle: CATransaction | undefined
  let dismissal: CATransaction | undefined

  onCleanup(() => {
    handoff?.cancel()
    settle?.cancel()
    dismissal?.cancel()
  })

  const presentEditor = (contact: ContactRecord | undefined) => {
    dismissal?.cancel()
    setEditor({ contact })
    requestAnimationFrame(() => setSheetUp(true))
  }

  const dismissEditor = () => {
    setSheetUp(false)
    dismissal = caAfter(ContactsMetrics.sheetDuration, () => setEditor(undefined))
  }

  const transition = (next: string, isBack: boolean) => {
    handoff?.cancel()
    settle?.cancel()
    setBackward(isBack)
    const begin = () => {
      setOutgoing(view())
      setView(next)
      setEntering(true)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setEntering(false)
          settle = caAfter(ContactsMetrics.navDuration, () => setOutgoing(undefined))
        })
      )
    }
    if (isBack) {
      begin()
      return
    }
    handoff = caAfter(ContactsMetrics.pushDelay, begin)
  }

  const openContact = (contact: ContactRecord) => {
    setSelected(contact)
    setEditing(false)
    transition(ContactsScreen.detail, false)
  }

  const offscreen = () => (backward() ? -props.width : props.width)
  const isDetail = () => view() === ContactsScreen.detail

  const screenFor = (id: string) => (
    <Show
      when={id === ContactsScreen.detail}
      fallback={
        <ContactsList
          search={search()}
          editing={editing()}
          onSearch={setSearch}
          onFocus={() => setEditing(true)}
          onCancel={() => {
            setSearch('')
            setEditing(false)
          }}
          onOpen={openContact}
        />
      }
    >
      <Show when={selected()}>{(contact) => <ContactsDetail contact={contact()} />}</Show>
    </Show>
  )

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{ background: ContactsPalette.listBackdrop }}
    >
      <UIStatusBar style="inApp" />
      <ContactsTitleBar
        title={isDetail() ? 'Info' : 'All Contacts'}
        showBack={isDetail()}
        showPlus={!isDetail()}
        onBack={() => transition(ContactsScreen.list, true)}
        onAdd={() => presentEditor(undefined)}
        onEdit={() => presentEditor(selected())}
      />

      <div class="relative flex-1 overflow-hidden">
        <Show when={outgoing()}>
          {(previous) => (
            <div
              class="absolute inset-0"
              style={{
                transform: entering() ? 'translateX(0px)' : `translateX(${-offscreen()}px)`,
                transition: entering() ? 'none' : caTransition(['transform'], slide)
              }}
            >
              {screenFor(previous())}
            </div>
          )}
        </Show>
        <div
          class="absolute inset-0"
          style={{
            transform: entering() ? `translateX(${offscreen()}px)` : 'translateX(0px)',
            transition: entering() ? 'none' : caTransition(['transform'], slide)
          }}
        >
          {screenFor(view())}
        </div>
      </div>

      <Show when={editor()}>
        {(session) => (
          <div
            class="absolute inset-0"
            style={{
              transform: sheetUp() ? 'translateY(0)' : `translateY(${props.height}px)`,
              transition: caTransition(['transform'], sheet),
              'pointer-events': sheetUp() ? 'auto' : 'none'
            }}
          >
            <ContactEditorView
              contact={session().contact}
              onCancel={dismissEditor}
              onSave={(contact) => {
                addressBookUpdate(contact)
                if (selected()?.id === contact.id) setSelected(contact)
                dismissEditor()
              }}
              onDelete={(contact) => {
                addressBookRemove(contact.id)
                dismissEditor()
                if (selected()?.id === contact.id) {
                  setSelected(undefined)
                  transition(ContactsScreen.list, true)
                }
              }}
            />
          </div>
        )}
      </Show>
    </div>
  )
}
