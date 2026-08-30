import { Show, type JSX } from 'solid-js'
import { CGImage, CGResizableImage, assetURL } from 'CoreGraphics'
import { NotesMetrics } from '../Support/NotesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const HeaderButton = (props: { wide?: boolean; children: JSX.Element; onClick: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${props.wide ? NotesMetrics.headerButtonWide : NotesMetrics.headerButtonSize}px`,
      height: `${NotesMetrics.headerButtonSize}px`
    }}
    onClick={props.onClick}
  >
    <CGResizableImage
      name="header_button"
      width={props.wide ? NotesMetrics.headerButtonWide : NotesMetrics.headerButtonSize}
      height={NotesMetrics.headerButtonSize}
      class="absolute inset-0"
    />
    {props.children}
  </button>
)

export const NotesTitleBar = (props: {
  title: string
  showBack: boolean
  editing: boolean
  onBack: () => void
  onNew: () => void
  onDone: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center justify-center"
    style={{ height: `${NotesMetrics.titleBarHeight}px` }}
  >
    <img
      src={assetURL('NotesTopBar')}
      alt=""
      draggable={false}
      class="absolute inset-0 h-full w-full"
    />

    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${NotesMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)',
        'max-width': `${NotesMetrics.titleMaxWidth}px`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.title}
    </span>

    <Show when={props.showBack}>
      <button
        type="button"
        class="absolute flex items-center justify-center"
        style={{ left: `${NotesMetrics.backButtonInset}px` }}
        onClick={props.onBack}
      >
        <CGResizableImage
          name="NotesBack"
          width={NotesMetrics.backButtonWidth}
          height={NotesMetrics.backButtonHeight}
        />
        <span
          class="absolute"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${NotesMetrics.backButtonFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
            'padding-left': '5px',
            transform: 'translateY(-1.1px)'
          }}
        >
          Notes
        </span>
      </button>
    </Show>

    <div class="absolute" style={{ right: `${NotesMetrics.headerButtonInset}px` }}>
      <Show
        when={props.editing}
        fallback={
          <HeaderButton onClick={props.onNew}>
            <CGImage
              name="UIButtonBarPlus"
              class="relative"
              style={{ width: `${NotesMetrics.headerGlyphWidth}px`, height: 'auto' }}
            />
          </HeaderButton>
        }
      >
        <HeaderButton wide onClick={props.onDone}>
          <span
            class="relative"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${NotesMetrics.headerButtonFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -0.25px 2px rgba(0,0,0,0.75)'
            }}
          >
            Done
          </span>
        </HeaderButton>
      </Show>
    </div>
  </div>
)
