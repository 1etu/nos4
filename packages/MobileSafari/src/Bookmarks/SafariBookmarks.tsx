import { createSignal, For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { RectangleButton } from '../Browser/SafariToolBar'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'
import { removeBookmark, webBookmarks } from '../Support/MobileSafariService'
import { UIScrollView } from 'UIKit'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const editAnimation = caAnimation(
  MobileSafariMetrics.defaultDuration,
  CAMediaTimingFunction.easeInOut
)

const revealAnimation = caAnimation(
  MobileSafariMetrics.deleteRevealDuration,
  CAMediaTimingFunction.linear
)

const RowTitle = (props: { text: string; trailing: number }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileSafariMetrics.rowFontSize}px`,
      'font-weight': '700',
      color: 'black',
      'padding-left': `${MobileSafariMetrics.rowTitleLeading}px`,
      'padding-right': `${props.trailing}px`,
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis'
    }}
  >
    {props.text}
  </span>
)

const Separator = () => (
  <div
    style={{
      height: `${MobileSafariMetrics.hairline}px`,
      background: MobileSafariPalette.rowSeparator
    }}
  />
)

const IconSlot = (props: { name: 'Bookmark' | 'HistoryFolder' }) => (
  <div
    class="relative shrink-0 self-stretch"
    style={{ width: `${MobileSafariMetrics.rowIconSize}px` }}
  >
    <CGImage
      name={props.name}
      class="absolute top-1/2 left-1/2"
      style={{ transform: 'translate(-50%, -50%)', 'max-width': 'none' }}
    />
  </div>
)

const BookmarksTitleBar = (props: { showDone: boolean; onDone: () => void }) => (
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
      Bookmarks
    </span>
    <div
      class="absolute"
      style={{
        right: `${MobileSafariMetrics.toolBarButtonInset}px`,
        opacity: `${props.showDone ? 1 : 0}`,
        'pointer-events': props.showDone ? 'auto' : 'none',
        transition: caTransition(['opacity'], editAnimation)
      }}
    >
      <RectangleButton label="Done" tone="blue" onClick={props.onDone} />
    </div>
  </div>
)

export const SafariBookmarks = (props: {
  editing: boolean
  onOpen: (url: string) => void
  onDone: () => void
}) => {
  const [toDelete, setToDelete] = createSignal('')

  const entries = () => Object.entries(webBookmarks()).sort((a, b) => (a[0] < b[0] ? -1 : 1))

  const rowStyle = () => ({
    height: `${MobileSafariMetrics.rowHeight - MobileSafariMetrics.hairline}px`,
    'padding-left': `${MobileSafariMetrics.rowLeading + 1}px`,
    gap: `${MobileSafariMetrics.rowSpacing}px`
  })

  return (
    <div class="flex h-full w-full flex-col">
      <div style={{ height: `${MobileSafariMetrics.statusBarHeight}px`, 'flex-shrink': '0' }} />

      <BookmarksTitleBar showDone={!props.editing} onDone={props.onDone} />

      <UIScrollView class="flex-1" style={{ background: 'white' }}>
        <div class="flex items-center" style={rowStyle()}>
          <IconSlot name="HistoryFolder" />
          <RowTitle text="History" trailing={MobileSafariMetrics.historyTitleTrailing} />
          <div class="flex-1" />
          <div style={{ 'padding-right': `${MobileSafariMetrics.chevronTrailing}px` }}>
            <CGImage name="UITableNext" />
          </div>
        </div>
        <Separator />

        <For each={entries()}>
          {([url, title]) => (
            <>
              <div class="flex items-center overflow-hidden" style={rowStyle()}>
                <div
                  class="flex shrink-0 items-center overflow-hidden"
                  style={{
                    width: props.editing ? `${MobileSafariMetrics.minusSlotWidth}px` : '0px',
                    'margin-left': props.editing
                      ? `${MobileSafariMetrics.minusOffsetX}px`
                      : `${-MobileSafariMetrics.rowSpacing}px`,
                    opacity: `${props.editing ? 1 : 0}`,
                    transition: caTransition(['width', 'margin-left', 'opacity'], editAnimation)
                  }}
                >
                  <button
                    type="button"
                    class="relative flex shrink-0 items-center justify-center"
                    onClick={() => setToDelete(toDelete() === url ? '' : url)}
                  >
                    <CGImage name="UIRemoveControlMinus" />
                    <span
                      class="absolute"
                      style={{
                        color: 'white',
                        'font-size': '15px',
                        'font-weight': '900',
                        'line-height': '1',
                        transform: `translateY(${toDelete() === url ? -1.3 : -2}px) rotate(${toDelete() === url ? -90 : 0}deg)`,
                        transition: caTransition(['transform'], revealAnimation)
                      }}
                    >
                      —
                    </span>
                  </button>
                </div>

                <IconSlot name="Bookmark" />

                <button
                  type="button"
                  class="flex min-w-0 items-center"
                  onClick={() => props.onOpen(url)}
                >
                  <RowTitle text={title} trailing={MobileSafariMetrics.bookmarkTitleTrailing} />
                </button>

                <div class="flex-1" />

                <div
                  class="flex shrink-0 items-center"
                  style={{
                    opacity: `${toDelete() === url ? 1 : 0}`,
                    'pointer-events': toDelete() === url ? 'auto' : 'none',
                    'padding-right': `${MobileSafariMetrics.bookmarkTitleTrailing}px`,
                    transform:
                      toDelete() === url
                        ? 'translateX(0)'
                        : `translateX(calc(100% + ${MobileSafariMetrics.bookmarkTitleTrailing}px))`,
                    transition: caTransition(['transform', 'opacity'], revealAnimation)
                  }}
                >
                  <RectangleButton
                    label="Delete"
                    tone="red"
                    onClick={() => {
                      removeBookmark(url)
                      setToDelete('')
                    }}
                  />
                </div>
              </div>
              <Separator />
            </>
          )}
        </For>
      </UIScrollView>

      <div style={{ height: `${MobileSafariMetrics.toolBarHeight}px`, 'flex-shrink': '0' }} />
    </div>
  )
}
