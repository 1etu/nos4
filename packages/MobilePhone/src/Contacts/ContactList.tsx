import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { cnContactName, cnContacts, type CNContact } from '../Support/ContactStore'
import { contactSearchQuery, contactSearchState } from '../Support/ContactSearch'
import { ContactSearchField } from './ContactSearchField'
import {
  ContactAlphabetIndex,
  ContactListFooter,
  ContactListHeader,
  ContactRowName,
  ContactSeparator,
  contactIndexLetter,
  contactIndexLetters
} from './ContactListChrome'

const ContactRow = (props: {
  contact: CNContact
  chevron: boolean
  onSelect: (contact: CNContact) => void
}) => (
  <>
    <button
      type="button"
      class="flex w-full items-center"
      style={{ height: `${PhoneMetrics.rowHeight - PhoneMetrics.hairline}px` }}
      onClick={() => props.onSelect(props.contact)}
    >
      <div class="flex min-w-0 flex-1 items-center">
        <ContactRowName contact={props.contact} />
      </div>
      <Show when={props.chevron}>
        <div style={{ 'padding-right': `${PhoneMetrics.rowTextTrailing}px` }}>
          <CGImage name="UITableNext" />
        </div>
      </Show>
    </button>
    <ContactSeparator />
  </>
)

export const ContactList = (props: { onSelect: (contact: CNContact) => void }) => {
  let scroller: HTMLDivElement | undefined

  const letters = () => contactIndexLetters(cnContacts())

  const matches = () =>
    cnContacts().filter((contact) =>
      cnContactName(contact).toLowerCase().includes(contactSearchQuery().toLowerCase())
    )

  return (
    <div class="relative h-full w-full overflow-hidden">
      <div ref={scroller} class="h-full w-full">
        <UIScrollView
          class="relative h-full w-full"
          style={{ background: PhonePalette.listBackground }}
        >
          <ContactSearchField />

          <div style={{ background: 'white' }}>
            <For each={letters()}>
              {(letter) => (
                <div id={`contact-index-${letter}`}>
                  <ContactListHeader letter={letter} />
                  <For each={cnContacts().filter((entry) => contactIndexLetter(entry) === letter)}>
                    {(contact) => (
                      <ContactRow contact={contact} chevron={false} onSelect={props.onSelect} />
                    )}
                  </For>
                </div>
              )}
            </For>
            <ContactListFooter count={cnContacts().length} />
          </div>
        </UIScrollView>
      </div>

      <Show when={contactSearchState() === 'None'}>
        <ContactAlphabetIndex
          present={letters()}
          onSelect={(letter) => {
            const target =
              letter === 'Search'
                ? scroller?.querySelector('div')
                : scroller?.querySelector(`#contact-index-${letter}`)
            target?.scrollIntoView({ block: 'start' })
          }}
        />
      </Show>

      <Show when={contactSearchState() === 'Active_Empty'}>
        <div
          class="absolute inset-x-0 bottom-0"
          style={{
            top: `${PhoneMetrics.searchRowHeight}px`,
            background: PhonePalette.searchDim
          }}
        />
      </Show>

      <Show when={contactSearchState() === 'Active'}>
        <div
          class="absolute inset-x-0 bottom-0 overflow-hidden"
          style={{ top: `${PhoneMetrics.searchRowHeight}px`, background: 'white' }}
        >
          <UIScrollView class="h-full w-full">
            <For each={matches()}>
              {(contact) => (
                <ContactRow contact={contact} chevron={true} onSelect={props.onSelect} />
              )}
            </For>
          </UIScrollView>
        </div>
      </Show>
    </div>
  )
}
