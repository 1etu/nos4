import { UIBarButton, UINavigationBarMetrics, UINavigationBarPalette } from 'UIKit'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { ContactList } from '../Contacts/ContactList'
import type { CNContact } from '../Support/ContactStore'

export const AddFavoriteView = (props: {
  onCancel: () => void
  onSelect: (contact: CNContact) => void
}) => (
  <div class="flex h-full w-full flex-col" style={{ background: 'white' }}>
    <div
      class="relative flex w-full shrink-0 flex-col items-center"
      style={{
        height: `${PhoneMetrics.doubleTitleBarHeight}px`,
        background: UINavigationBarPalette.default,
        'border-bottom': `1px solid ${UINavigationBarPalette.edge}`,
        'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)',
        'padding-top': `${PhoneMetrics.doubleTitleTopPaddingTop}px`
      }}
    >
      <span
        class="text-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhoneMetrics.doubleTitleTopFontSize}px`,
          color: PhonePalette.doubleTitleTop,
          'text-shadow': '0 0.66px 0 rgba(255,255,255,0.65)',
          padding: `0 ${PhoneMetrics.doubleTitleTopInsetX}px`
        }}
      >
        Choose a contact to add to Favorites
      </span>

      <div class="flex flex-1 items-center">
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${UINavigationBarMetrics.titleFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
          }}
        >
          All Contacts
        </span>
      </div>

      <div
        class="absolute"
        style={{
          right: `${PhoneMetrics.doubleTitleCancelTrailing}px`,
          bottom: `${PhoneMetrics.doubleTitleCancelBottom}px`
        }}
      >
        <UIBarButton title="Cancel" tone="blueGray" onClick={() => props.onCancel()} />
      </div>
    </div>

    <div class="min-h-0 flex-1">
      <ContactList onSelect={props.onSelect} />
    </div>
  </div>
)
