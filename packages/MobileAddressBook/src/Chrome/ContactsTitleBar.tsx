import { Show } from 'solid-js'
import { CGImage, assetURL } from 'CoreGraphics'
import { UIBarButton } from 'UIKit'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const BackButton = (props: { onClick: () => void }) => (
  <button
    type="button"
    class="relative flex shrink-0 items-center"
    style={{
      width: `${ContactsMetrics.backButtonWidth}px`,
      height: `${ContactsMetrics.backButtonHeight}px`,
      'margin-left': `${ContactsMetrics.backInset}px`,
      'background-image': `url(${assetURL('Button_wp5')})`,
      'background-size': '100% 100%'
    }}
    onClick={props.onClick}
  >
    <span
      class="flex-1 text-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.backFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
        'padding-left': '5px',
        'max-width': `${ContactsMetrics.backLabelMaxWidth}px`,
        'white-space': 'nowrap',
        overflow: 'hidden'
      }}
    >
      All Contacts
    </span>
  </button>
)

export const ContactsTitleBar = (props: {
  title: string
  showBack: boolean
  showPlus: boolean
  onBack: () => void
  onAdd: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${ContactsMetrics.titleBarHeight}px`,
      background: ContactsPalette.titleBar,
      'border-bottom': `1px solid ${ContactsPalette.titleBarEdge}`,
      'box-shadow': `inset 0 -1px 0 ${ContactsPalette.titleBarHighlight}`
    }}
  >
    <Show when={props.showBack}>
      <BackButton onClick={props.onBack} />
    </Show>

    <span
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
      }}
    >
      {props.title}
    </span>

    <Show when={props.showBack}>
      <div class="ml-auto" style={{ 'margin-right': `${ContactsMetrics.editInset}px` }}>
        <UIBarButton title=" Edit " tone="blueGray" onClick={() => undefined} />
      </div>
    </Show>

    <Show when={props.showPlus}>
      <button
        type="button"
        class="ml-auto flex shrink-0 items-center justify-center"
        style={{
          height: `${ContactsMetrics.cancelHeight}px`,
          padding: '0 11px',
          'margin-right': `${ContactsMetrics.plusInset}px`,
          'border-radius': '5.5px',
          background:
            'linear-gradient(180deg, rgb(164,175,191) 0%, rgb(124,141,164) 51%, rgb(113,131,156) 51%, rgb(112,130,155) 100%)',
          'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
        }}
        onClick={props.onAdd}
      >
        <CGImage name="UIButtonBarPlus" style={{ width: '13px', height: 'auto' }} />
      </button>
    </Show>
  </div>
)
