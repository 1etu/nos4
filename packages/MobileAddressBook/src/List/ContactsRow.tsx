import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import type { ContactRecord } from '../Support/ContactsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const ContactsRow = (props: {
  contact: ContactRecord
  chevron?: boolean
  onOpen: (contact: ContactRecord) => void
}) => (
  <button
    type="button"
    class="flex w-full items-center"
    style={{
      height: `${ContactsMetrics.rowHeight}px`,
      background: 'white',
      'border-bottom': `${ContactsMetrics.rowSeparator}px solid ${ContactsPalette.rowSeparator}`
    }}
    onClick={() => props.onOpen(props.contact)}
  >
    <span
      class="min-w-0 flex-1"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.rowFontSize}px`,
        'line-height': `${ContactsMetrics.rowHeight}px`,
        color: 'black',
        'padding-left': `${ContactsMetrics.rowNameInset}px`,
        'padding-right': `${ContactsMetrics.rowNameTrailing}px`,
        'text-align': 'left',
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      <span style={{ 'font-weight': props.contact.familyName.length > 0 ? '600' : '700' }}>
        {props.contact.givenName.trim()}
      </span>
      <Show when={props.contact.familyName.length > 0}>
        <span style={{ 'font-weight': '600' }}> </span>
        <span style={{ 'font-weight': '700' }}>{props.contact.familyName}</span>
      </Show>
    </span>

    <Show when={props.chevron}>
      <div style={{ 'margin-right': `${ContactsMetrics.headerLetterInset}px` }}>
        <CGImage name="UITableNext" />
      </div>
    </Show>
  </button>
)
