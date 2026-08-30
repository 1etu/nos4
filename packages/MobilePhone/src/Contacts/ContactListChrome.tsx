import { For, Show } from 'solid-js'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import type { CNContact } from '../Support/ContactStore'

export const ContactAlphabet = [
  'Search',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '#'
] as const

export const contactIndexLetter = (contact: CNContact): string => {
  const source = contact.familyName !== '' ? contact.familyName : contact.givenName
  const first = source.slice(0, 1).toUpperCase()
  return ContactAlphabet.includes(first as (typeof ContactAlphabet)[number]) ? first : '#'
}

export const contactIndexLetters = (contacts: readonly CNContact[]): string[] => {
  const present = [...new Set(contacts.map(contactIndexLetter))]
  return present.sort((left, right) => {
    if (left === '#') return 1
    if (right === '#') return -1
    return left.localeCompare(right)
  })
}

export const ContactSeparator = () => (
  <div style={{ height: `${PhoneMetrics.hairline}px`, background: PhonePalette.separator }} />
)

export const ContactListHeader = (props: { letter: string }) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${PhoneMetrics.headerHeight}px`,
      background: PhonePalette.listHeader,
      'box-shadow': `inset 0 ${PhoneMetrics.headerTopBorderOuter}px 0 -${PhoneMetrics.headerTopBorderInner}px rgb(176,186,194), inset 0 ${PhoneMetrics.headerTopBorderInner}px 0 rgb(122,134,142)`
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.headerFontSize}px`,
        'line-height': `${PhoneMetrics.headerLineHeight}`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 1.2px 0 rgba(94,90,90,0.75)',
        'padding-left': `${PhoneMetrics.headerLeading}px`
      }}
    >
      {props.letter}
    </span>
  </div>
)

export const ContactRowName = (props: { contact: CNContact }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${PhoneMetrics.contactNameFontSize}px`,
      color: 'black',
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'padding-left': `${PhoneMetrics.rowLeading}px`,
      'padding-right': `${PhoneMetrics.contactRowTrailing}px`
    }}
  >
    <span style={{ 'font-weight': props.contact.familyName === '' ? '700' : '500' }}>
      {props.contact.givenName}
    </span>
    <span style={{ 'font-weight': '500' }}> </span>
    <span style={{ 'font-weight': '700' }}>{props.contact.familyName}</span>
  </span>
)

export const ContactListFooter = (props: { count: number }) => (
  <div class="flex items-center justify-center" style={{ height: `${PhoneMetrics.rowHeight}px` }}>
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.footerCountFontSize}px`,
        color: PhonePalette.subtitle
      }}
    >
      {`${props.count} Contacts`}
    </span>
  </div>
)

export const ContactAlphabetIndex = (props: {
  present: readonly string[]
  onSelect: (letter: string) => void
}) => (
  <div
    class="absolute inset-y-0 right-0 flex flex-col items-end justify-center"
    style={{
      gap: `${PhoneMetrics.indexSpacing}px`,
      'padding-right': `${PhoneMetrics.indexTrailing}px`
    }}
  >
    <For each={ContactAlphabet}>
      {(letter) => (
        <button
          type="button"
          class="flex items-center justify-center"
          style={{
            width: `${PhoneMetrics.indexWidth}px`,
            height: `${PhoneMetrics.indexEntryHeight}px`,
            'font-family': HelveticaNeue,
            'font-size': `${PhoneMetrics.indexFontSize}px`,
            'font-weight': '700',
            color: PhonePalette.indexTint
          }}
          onClick={() => {
            if (letter !== 'Search' && !props.present.includes(letter)) return
            props.onSelect(letter)
          }}
        >
          <Show when={letter === 'Search'} fallback={letter}>
            <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
              <circle
                cx="4.4"
                cy="4.4"
                r="3.5"
                fill="none"
                stroke={PhonePalette.indexTint}
                stroke-width="1.4"
              />
              <path
                d="M7.1 7.1 L10.2 10.2"
                stroke={PhonePalette.indexTint}
                stroke-width="1.4"
                stroke-linecap="round"
              />
            </svg>
          </Show>
        </button>
      )}
    </For>
  </div>
)
