import { Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIBarButton, UINavigationBar, UIScrollView, UITablePalette } from 'UIKit'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import {
  contactDraft,
  contactEditorFocus,
  focusContactField,
  setContactField,
  type CNEditorField
} from '../Support/ContactEditor'

const FieldCaret = () => (
  <div
    class="shrink-0"
    style={{
      width: `${PhoneMetrics.caretWidth}px`,
      height: `${PhoneMetrics.caretHeight}px`,
      background: PhonePalette.caret
    }}
  />
)

const FieldText = (props: { field: CNEditorField; placeholder: string }) => (
  <>
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.editorFieldFontSize}px`,
        'font-weight': '700',
        color: contactDraft()[props.field] === '' ? PhonePalette.subtitle : 'black',
        'white-space': 'nowrap',
        overflow: 'hidden'
      }}
    >
      {contactDraft()[props.field] === '' ? props.placeholder : contactDraft()[props.field]}
    </span>
    <Show when={contactEditorFocus() === props.field}>
      <FieldCaret />
    </Show>
  </>
)

const ClearButton = (props: { field: CNEditorField }) => (
  <Show when={contactDraft()[props.field] !== ''}>
    <button
      type="button"
      class="flex shrink-0 items-center"
      style={{ 'padding-right': `${PhoneMetrics.editorFieldLeading}px` }}
      onClick={() => setContactField(props.field, '')}
    >
      <CGImage name="UITextFieldClearButton" />
    </button>
  </Show>
)

const FieldGroup = (props: { height: number; children: JSX.Element }) => (
  <div
    class="flex"
    style={{
      'padding-left': `${PhoneMetrics.editorIndent}px`,
      'padding-right': `${PhoneMetrics.editorGroupTrailing}px`
    }}
  >
    <div
      class="flex flex-1 flex-col overflow-hidden"
      style={{
        height: `${props.height}px`,
        'border-radius': `${PhoneMetrics.groupRadius}px`,
        background: 'white',
        border: `${PhoneMetrics.groupStroke}px solid ${PhonePalette.groupStroke}`
      }}
    >
      {props.children}
    </div>
  </div>
)

const PlainField = (props: {
  field: CNEditorField
  placeholder: string
  separator: boolean
}) => (
  <button
    type="button"
    class="flex w-full items-center"
    style={{
      height: `${PhoneMetrics.groupRowHeight}px`,
      'border-bottom': props.separator
        ? `${PhoneMetrics.groupStroke}px solid ${PhonePalette.groupStroke}`
        : 'none',
      'padding-left': `${PhoneMetrics.editorFieldLeading}px`
    }}
    onClick={() => focusContactField(props.field)}
  >
    <div class="flex min-w-0 flex-1 items-center">
      <FieldText field={props.field} placeholder={props.placeholder} />
    </div>
    <ClearButton field={props.field} />
  </button>
)

const FieldLabel = (props: { text: string }) => (
  <span
    class="shrink-0 text-right"
    style={{
      width: `${PhoneMetrics.editorLabelWidth}px`,
      'padding-left': `${PhoneMetrics.editorLabelLeading}px`,
      'font-family': HelveticaNeue,
      'font-size': `${PhoneMetrics.editorLabelFontSize}px`,
      'font-weight': '700',
      color: PhonePalette.rowDetail,
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

const FieldDivider = (props: { visible: boolean }) => (
  <div
    class="shrink-0 self-stretch"
    style={{
      width: `${PhoneMetrics.editorDividerWidth}px`,
      background: props.visible ? PhonePalette.fieldDivider : 'transparent'
    }}
  />
)

const LabeledField = (props: {
  label: string
  field: CNEditorField
  placeholder: string
  separator: boolean
}) => (
  <button
    type="button"
    class="flex w-full items-center"
    style={{
      height: `${PhoneMetrics.groupRowHeight}px`,
      gap: `${PhoneMetrics.editorRowSpacing}px`,
      'border-bottom': props.separator
        ? `${PhoneMetrics.groupStroke}px solid ${PhonePalette.groupStroke}`
        : 'none'
    }}
    onClick={() => focusContactField(props.field)}
  >
    <FieldLabel text={props.label} />
    <FieldDivider visible={true} />
    <div class="flex min-w-0 flex-1 items-center">
      <FieldText field={props.field} placeholder={props.placeholder} />
    </div>
    <ClearButton field={props.field} />
  </button>
)

const ToneRow = (props: { label: string; separator: boolean }) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${PhoneMetrics.groupRowHeight}px`,
      gap: `${PhoneMetrics.editorRowSpacing}px`,
      'border-bottom': props.separator
        ? `${PhoneMetrics.groupStroke}px solid ${PhonePalette.groupStroke}`
        : 'none'
    }}
  >
    <FieldLabel text={props.label} />
    <FieldDivider visible={false} />
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.editorFieldFontSize}px`,
        'font-weight': '700',
        color: 'black'
      }}
    >
      Default
    </span>
  </div>
)

const GroupGap = () => <div style={{ height: `${PhoneMetrics.editorGroupGap}px` }} />

export const AddContactView = (props: {
  title: string
  onCancel: () => void
  onSave: () => void
}) => (
  <div class="flex h-full w-full flex-col" style={{ background: UITablePalette.pinstripe }}>
    <UINavigationBar
      title={props.title}
      leading={<UIBarButton title="Cancel" tone="blueGray" onClick={() => props.onCancel()} />}
      trailing={<UIBarButton title="Done" tone="blue" onClick={() => props.onSave()} />}
    />

    <UIScrollView class="min-h-0 flex-1">
      <div
        class="flex items-start"
        style={{
          'padding-top': `${PhoneMetrics.editorTopPadding}px`,
          'padding-right': `${PhoneMetrics.editorGroupTrailing}px`
        }}
      >
        <div
          class="relative flex shrink-0 items-center justify-center"
          style={{ margin: `0 ${PhoneMetrics.editorPhotoInsetX}px` }}
        >
          <CGImage
            name="ABPictureDropWell"
            style={{ 'border-radius': `${PhoneMetrics.editorPhotoRadius}px` }}
          />
          <div
            class="absolute flex flex-col items-center"
            style={{ gap: `${PhoneMetrics.editorPhotoLabelSpacing}px` }}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PhoneMetrics.editorPhotoLabelFontSize}px`,
                'font-weight': '700',
                color: PhonePalette.rowDetail
              }}
            >
              add
            </span>
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${PhoneMetrics.editorPhotoLabelFontSize}px`,
                'font-weight': '700',
                color: PhonePalette.rowDetail
              }}
            >
              photo
            </span>
          </div>
        </div>

        <div
          class="flex flex-1 flex-col overflow-hidden"
          style={{
            height: `${PhoneMetrics.groupRowHeight * 3}px`,
            'border-radius': `${PhoneMetrics.groupRadius}px`,
            background: 'white',
            border: `${PhoneMetrics.groupStroke}px solid ${PhonePalette.groupStroke}`
          }}
        >
          <PlainField field="first" placeholder="First" separator={true} />
          <PlainField field="last" placeholder="Last" separator={true} />
          <PlainField field="company" placeholder="Company" separator={false} />
        </div>
      </div>

      <GroupGap />
      <FieldGroup height={PhoneMetrics.groupRowHeight}>
        <LabeledField label="mobile" field="phone" placeholder="Phone" separator={false} />
      </FieldGroup>

      <GroupGap />
      <FieldGroup height={PhoneMetrics.groupRowHeight}>
        <LabeledField label="home" field="email" placeholder="Email" separator={false} />
      </FieldGroup>

      <GroupGap />
      <FieldGroup height={PhoneMetrics.groupRowHeight * 2}>
        <ToneRow label="ringtone" separator={true} />
        <ToneRow label="text tone" separator={false} />
      </FieldGroup>

      <GroupGap />
      <FieldGroup height={PhoneMetrics.groupRowHeight}>
        <LabeledField label="home page" field="url" placeholder="URL" separator={false} />
      </FieldGroup>

      <GroupGap />
    </UIScrollView>
  </div>
)
