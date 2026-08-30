import { createSignal, Index, onMount, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { UIStatusBar } from 'UIKit'
import { UIKeyboardSearch, UIKeyboardURL, UIKeyboardView } from 'TextInput'
import {
  deleteBackward,
  endEditing,
  focusedField,
  insertText,
  isEditingChrome,
  resetQuery,
  safariQueryText,
  safariUrlText,
  startBookmarkName,
  syncUrlText
} from '../Support/SafariEditing'
import { SafariAddBookmark } from '../Bookmarks/SafariAddBookmark'
import { SafariBookmarks } from '../Bookmarks/SafariBookmarks'
import { SafariShareSheet } from '../Sharing/SafariShareSheet'
import { SafariTitleBar } from '../Browser/SafariTitleBar'
import { SafariToolBar } from '../Browser/SafariToolBar'
import { WebContentView } from '../Browser/WebContentView'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'
import {
  addBookmark,
  addPage,
  canGoBack,
  canGoForward,
  closePage,
  currentPage,
  goBack,
  goForward,
  isBlank,
  navigate,
  pageIndex,
  probeProxy,
  reload,
  reportLocation,
  reportProgress,
  reportTitle,
  resolveEntry,
  searchURL,
  setPageIndex,
  webPages
} from '../Support/MobileSafariService'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const tabAnimation = caAnimation(
  MobileSafariMetrics.tabSwitchDuration,
  CAMediaTimingFunction.linear
)

const sheetAnimation = caAnimation(
  MobileSafariMetrics.defaultDuration,
  CAMediaTimingFunction.easeInOut
)

const closeAnimation = caAnimation(
  MobileSafariMetrics.closeFadeDuration,
  CAMediaTimingFunction.linear
)

export const MobileSafariApp = (props: { width: number; height: number }) => {
  const [selectingTab, setSelectingTab] = createSignal(false)
  const [showBookmarks, setShowBookmarks] = createSignal(false)
  const [editingBookmarks, setEditingBookmarks] = createSignal(false)
  const [showShare, setShowShare] = createSignal(false)
  const [showSaveBookmark, setShowSaveBookmark] = createSignal(false)
  const [scrollY, setScrollY] = createSignal(0)
  const [closing, setClosing] = createSignal<string | undefined>()
  const [newPageGuard, setNewPageGuard] = createSignal(false)

  onMount(() => {
    void probeProxy()
  })

  const webHeight = () =>
    props.height - MobileSafariMetrics.statusBarHeight - MobileSafariMetrics.toolBarHeight

  const clamp = () =>
    selectingTab() ? MobileSafariMetrics.tabClamp : MobileSafariMetrics.browseClamp

  const chromeOffset = () => -Math.min(scrollY(), MobileSafariMetrics.tabClamp)

  const spacerOffset = () => -Math.min(scrollY(), clamp())

  const mode = (): 'browse' | 'tabs' | 'bookmarks' => {
    if (showBookmarks()) return 'bookmarks'
    if (selectingTab()) return 'tabs'
    return 'browse'
  }

  const enterTabs = () => {
    setScrollY(0)
    setSelectingTab(true)
  }

  const newPage = () => {
    if (newPageGuard()) return
    setNewPageGuard(true)
    addPage()
    caAfter(MobileSafariMetrics.newPageMoveDelay, () => setPageIndex(webPages().length - 1))
    caAfter(MobileSafariMetrics.newPageTabDelay, () => setSelectingTab(true))
    caAfter(MobileSafariMetrics.newPageReleaseDelay, () => setNewPageGuard(false))
  }

  const close = (id: string) => {
    setClosing(id)
    caAfter(MobileSafariMetrics.closeCommitDelay, () => {
      closePage(id)
      setClosing(undefined)
    })
  }

  const openURL = (raw: string) => {
    const target = resolveEntry(raw)
    navigate(target)
    syncUrlText(target)
    setScrollY(0)
  }

  const keyboardConfiguration = () =>
    focusedField() === 'url'
      ? UIKeyboardURL(safariUrlText().length > 0)
      : UIKeyboardSearch(safariQueryText().length > 0)

  const submitField = () => {
    const field = focusedField()
    if (field === 'url') {
      openURL(safariUrlText())
      endEditing()
      return
    }
    if (field === 'query') {
      navigate(searchURL(safariQueryText()))
      setScrollY(0)
      resetQuery()
      endEditing()
    }
  }

  const tabTitle = () => (currentPage().title.length > 0 ? currentPage().title : 'Untitled')

  return (
    <div
      class="relative h-full w-full overflow-hidden"
      style={{ background: MobileSafariPalette.chrome }}
    >
      <div
        class="absolute inset-0"
        style={{
          background: selectingTab() ? MobileSafariPalette.tabBackdrop : 'transparent',
          transition: caTransition(['background'], tabAnimation)
        }}
      />

      <div class="relative flex h-full w-full flex-col">
        <div style={{ height: `${MobileSafariMetrics.statusBarHeight}px`, 'flex-shrink': '0' }} />

        <div class="relative flex-1 overflow-hidden">
          <div
            class="flex h-full items-center"
            style={{
              width: `${webPages().length * 100}%`,
              transform: `translateX(-${(pageIndex() * 100) / webPages().length}%)`,
              transition: caTransition(['transform'], tabAnimation)
            }}
          >
            <Index each={webPages()}>
              {(page, at) => (
                <div
                  class="flex h-full items-start justify-center"
                  style={{ width: `${100 / webPages().length}%` }}
                >
                  <div
                    class="relative"
                    style={{
                      width: `${props.width}px`,
                      transform: `scale(${selectingTab() ? MobileSafariMetrics.pageScale : 1})`,
                      opacity: `${closing() === page().id ? 0 : at === pageIndex() ? 1 : MobileSafariMetrics.pageIdleOpacity}`,
                      transition: `${caTransition(['transform'], tabAnimation)}, ${caTransition(['opacity'], closeAnimation)}`
                    }}
                    onClick={() => {
                      if (!selectingTab()) return
                      if (at === pageIndex()) {
                        setSelectingTab(false)
                        return
                      }
                      setPageIndex(at)
                    }}
                  >
                    <div
                      style={{
                        height: `${clamp()}px`,
                        transform: `translateY(${spacerOffset()}px)`
                      }}
                    />
                    <WebContentView
                      url={page().url}
                      active={at === pageIndex() && !selectingTab()}
                      height={webHeight()}
                      onTitle={reportTitle}
                      onLocation={reportLocation}
                      onProgress={reportProgress}
                      onNavigate={(url) => navigate(url)}
                      onScroll={setScrollY}
                      onFocusField={() => undefined}
                    />

                    <Show when={selectingTab() && at === pageIndex() && webPages().length > 1}>
                      <button
                        type="button"
                        class="absolute"
                        style={{
                          left: `${MobileSafariMetrics.closeBoxLeading}px`,
                          top: `${MobileSafariMetrics.closeBoxTop}px`,
                          width: `${MobileSafariMetrics.closeBoxSize}px`,
                          height: `${MobileSafariMetrics.closeBoxSize}px`
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          close(page().id)
                        }}
                      >
                        <CGImage
                          name="closebox"
                          style={{
                            width: `${MobileSafariMetrics.closeBoxSize}px`,
                            height: `${MobileSafariMetrics.closeBoxSize}px`,
                            'object-fit': 'cover'
                          }}
                        />
                      </button>
                    </Show>
                  </div>
                </div>
              )}
            </Index>
          </div>
        </div>

        <div style={{ height: `${MobileSafariMetrics.toolBarHeight}px`, 'flex-shrink': '0' }} />
      </div>

      <div
        class="pointer-events-none absolute inset-x-0 flex flex-col items-center"
        style={{
          top: `${props.height * MobileSafariMetrics.pageTitleTopRatio}px`,
          gap: `${MobileSafariMetrics.pageTitleGap}px`,
          opacity: `${selectingTab() ? 1 : 0}`,
          transition: caTransition(['opacity'], tabAnimation)
        }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileSafariMetrics.pageTitleFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.66px 0 rgba(0,0,0,0.51)'
          }}
        >
          {tabTitle()}
        </span>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileSafariMetrics.pageUrlFontSize}px`,
            'font-weight': '700',
            color: MobileSafariPalette.pageUrl,
            'text-shadow': '0 -0.66px 0 rgba(0,0,0,0.51)',
            opacity: `${isBlank(currentPage().url) ? 0 : 1}`
          }}
        >
          {currentPage().url}
        </span>
      </div>

      <div
        class="absolute inset-x-0 flex items-center justify-center"
        style={{
          bottom: `${props.height * MobileSafariMetrics.pageDotsBottomRatio}px`,
          gap: `${MobileSafariMetrics.dotSpacing}px`,
          opacity: `${selectingTab() && webPages().length > 1 ? 1 : 0}`,
          transition: caTransition(['opacity'], tabAnimation)
        }}
      >
        <Index each={webPages()}>
          {(page, at) => (
            <button
              type="button"
              aria-label={page().id}
              onClick={() => setPageIndex(at)}
              style={{
                width: `${MobileSafariMetrics.dotSize}px`,
                height: `${MobileSafariMetrics.dotSize}px`,
                'border-radius': '9999px',
                background: 'white',
                opacity: `${at === pageIndex() ? 1 : MobileSafariMetrics.dotIdleOpacity}`
              }}
            />
          )}
        </Index>
      </div>

      <div
        class="pointer-events-none absolute inset-0"
        style={{
          background: 'black',
          opacity: `${isEditingChrome() ? MobileSafariMetrics.editingDimOpacity : 0}`,
          transition: caTransition(['opacity'], sheetAnimation)
        }}
      />

      <div class="absolute inset-x-0 top-0 flex flex-col overflow-hidden">
        <UIStatusBar style="inApp" />
        <div
          style={{
            transform: `translateY(${chromeOffset()}px)`,
            opacity: `${selectingTab() ? 0 : 1}`,
            'padding-bottom': `${MobileSafariMetrics.titleBarPaddingBottom}px`,
            transition: caTransition(['opacity'], tabAnimation)
          }}
        >
          <SafariTitleBar
            width={props.width}
            title={currentPage().title}
            url={isBlank(currentPage().url) ? '' : currentPage().url}
            progress={currentPage().progress}
            onNavigate={openURL}
            onSearch={(query) => {
              navigate(searchURL(query))
              setScrollY(0)
            }}
            onReload={reload}
          />
        </div>
      </div>

      <div
        class="absolute inset-0"
        style={{
          transform: `translateY(${showBookmarks() ? 0 : 100}%)`,
          'pointer-events': showBookmarks() ? 'auto' : 'none',
          'will-change': 'transform',
          transition: caTransition(['transform'], sheetAnimation)
        }}
      >
        <SafariBookmarks
          editing={editingBookmarks()}
          onOpen={(url) => {
            navigate(url)
            setShowBookmarks(false)
            setEditingBookmarks(false)
          }}
          onDone={() => setShowBookmarks(false)}
        />
      </div>

      <div class="absolute inset-x-0 bottom-0">
        <SafariToolBar
          mode={mode()}
          pageCount={webPages().length}
          canGoBack={canGoBack()}
          canGoForward={canGoForward()}
          editingBookmarks={editingBookmarks()}
          onBack={goBack}
          onForward={goForward}
          onShare={() => setShowShare(true)}
          onBookmarks={() => setShowBookmarks(true)}
          onTabs={enterTabs}
          onNewPage={newPage}
          onDone={() => setSelectingTab(false)}
          onEditBookmarks={() => setEditingBookmarks(!editingBookmarks())}
        />
      </div>

      <div
        class="absolute inset-0"
        style={{
          background: 'black',
          opacity: `${showShare() ? MobileSafariMetrics.shareDimOpacity : 0}`,
          'pointer-events': showShare() ? 'auto' : 'none',
          transition: caTransition(['opacity'], sheetAnimation)
        }}
        onClick={() => setShowShare(false)}
      />
      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          transform: `translateY(${showShare() ? 0 : 100}%)`,
          'pointer-events': showShare() ? 'auto' : 'none',
          'will-change': 'transform',
          transition: caTransition(['transform'], sheetAnimation)
        }}
      >
        <SafariShareSheet
          height={props.height * MobileSafariMetrics.shareHeightRatio}
          onAddBookmark={() => {
            setShowShare(false)
            startBookmarkName(tabTitle())
            caAfter(MobileSafariMetrics.shareHandoffDuration, () => setShowSaveBookmark(true))
          }}
          onCancel={() => setShowShare(false)}
        />
      </div>

      <UIKeyboardView
        visible={isEditingChrome()}
        width={props.width}
        configuration={keyboardConfiguration()}
        onInsert={insertText}
        onDelete={deleteBackward}
        onReturn={submitField}
      />

      <div
        class="absolute inset-0"
        style={{
          transform: `translateY(${showSaveBookmark() ? 0 : 100}%)`,
          'pointer-events': showSaveBookmark() ? 'auto' : 'none',
          'will-change': 'transform',
          transition: caTransition(['transform'], sheetAnimation)
        }}
      >
        <SafariAddBookmark
          url={currentPage().url}
          onCancel={() => setShowSaveBookmark(false)}
          onSave={(name) => {
            addBookmark(currentPage().url, name)
            setShowSaveBookmark(false)
          }}
        />
      </div>
    </div>
  )
}
