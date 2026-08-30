import { For, Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView, UITableGroup, UITablePalette, UITableRow } from 'UIKit'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { cnContactName, type CNContact, type CNLabeledValue } from '../Support/ContactStore'

const FieldLabel = (props: { text: string }) => (
  <span
    class="shrink-0 text-right"
    style={{
      width: `${PhoneMetrics.infoLabelWidth}px`,
      'font-family': HelveticaNeue,
      'font-size': `${PhoneMetrics.infoLabelFontSize}px`,
      'font-weight': '700',
      color: PhonePalette.rowDetail,
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

const FieldValue = (props: { text: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${PhoneMetrics.infoValueFontSize}px`,
      'font-weight': '700',
      color: 'black',
      'padding-left': `${PhoneMetrics.infoValueLeading}px`,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis'
    }}
  >
    {props.text}
  </span>
)

const CallGroup = (props: {
  entries: readonly CNLabeledValue[]
  onCall: (entry: CNLabeledValue) => void
}) => (
  <UITableGroup>
    <For each={props.entries}>
      {(entry, at) => (
        <UITableRow separator={at() < props.entries.length - 1}>
          <button
            type="button"
            class="flex h-full w-full items-center"
            onClick={() => props.onCall(entry)}
          >
            <FieldLabel text={entry.label} />
            <FieldValue text={entry.value} />
          </button>
        </UITableRow>
      )}
    </For>
  </UITableGroup>
)

const ValueGroup = (props: { entries: readonly CNLabeledValue[] }) => (
  <UITableGroup>
    <For each={props.entries}>
      {(entry, at) => (
        <UITableRow separator={at() < props.entries.length - 1}>
          <FieldLabel text={entry.label} />
          <FieldValue text={entry.value} />
        </UITableRow>
      )}
    </For>
  </UITableGroup>
)

const ActionGroup = (props: { first: string; second: string }) => (
  <div class="flex-1">
    <UITableGroup>
      <UITableRow>
        <div class="flex w-full flex-col items-center justify-center">
          <For each={[props.first, props.second]}>
            {(line) => (
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${PhoneMetrics.infoActionFontSize}px`,
                  'font-weight': '700',
                  color: PhonePalette.rowDetail,
                  'white-space': 'nowrap'
                }}
              >
                {line}
              </span>
            )}
          </For>
        </div>
      </UITableRow>
    </UITableGroup>
  </div>
)

const Gap = (): JSX.Element => <div style={{ height: `${PhoneMetrics.infoSectionGap}px` }} />

export const ContactInfoView = (props: {
  contact: CNContact
  onCall: (entry: CNLabeledValue) => void
}) => (
  <UIScrollView
    class="min-h-0 flex-1"
    style={{ background: UITablePalette.pinstripe }}
  >
    <div class="flex items-center" style={{ 'padding-top': `${PhoneMetrics.infoTopPadding}px` }}>
      <CGImage
        name="ABPicturePerson"
        style={{ 'margin-left': `${PhoneMetrics.infoAvatarLeading}px` }}
      />
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhoneMetrics.infoNameFontSize}px`,
          'font-weight': '700',
          color: 'black',
          'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)',
          'padding-left': `${PhoneMetrics.infoNameLeading}px`,
          'white-space': 'nowrap'
        }}
      >
        {cnContactName(props.contact)}
      </span>
    </div>

    <Gap />
    <Show when={props.contact.phoneNumbers.length > 0}>
      <CallGroup entries={props.contact.phoneNumbers} onCall={props.onCall} />
      <Gap />
    </Show>
    <Show when={props.contact.emailAddresses.length > 0}>
      <ValueGroup entries={props.contact.emailAddresses} />
      <Gap />
    </Show>
    <Show when={props.contact.urlAddresses.length > 0}>
      <ValueGroup entries={props.contact.urlAddresses} />
      <Gap />
    </Show>

    <div class="flex">
      <ActionGroup first="Text" second="Message" />
      <ActionGroup first="Share" second="Contact" />
      <ActionGroup first="Add to" second="Favorites" />
    </div>
  </UIScrollView>
)
