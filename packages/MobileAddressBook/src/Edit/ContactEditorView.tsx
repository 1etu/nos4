import { For, Show, createSignal } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIAlertView, UIBarButton, UIScrollView, UIStatusBar } from 'UIKit'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import type { ContactLabelledValue, ContactRecord } from '../Support/ContactsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const PhoneLabels = ['mobile', 'home', 'work', 'iPhone', 'main', 'other'] as const
const EmailLabels = ['home', 'work', 'other'] as const

interface Draft {
  readonly id: string
  readonly label: string
  readonly value: string
}

const blank = (prefix: string, label: string): Draft => ({
  id: `${prefix}-${Math.random().toString(36).slice(2, 8)}`,
  label,
  value: ''
})

const withTrailingBlank = (entries: readonly Draft[], prefix: string, label: string): Draft[] => {
  const last = entries[entries.length - 1]
  if (last && last.value.trim().length === 0) return [...entries]
  return [...entries, blank(prefix, label)]
}

const nextLabel = (labels: readonly string[], current: string): string =>
  labels[(labels.indexOf(current) + 1) % labels.length] ?? labels[0] ?? current

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
  entry: Draft
  placeholder: string
  inputMode: 'tel' | 'email'
  separator: boolean
  onLabel: () => void
  onInput: (value: string) => void
}) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${ContactsMetrics.cardRowHeight}px`,
      gap: '5px',
      'border-bottom': props.separator
        ? `${ContactsMetrics.cardStroke}px solid ${ContactsPalette.cardStroke}`
        : 'none'
    }}
  >
    <button
      type="button"
      class="shrink-0 text-right"
      style={{
        width: `${ContactsMetrics.labelColumnWidth}px`,
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.labelFontSize}px`,
        'font-weight': '700',
        color: ContactsPalette.label,
        'padding-left': '5px'
      }}
      onClick={props.onLabel}
    >
      {props.entry.label}
    </button>
    <div
      style={{
        width: `${ContactsMetrics.dividerWidth}px`,
        height: `${ContactsMetrics.cardRowHeight}px`,
        background: ContactsPalette.divider
      }}
    />
    <input
      type="text"
      inputMode={props.inputMode}
      value={props.entry.value}
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
    <Show when={props.entry.value.length > 0}>
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

const Indented = (props: { children: unknown }) => (
  <div class="flex">
    <div style={{ width: `${ContactsMetrics.addLeftIndent}px` }} />
    <div class="min-w-0 flex-1">{props.children as never}</div>
  </div>
)

const drafts = (entries: readonly ContactLabelledValue[]): Draft[] =>
  entries.map((entry) => ({ id: entry.id, label: entry.label, value: entry.value }))

const kept = (entries: readonly Draft[]): ContactLabelledValue[] =>
  entries
    .filter((entry) => entry.value.trim().length > 0)
    .map((entry) => ({ id: entry.id, label: entry.label, value: entry.value.trim() }))

export const ContactEditorView = (props: {
  contact: ContactRecord | undefined
  onCancel: () => void
  onSave: (contact: ContactRecord) => void
  onDelete: (contact: ContactRecord) => void
}) => {
  const existing = props.contact
  const id = existing?.id ?? `c${Date.now()}`
  const [first, setFirst] = createSignal(existing?.givenName ?? '')
  const [last, setLast] = createSignal(existing?.familyName ?? '')
  const [company, setCompany] = createSignal(existing?.company ?? '')
  const [phones, setPhones] = createSignal<Draft[]>(
    withTrailingBlank(drafts(existing?.phoneNumbers ?? []), `${id}-p`, PhoneLabels[0])
  )
  const [emails, setEmails] = createSignal<Draft[]>(
    withTrailingBlank(drafts(existing?.emailAddresses ?? []), `${id}-e`, EmailLabels[0])
  )
  const [confirming, setConfirming] = createSignal(false)

  const editEntry = (
    list: () => Draft[],
    set: (next: Draft[]) => void,
    prefix: string,
    fallback: string,
    entry: Draft,
    patch: Partial<Draft>
  ) => {
    const updated = list().map((item) => (item.id === entry.id ? { ...item, ...patch } : item))
    set(withTrailingBlank(updated, prefix, fallback))
  }

  const canSave = () =>
    [first(), last(), company()].some((value) => value.trim().length > 0)

  const save = () => {
    if (!canSave()) return
    props.onSave({
      id,
      givenName: first().trim(),
      familyName: last().trim(),
      company: company().trim(),
      phoneNumbers: kept(phones()),
      emailAddresses: kept(emails())
    })
  }

  return (
    <div class="relative flex h-full w-full flex-col" style={{ background: ContactsPalette.detailBackdrop }}>
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
        <UIBarButton title="Cancel" tone="blueGray" onClick={props.onCancel} />
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
          {existing ? 'Info' : 'New Contact'}
        </span>
        <div style={{ opacity: canSave() ? 1 : ContactsMetrics.disabledOpacity }}>
          <UIBarButton title="Done" tone="blue" onClick={save} />
        </div>
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
            <div
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
            </div>

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

          <Indented>
            <Card height={ContactsMetrics.cardRowHeight * phones().length}>
              <For each={phones()}>
                {(entry, at) => (
                  <LabelledField
                    entry={entry}
                    placeholder="Phone"
                    inputMode="tel"
                    separator={at() < phones().length - 1}
                    onLabel={() =>
                      editEntry(phones, setPhones, `${id}-p`, PhoneLabels[0], entry, {
                        label: nextLabel(PhoneLabels, entry.label)
                      })
                    }
                    onInput={(value) =>
                      editEntry(phones, setPhones, `${id}-p`, PhoneLabels[0], entry, { value })
                    }
                  />
                )}
              </For>
            </Card>
          </Indented>

          <Indented>
            <Card height={ContactsMetrics.cardRowHeight * emails().length}>
              <For each={emails()}>
                {(entry, at) => (
                  <LabelledField
                    entry={entry}
                    placeholder="Email"
                    inputMode="email"
                    separator={at() < emails().length - 1}
                    onLabel={() =>
                      editEntry(emails, setEmails, `${id}-e`, EmailLabels[0], entry, {
                        label: nextLabel(EmailLabels, entry.label)
                      })
                    }
                    onInput={(value) =>
                      editEntry(emails, setEmails, `${id}-e`, EmailLabels[0], entry, { value })
                    }
                  />
                )}
              </For>
            </Card>
          </Indented>

          <Show when={existing}>
            <div style={{ padding: `${ContactsMetrics.sectionSpacing}px ${ContactsMetrics.cardInsetX}px 0` }}>
              <button
                type="button"
                class="flex w-full items-center justify-center"
                style={{
                  height: `${ContactsMetrics.deleteButtonHeight}px`,
                  'border-radius': `${ContactsMetrics.cardRadius}px`,
                  background: ContactsPalette.deleteButton,
                  border: `1px solid ${ContactsPalette.deleteButtonStroke}`,
                  'box-shadow': 'inset 0 1px 0 rgba(255,255,255,0.35), 0 1px 0 rgba(255,255,255,0.6)'
                }}
                onClick={() => setConfirming(true)}
              >
                <span
                  style={{
                    'font-family': HelveticaNeue,
                    'font-size': `${ContactsMetrics.deleteFontSize}px`,
                    'font-weight': '700',
                    color: 'white',
                    'text-shadow': '0 -1px 0 rgba(0,0,0,0.5)'
                  }}
                >
                  Delete Contact
                </span>
              </button>
            </div>
          </Show>
        </div>
      </UIScrollView>

      <UIAlertView
        visible={confirming()}
        title="Delete Contact"
        message="This contact will be removed from your iPhone."
        alternateTitle="Delete"
        buttonTitle="Cancel"
        onAlternate={() => {
          setConfirming(false)
          if (existing) props.onDelete(existing)
        }}
        onDismiss={() => setConfirming(false)}
      />
    </div>
  )
}
