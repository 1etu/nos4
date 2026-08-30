import { Match, Show, Switch, createSignal } from 'solid-js'
import { UIStatusBar, UIStatusBarMetrics, UITabBar } from 'UIKit'
import { UIKeyboardStandard, UIKeyboardSearch, UIKeyboardURL, UIKeyboardView } from 'TextInput'
import { PhonePalette } from '../Support/PhoneMetrics'
import { phClearRecentCalls } from '../Support/RecentsStore'
import { phCallState, phDialCall } from '../Support/CallCenter'
import { CallScreen } from '../Call/CallScreen'
import { phAddFavorite } from '../Support/FavoritesStore'
import { cnContactName, type CNContact } from '../Support/ContactStore'
import {
  blurContactField,
  commitContactEditor,
  contactDraft,
  contactEditorFocus,
  contactEditorIsUpdate,
  deleteContactBackward,
  insertContactText,
  loadContactIntoEditor,
  resetContactEditor
} from '../Support/ContactEditor'
import {
  contactSearchIsActive,
  contactSearchQuery,
  deleteContactSearchBackward,
  endContactSearch,
  insertContactSearchText
} from '../Support/ContactSearch'
import { FavoritesView } from '../Favorites/FavoritesView'
import { AddFavoriteView } from '../Favorites/AddFavoriteView'
import { RecentsView } from '../Recents/RecentsView'
import { ClearRecentsSheet } from '../Recents/ClearRecentsSheet'
import { ContactList } from '../Contacts/ContactList'
import { ContactInfoView } from '../Contacts/ContactInfoView'
import { AddContactView } from '../Contacts/AddContactView'
import { KeypadView } from '../Keypad/KeypadView'
import { VoicemailView } from '../Voicemail/VoicemailView'
import { PhoneTabItems, type PhoneTab } from './PhoneTabs'
import { PhoneTitleBar } from './PhoneTitleBar'

export const PhoneApp = (props: { width: number }) => {
  const [tab, setTab] = createSignal<PhoneTab>('Favorites')
  const [contact, setContact] = createSignal<CNContact | undefined>()
  const [editingFavorites, setEditingFavorites] = createSignal(false)
  const [segment, setSegment] = createSignal(0)
  const [addingContact, setAddingContact] = createSignal(false)
  const [addingFavorite, setAddingFavorite] = createSignal(false)
  const [clearingRecents, setClearingRecents] = createSignal(false)

  const viewingInfo = () => tab() === 'Contacts' && contact() !== undefined

  const title = () => {
    if (tab() !== 'Contacts') return tab()
    return viewingInfo() ? 'Info' : 'All Contacts'
  }

  const selectTab = (next: PhoneTab) => {
    endContactSearch()
    setEditingFavorites(false)
    setContact(undefined)
    setTab(next)
  }

  const openEditor = () => {
    endContactSearch()
    setAddingContact(true)
  }

  const closeEditor = () => {
    setAddingContact(false)
    resetContactEditor()
  }

  const keyboardField = () => {
    if (contactEditorFocus() !== undefined) return contactEditorFocus()
    if (contactSearchIsActive()) return 'search'
    return undefined
  }

  const keyboardConfiguration = () => {
    if (contactEditorFocus() === 'url') return UIKeyboardURL(contactDraft().url.length > 0)
    if (contactEditorFocus() !== undefined) return UIKeyboardStandard
    return UIKeyboardSearch(contactSearchQuery().length > 0)
  }

  const insert = (text: string) => {
    if (contactEditorFocus() !== undefined) return insertContactText(text)
    insertContactSearchText(text)
  }

  const deleteBackward = () => {
    if (contactEditorFocus() !== undefined) return deleteContactBackward()
    deleteContactSearchBackward()
  }

  const dismissKeyboard = () => {
    if (contactEditorFocus() !== undefined) return blurContactField()
    endContactSearch()
  }

  return (
    <div class="relative flex h-full w-full flex-col overflow-hidden">
      <UIStatusBar style="inApp" />

      <Show when={tab() !== 'Keypad'}>
        <PhoneTitleBar
          tab={tab()}
          title={title()}
          viewingInfo={viewingInfo()}
          editing={editingFavorites()}
          segment={segment()}
          onSegment={setSegment}
          onEdit={() => {
            if (tab() === 'Favorites') setEditingFavorites(!editingFavorites())
            if (tab() === 'Recents') setClearingRecents(true)
          }}
          onEditContact={() => {
            const current = contact()
            if (!current) return
            loadContactIntoEditor(current)
            setAddingContact(true)
          }}
          onPlus={() => {
            endContactSearch()
            setAddingFavorite(true)
          }}
          onBack={() => setContact(undefined)}
        />
      </Show>

      <Switch>
        <Match when={tab() === 'Favorites'}>
          <FavoritesView
            editing={editingFavorites()}
            onCall={(favorite) => phDialCall(favorite.name, favorite.number, favorite.type)}
          />
        </Match>
        <Match when={tab() === 'Recents'}>
          <RecentsView
            segment={segment()}
            onCall={(call) => phDialCall(call.number, call.number, call.type)}
          />
        </Match>
        <Match when={tab() === 'Contacts'}>
          <Show
            when={contact()}
            fallback={
              <div class="min-h-0 flex-1">
                <ContactList onSelect={setContact} />
              </div>
            }
          >
            {(current) => (
              <ContactInfoView
                contact={current()}
                onCall={(entry) =>
                  phDialCall(cnContactName(current()), entry.value, entry.label)
                }
              />
            )}
          </Show>
        </Match>
        <Match when={tab() === 'Keypad'}>
          <KeypadView
            width={props.width}
            onAddContact={openEditor}
            onCall={(formatted) => phDialCall(formatted, formatted, '')}
          />
        </Match>
        <Match when={tab() === 'Voicemail'}>
          <VoicemailView />
        </Match>
      </Switch>

      <UITabBar
        width={props.width}
        items={PhoneTabItems}
        selected={tab()}
        onSelect={(id) => selectTab(id as PhoneTab)}
      />

      <Show when={addingFavorite()}>
        <div class="absolute inset-0" style={{ top: `${UIStatusBarMetrics.height}px` }}>
          <AddFavoriteView
            onCancel={() => {
              endContactSearch()
              setAddingFavorite(false)
            }}
            onSelect={(picked) => {
              const number = picked.phoneNumbers[0]
              if (!number) return
              phAddFavorite(cnContactName(picked), number.value, number.label)
              endContactSearch()
              setAddingFavorite(false)
            }}
          />
        </div>
      </Show>

      <Show when={addingContact()}>
        <div class="absolute inset-0" style={{ top: `${UIStatusBarMetrics.height}px` }}>
          <AddContactView
            title={contactEditorIsUpdate() ? 'Info' : 'New Contact'}
            onCancel={closeEditor}
            onSave={() => {
              commitContactEditor()
              closeEditor()
            }}
          />
        </div>
      </Show>

      <Show when={clearingRecents()}>
        <div
          class="absolute inset-0 flex flex-col justify-end"
          style={{ background: PhonePalette.sheetScrim }}
          onClick={() => setClearingRecents(false)}
        >
          <ClearRecentsSheet
            onClear={() => {
              phClearRecentCalls()
              setClearingRecents(false)
            }}
            onCancel={() => setClearingRecents(false)}
          />
        </div>
      </Show>

      <Show when={phCallState() !== 'idle'}>
        <CallScreen />
      </Show>

      <UIKeyboardView
        visible={keyboardField() !== undefined}
        width={props.width}
        configuration={keyboardConfiguration()}
        onInsert={insert}
        onDelete={deleteBackward}
        onReturn={dismissKeyboard}
      />
    </div>
  )
}
