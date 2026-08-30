import { Show, createSignal } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIBarButton, UIScrollView, UIStatusBar } from 'UIKit'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import { addressBookAdd } from '../Support/ContactsStore'
import type { ContactRecord } from '../Support/ContactsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const NameField = (props: {
  placeholder: string
  value: string
  separator: boolean
  onInput: (value: string) => void
}) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${ContactsMetrics.cardRowHeight}px`,
      'border-bottom': props.separator
        ? `${ContactsMetrics.cardStroke}px solid ${ContactsPalette.cardStroke}`
        : 'none'
    }}
  >
    <input
      type="text"
      value={props.value}
      placeholder={props.placeholder}
      class="min-w-0 flex-1 bg-transparent outline-none"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.addFieldFontSize}px`,
        'font-weight': '700',
        color: 'black',
        'padding-left': `${ContactsMetrics.cardInsetX}px`
      }}
      onInput={(event) => props.onInput(event.currentTarget.value)}
    />
    <Show when={props.value.length > 0}>
      <button
        type="button"
        class="shrink-0"
        style={{ 'margin-right': `${ContactsMetrics.cardInsetX}px` }}
        onClick={() => props.onInput('')}
      >
        <CGImage name="UITextFieldClearButton" />
      </button>
    </Show>
  </div>
)

const LabelledField = (props: {
  label: string
  placeholder: string
  value: string
  onInput: (value: string) => void
}) => (
  <div
    class="flex w-full items-center"
    style={{ height: `${ContactsMetrics.cardRowHeight}px`, gap: '5px' }}
  >
    <span
      class="shrink-0 text-right"
      style={{
        width: `${ContactsMetrics.labelColumnWidth}px`,
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.labelFontSize}px`,
        'font-weight': '700',
        color: ContactsPalette.label,
        'padding-left': '5px'
      }}
    >
      {props.label}
    </span>
    <div
      style={{
        width: `${ContactsMetrics.dividerWidth}px`,
        height: `${ContactsMetrics.cardRowHeight}px`,
        background: ContactsPalette.divider
      }}
    />
    <input
      type="text"
      value={props.value}
      placeholder={props.placeholder}
      class="min-w-0 flex-1 bg-transparent outline-none"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.addFieldFontSize}px`,
        'font-weight': '700',
        color: 'black'
      }}
      onInput={(event) => props.onInput(event.currentTarget.value)}
    />
    <Show when={props.value.length > 0}>
      <button
        type="button"
        class="shrink-0"
        style={{ 'margin-right': `${ContactsMetrics.cardInsetX}px` }}
        onClick={() => props.onInput('')}
      >
        <CGImage name="UITextFieldClearButton" />
      </button>
    </Show>
  </div>
)

const Card = (props: { height: number; children: unknown }) => (
  <div
    class="overflow-hidden"
    style={{
      height: `${props.height}px`,
      background: 'white',
      'border-radius': `${ContactsMetrics.cardRadius}px`,
      border: `${ContactsMetrics.cardStroke}px solid ${ContactsPalette.cardStroke}`,
      'margin-right': `${ContactsMetrics.cardInsetX}px`
    }}
  >
    {props.children as never}
  </div>
)

export const AddContactView = (props: { onDismiss: () => void }) => {
  const [first, setFirst] = createSignal('')
  const [last, setLast] = createSignal('')
  const [company, setCompany] = createSignal('')
  const [phone, setPhone] = createSignal('')
  const [email, setEmail] = createSignal('')

  const save = () => {
    if (first().trim().length === 0 && last().trim().length === 0) return
    const id = `c${Date.now()}`
    const record: ContactRecord = {
      id,
      givenName: first().trim(),
      familyName: last().trim(),
      company: company().trim(),
      phoneNumbers:
        phone().trim().length > 0
          ? [{ id: `${id}-p0`, label: 'mobile', value: phone().trim() }]
          : [],
      emailAddresses:
        email().trim().length > 0
          ? [{ id: `${id}-e0`, label: 'home', value: email().trim() }]
          : []
    }
    addressBookAdd(record)
    props.onDismiss()
  }

  return (
    <div class="flex h-full w-full flex-col" style={{ background: ContactsPalette.detailBackdrop }}>
      <UIStatusBar style="inApp" />

      <div
        class="relative flex shrink-0 items-center justify-between"
        style={{
          height: `${ContactsMetrics.titleBarHeight}px`,
          background: ContactsPalette.titleBar,
          'border-bottom': `1px solid ${ContactsPalette.titleBarEdge}`,
          padding: '0 5px'
        }}
      >
        <UIBarButton title="Cancel" tone="blueGray" onClick={props.onDismiss} />
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
          New Contact
        </span>
        <UIBarButton title="Done" tone="blue" onClick={save} />
      </div>

      <UIScrollView class="flex-1">
        <div
          class="flex flex-col"
          style={{
            gap: `${ContactsMetrics.addCardGap}px`,
            'padding-top': `${ContactsMetrics.detailTopInset}px`,
            'padding-bottom': `${ContactsMetrics.sectionSpacing}px`
          }}
        >
          <div class="flex items-start">
            <button
              type="button"
              class="relative flex shrink-0 items-center justify-center"
              style={{
                width: `${ContactsMetrics.photoSize}px`,
                height: `${ContactsMetrics.photoSize}px`,
                margin: `0 ${ContactsMetrics.addPhotoInsetX}px`,
                'border-radius': `${ContactsMetrics.addPhotoRadius}px`,
                overflow: 'hidden'
              }}
            >
              <CGImage name="ABPictureDropWell" class="absolute inset-0" />
              <span
                class="relative flex flex-col items-center"
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${ContactsMetrics.labelFontSize}px`,
                  'font-weight': '700',
                  'line-height': '15px',
                  color: ContactsPalette.label
                }}
              >
                <span>add</span>
                <span>photo</span>
              </span>
            </button>

            <div class="min-w-0 flex-1">
              <Card height={ContactsMetrics.addNameCardHeight}>
                <NameField placeholder="First" value={first()} separator onInput={setFirst} />
                <NameField placeholder="Last" value={last()} separator onInput={setLast} />
                <NameField
                  placeholder="Company"
                  value={company()}
                  separator={false}
                  onInput={setCompany}
                />
              </Card>
            </div>
          </div>

          <div class="flex">
            <div style={{ width: `${ContactsMetrics.addLeftIndent}px` }} />
            <div class="min-w-0 flex-1">
              <Card height={ContactsMetrics.cardRowHeight}>
                <LabelledField
                  label="mobile"
                  placeholder="Phone"
                  value={phone()}
                  onInput={setPhone}
                />
              </Card>
            </div>
          </div>

          <div class="flex">
            <div style={{ width: `${ContactsMetrics.addLeftIndent}px` }} />
            <div class="min-w-0 flex-1">
              <Card height={ContactsMetrics.cardRowHeight}>
                <LabelledField
                  label="home"
                  placeholder="Email"
                  value={email()}
                  onInput={setEmail}
                />
              </Card>
            </div>
          </div>
        </div>
      </UIScrollView>
    </div>
  )
}
