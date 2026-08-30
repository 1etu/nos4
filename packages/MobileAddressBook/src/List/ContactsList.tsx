import { For, Show } from 'solid-js'
import { UIScrollView } from 'UIKit'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import {
  addressBookContacts,
  addressBookSearch,
  addressBookSections
} from '../Support/ContactsStore'
import type { ContactRecord } from '../Support/ContactsTypes'
import { ContactsIndexStrip } from './ContactsIndexStrip'
import { ContactsRow } from './ContactsRow'
import { ContactsSearchField } from './ContactsSearchField'
import { ContactsSectionHeader } from './ContactsSectionHeader'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const ContactsList = (props: {
  search: string
  editing: boolean
  onSearch: (value: string) => void
  onFocus: () => void
  onCancel: () => void
  onOpen: (contact: ContactRecord) => void
}) => {
  let scroller!: HTMLDivElement

  const jump = (letter: string) => {
    const anchor = scroller.querySelector<HTMLElement>(`[data-index="${letter}"]`)
    if (!anchor) return
    anchor.scrollIntoView({ block: 'start' })
  }

  const available = () => addressBookSections().map((section) => section.letter)

  return (
    <div class="relative h-full w-full overflow-hidden">
      <div class="flex h-full w-full flex-col">
        <ContactsSearchField
          value={props.search}
          editing={props.editing}
          onInput={props.onSearch}
          onFocus={props.onFocus}
          onCancel={props.onCancel}
        />

        <div ref={scroller} class="relative flex-1 overflow-hidden">
          <UIScrollView class="h-full w-full">
            <div style={{ background: 'white', 'min-height': '100%' }}>
              <For each={addressBookSections()}>
                {(section) => (
                  <div data-index={section.letter}>
                    <ContactsSectionHeader letter={section.letter} />
                    <For each={section.contacts}>
                      {(contact) => <ContactsRow contact={contact} onOpen={props.onOpen} />}
                    </For>
                  </div>
                )}
              </For>

              <div
                class="flex w-full items-center justify-center"
                style={{ height: `${ContactsMetrics.rowHeight}px` }}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${ContactsMetrics.footerFontSize}px`,
                    color: ContactsPalette.footerInk
                  }}
                >
                  {`${addressBookContacts().length} Contacts`}
                </span>
              </div>
            </div>
          </UIScrollView>

          <Show when={!props.editing}>
            <ContactsIndexStrip available={available()} onJump={jump} />
          </Show>
        </div>
      </div>

      <Show when={props.editing}>
        <div
          class="absolute inset-x-0 bottom-0"
          style={{
            top: `${ContactsMetrics.searchRowHeight}px`,
            background: props.search.length > 0 ? 'white' : 'rgba(0,0,0,0.9)'
          }}
        >
          <Show when={props.search.length > 0}>
            <UIScrollView class="h-full w-full">
              <For each={addressBookSearch(props.search)}>
                {(contact) => <ContactsRow contact={contact} chevron onOpen={props.onOpen} />}
              </For>
            </UIScrollView>
          </Show>
        </div>
      </Show>
    </div>
  )
}
