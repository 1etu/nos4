import { Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { RectangleButton } from '../Browser/SafariToolBar'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'
import {
  beginEditing,
  clearField,
  safariBookmarkState,
  safariBookmarkText,
  setFieldText
} from '../Support/SafariEditing'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const rowText = {
  'font-family': HelveticaNeue,
  'font-size': `${MobileSafariMetrics.addBookmarkFontSize}px`,
  'font-weight': '400',
  'white-space': 'nowrap',
  overflow: 'hidden',
  'text-overflow': 'ellipsis'
} as const

const GroupBox = (props: { height: number; children: JSX.Element }) => (
  <div style={{ padding: `0 ${MobileSafariMetrics.addBookmarkInsetX}px` }}>
    <div
      class="flex flex-col overflow-hidden"
      style={{
        height: `${props.height}px`,
        'border-radius': `${MobileSafariMetrics.addBookmarkRadius}px`,
        background: 'white',
        border: `${MobileSafariMetrics.addBookmarkStroke}px solid ${MobileSafariPalette.groupStroke}`
      }}
    >
      {props.children}
    </div>
  </div>
)

const GroupRow = (props: { separator?: boolean; children: JSX.Element }) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      height: `${MobileSafariMetrics.addBookmarkFieldHeight}px`,
      padding: `0 ${MobileSafariMetrics.addBookmarkInsetX}px`,
      'border-bottom': props.separator
        ? `${MobileSafariMetrics.addBookmarkStroke}px solid ${MobileSafariPalette.groupStroke}`
        : 'none'
    }}
  >
    {props.children}
  </div>
)

export const SafariAddBookmark = (props: {
  url: string
  onCancel: () => void
  onSave: (name: string) => void
}) => {
  const save = () => props.onSave(safariBookmarkText())

  return (
    <div class="flex h-full w-full flex-col">
      <div style={{ height: `${MobileSafariMetrics.statusBarHeight}px`, 'flex-shrink': '0' }} />

      <div
        class="relative flex flex-1 flex-col overflow-hidden"
        style={{ background: MobileSafariPalette.pinstripe }}
      >
        <div
          class="relative flex shrink-0 items-center justify-center"
          style={{
            height: `${MobileSafariMetrics.titleBarHeight}px`,
            background: MobileSafariPalette.titleBar,
            'border-bottom': `1px solid ${MobileSafariPalette.barEdge}`,
            'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)'
          }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MobileSafariMetrics.bookmarksTitleFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
            }}
          >
            Add Bookmark
          </span>
          <div class="absolute" style={{ left: `${MobileSafariMetrics.toolBarButtonInset}px` }}>
            <RectangleButton label="Cancel" tone="blueGray" onClick={props.onCancel} />
          </div>
          <div class="absolute" style={{ right: `${MobileSafariMetrics.toolBarButtonInset}px` }}>
            <RectangleButton label="Save" tone="blue" onClick={save} />
          </div>
        </div>

        <UIScrollView class="flex flex-1 flex-col">
          <div
            style={{
              height: `${MobileSafariMetrics.addBookmarkSpacing}px`,
              'flex-shrink': '0'
            }}
          />

          <GroupBox height={MobileSafariMetrics.addBookmarkGroupHeight}>
            <GroupRow separator>
              <input
                value={safariBookmarkText()}
                placeholder="Title"
                onInput={(event) => setFieldText('bookmark', event.currentTarget.value)}
                onFocus={() => beginEditing('bookmark')}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') save()
                }}
                style={{
                  ...rowText,
                  flex: '1',
                  'min-width': '0',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: MobileSafariPalette.groupValue
                }}
              />
              <Show when={safariBookmarkState() !== 'None' && safariBookmarkText().length > 0}>
                <button
                  type="button"
                  class="flex shrink-0"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => clearField('bookmark')}
                >
                  <CGImage name="UITextFieldClearButton" />
                </button>
              </Show>
            </GroupRow>

            <GroupRow>
              <span style={{ ...rowText, color: MobileSafariPalette.groupDetail }}>
                {props.url}
              </span>
            </GroupRow>
          </GroupBox>

          <div
            style={{
              height: `${MobileSafariMetrics.addBookmarkSpacing}px`,
              'flex-shrink': '0'
            }}
          />

          <GroupBox height={MobileSafariMetrics.addBookmarkFieldHeight}>
            <GroupRow>
              <span style={{ ...rowText, color: MobileSafariPalette.groupValue }}>Bookmarks</span>
              <div class="flex-1" />
              <CGImage name="UITableNext" />
            </GroupRow>
          </GroupBox>
        </UIScrollView>
      </div>
    </div>
  )
}
