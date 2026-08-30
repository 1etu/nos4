import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { ContactsMetrics, ContactsPalette } from '../Support/ContactsMetrics'
import { contactDisplayName } from '../Support/ContactsStore'
import type { ContactLabelledValue, ContactRecord } from '../Support/ContactsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Actions: readonly (readonly [string, string])[] = [
  ['Text', 'Message'],
  ['Share', 'Contact'],
  ['Add to', 'Favorites']
]

const Card = (props: { rows: number; children: unknown }) => (
  <div style={{ padding: `0 ${ContactsMetrics.cardInsetX}px` }}>
    <div
      class="overflow-hidden"
      style={{
        background: 'white',
        'border-radius': `${ContactsMetrics.cardRadius}px`,
        border: `${ContactsMetrics.cardStroke}px solid ${ContactsPalette.cardStroke}`,
        height: `${props.rows * ContactsMetrics.cardRowHeight}px`
      }}
    >
      {props.children as never}
    </div>
  </div>
)

const ValueRow = (props: { entry: ContactLabelledValue; separator: boolean }) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${ContactsMetrics.cardRowHeight}px`,
      'border-bottom': props.separator
        ? `${ContactsMetrics.cardStroke}px solid ${ContactsPalette.cardStroke}`
        : 'none'
    }}
  >
    <span
      class="shrink-0 text-right"
      style={{
        width: `${ContactsMetrics.labelColumnWidth}px`,
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.labelFontSize}px`,
        'font-weight': '700',
        color: ContactsPalette.label
      }}
    >
      {props.entry.label}
    </span>
    <span
      class="min-w-0"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${ContactsMetrics.valueFontSize}px`,
        'font-weight': '700',
        color: 'black',
        'margin-left': `${ContactsMetrics.valueInset + 8}px`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.entry.value}
    </span>
  </div>
)

export const ContactsDetail = (props: { contact: ContactRecord }) => (
  <div class="relative h-full w-full" style={{ background: ContactsPalette.detailBackdrop }}>
    <div
      class="pointer-events-none absolute inset-0"
      style={{
        background: `repeating-linear-gradient(to right, ${ContactsPalette.detailStripe} 0 ${ContactsMetrics.backgroundLineWidth}px, transparent ${ContactsMetrics.backgroundLineWidth}px ${ContactsMetrics.backgroundLineSpacing}px)`
      }}
    />

    <UIScrollView class="relative h-full w-full">
      <div
        class="flex flex-col"
        style={{
          gap: `${ContactsMetrics.sectionSpacing}px`,
          'padding-top': `${ContactsMetrics.detailTopInset}px`,
          'padding-bottom': `${ContactsMetrics.sectionSpacing}px`
        }}
      >
        <div class="flex items-center" style={{ 'padding-left': `${ContactsMetrics.photoInset}px` }}>
          <div
            class="relative shrink-0"
            style={{
              width: `${ContactsMetrics.photoFrameWidth}px`,
              height: `${ContactsMetrics.photoFrameHeight}px`,
              background: ContactsPalette.photoBacking
            }}
          >
            <CGImage name="ABPicturePerson" class="absolute inset-0" />
            <CGImage name="ABPictureOutline" class="absolute inset-0" />
          </div>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${ContactsMetrics.detailNameFontSize}px`,
              'font-weight': '700',
              color: 'black',
              'text-shadow': ContactsPalette.nameShadow,
              'margin-left': `${ContactsMetrics.detailNameInset}px`
            }}
          >
            {contactDisplayName(props.contact)}
          </span>
        </div>

        <Show when={props.contact.phoneNumbers.length > 0}>
          <Card rows={props.contact.phoneNumbers.length}>
            <For each={props.contact.phoneNumbers}>
              {(entry, at) => (
                <ValueRow
                  entry={entry}
                  separator={at() < props.contact.phoneNumbers.length - 1}
                />
              )}
            </For>
          </Card>
        </Show>

        <Show when={props.contact.emailAddresses.length > 0}>
          <Card rows={props.contact.emailAddresses.length}>
            <For each={props.contact.emailAddresses}>
              {(entry, at) => (
                <ValueRow
                  entry={entry}
                  separator={at() < props.contact.emailAddresses.length - 1}
                />
              )}
            </For>
          </Card>
        </Show>

        <div class="flex">
          <For each={Actions}>
            {(action) => (
              <div class="flex-1">
                <Card rows={1}>
                  <div class="flex h-full w-full flex-col items-center justify-center">
                    <For each={action}>
                      {(line) => (
                        <span
                          style={{
                            'font-family': HelveticaNeue,
                            'font-size': `${ContactsMetrics.actionFontSize}px`,
                            'font-weight': '700',
                            'line-height': '17px',
                            color: ContactsPalette.label
                          }}
                        >
                          {line}
                        </span>
                      )}
                    </For>
                  </div>
                </Card>
              </div>
            )}
          </For>
        </div>
      </div>
    </UIScrollView>
  </div>
)
