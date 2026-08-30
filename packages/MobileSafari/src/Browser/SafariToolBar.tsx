import { type JSX } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const modeAnimation = caAnimation(
  MobileSafariMetrics.defaultDuration,
  CAMediaTimingFunction.easeInOut
)

const tabAsset = (count: number): AssetName =>
  (count > 1 ? `NavTab${Math.min(count, MobileSafariMetrics.maxPages)}` : 'NavTab') as AssetName

const NavButton = (props: { icon: AssetName; enabled?: boolean; onClick: () => void }) => (
  <button
    type="button"
    class="flex flex-1 items-center justify-center"
    style={{ opacity: `${props.enabled === false ? MobileSafariMetrics.disabledOpacity : 1}` }}
    onClick={() => {
      if (props.enabled === false) return
      props.onClick()
    }}
  >
    <CGImage name={props.icon} />
  </button>
)

export const RectangleButton = (props: {
  label: string
  tone: 'blue' | 'blueGray' | 'red'
  onClick: () => void
}) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${MobileSafariMetrics.toolBarButtonHeight}px`,
      padding: `0 ${MobileSafariMetrics.toolBarButtonPaddingX}px`,
      'border-radius': `${MobileSafariMetrics.toolBarButtonRadius}px`,
      background: MobileSafariPalette.buttonTone[props.tone],
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileSafariMetrics.toolBarButtonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)',
        'white-space': 'pre'
      }}
    >
      {props.label}
    </span>
  </button>
)

const ModeLayer = (props: { active: boolean; children: JSX.Element }) => (
  <div
    class="absolute inset-0 flex items-center"
    style={{
      opacity: `${props.active ? 1 : 0}`,
      'pointer-events': props.active ? 'auto' : 'none',
      transition: caTransition(['opacity'], modeAnimation)
    }}
  >
    {props.children}
  </div>
)

export const SafariToolBar = (props: {
  mode: 'browse' | 'tabs' | 'bookmarks'
  pageCount: number
  canGoBack: boolean
  canGoForward: boolean
  editingBookmarks: boolean
  onBack: () => void
  onForward: () => void
  onShare: () => void
  onBookmarks: () => void
  onTabs: () => void
  onNewPage: () => void
  onDone: () => void
  onEditBookmarks: () => void
}) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${MobileSafariMetrics.toolBarHeight}px`,
      background: MobileSafariPalette.toolBar,
      'border-top': `1px solid ${MobileSafariPalette.barEdge}`
    }}
  >
    <ModeLayer active={props.mode === 'browse'}>
      <div class="flex w-full items-center">
        <NavButton icon="NavBack" enabled={props.canGoBack} onClick={props.onBack} />
        <NavButton icon="NavForward" enabled={props.canGoForward} onClick={props.onForward} />
        <NavButton icon="NavAction" onClick={props.onShare} />
        <NavButton icon="NavBookmarks" onClick={props.onBookmarks} />
        <NavButton icon={tabAsset(props.pageCount)} onClick={props.onTabs} />
      </div>
    </ModeLayer>

    <ModeLayer active={props.mode === 'tabs'}>
      <div class="flex w-full items-center">
        <div style={{ 'margin-left': `${MobileSafariMetrics.toolBarButtonInset}px` }}>
          <RectangleButton label="New Page" tone="blueGray" onClick={props.onNewPage} />
        </div>
        <div class="flex-1" />
        <div style={{ 'margin-right': `${MobileSafariMetrics.toolBarButtonInset}px` }}>
          <RectangleButton label="Done" tone="blue" onClick={props.onDone} />
        </div>
      </div>
    </ModeLayer>

    <ModeLayer active={props.mode === 'bookmarks'}>
      <div class="flex w-full items-center">
        <div style={{ 'margin-left': `${MobileSafariMetrics.toolBarButtonInset}px` }}>
          <RectangleButton
            label={props.editingBookmarks ? 'Done' : ' Edit '}
            tone={props.editingBookmarks ? 'blue' : 'blueGray'}
            onClick={props.onEditBookmarks}
          />
        </div>
        <div class="flex-1" />
        <div
          style={{
            'margin-right': `${MobileSafariMetrics.toolBarButtonInset}px`,
            opacity: `${props.editingBookmarks ? 1 : 0}`,
            'pointer-events': props.editingBookmarks ? 'auto' : 'none',
            transition: caTransition(['opacity'], modeAnimation)
          }}
        >
          <RectangleButton label="New Folder" tone="blueGray" onClick={() => undefined} />
        </div>
      </div>
    </ModeLayer>
  </div>
)
