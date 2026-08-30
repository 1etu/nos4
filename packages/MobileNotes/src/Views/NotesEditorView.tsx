import { CGImage, assetURL } from 'CoreGraphics'
import { NotesMetrics, NotesPalette } from '../Support/NotesMetrics'
import { relativeDay, sortedNotes, stampLabel, type Note } from '../Support/NoteStore'
import { beginEditingNote, moveCaret } from '../Support/NotesEditing'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const Noteworthy = "'Noteworthy Local', 'Noteworthy', 'Bradley Hand', 'Segoe Script', cursive"

const HeaderLabel = (props: { text: string; bold: boolean }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${NotesMetrics.headerFontSize}px`,
      'font-weight': props.bold ? '700' : '400',
      color: NotesPalette.header,
      'white-space': 'nowrap'
    }}
  >
    {props.text}
  </span>
)

export const NotesEditorView = (props: {
  note: Note
  onChange: (content: string) => void
  keyboardHeight: number
  onFocus: () => void
  onSelect: (note: Note) => void
  onDelete: () => void
}) => {
  const ordered = () => sortedNotes()
  const position = () => ordered().findIndex((entry) => entry.id === props.note.id)
  const canPrevious = () => position() > 0
  const canNext = () => position() >= 0 && position() < ordered().length - 1

  const step = (delta: number) => {
    const target = ordered()[position() + delta]
    if (!target) return
    props.onSelect(target)
  }

  const pitch = NotesMetrics.bodyLineHeight
  const ruleTop = NotesMetrics.bodyRuleBaseline - NotesMetrics.bodyRuleWidth
  const ruleBottom = NotesMetrics.bodyRuleBaseline

  return (
    <div
      class="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        'background-image': `url(${assetURL('bodyMarginThin_568h')})`,
        'background-size': 'cover',
        'background-position': 'top center'
      }}
    >
      <div
        class="flex shrink-0 items-center"
        style={{
          'padding-top': `${NotesMetrics.headerPaddingTop}px`,
          'padding-bottom': `${NotesMetrics.headerPaddingBottom}px`
        }}
      >
        <div style={{ 'padding-left': `${NotesMetrics.headerLeading}px` }}>
          <HeaderLabel text={relativeDay(props.note.editedAt)} bold />
        </div>
        <div class="flex-1" />
        <div style={{ 'padding-right': `${NotesMetrics.headerTrailing}px` }}>
          <HeaderLabel text={stampLabel(props.note.editedAt)} bold={false} />
        </div>
      </div>

      <div
        class="relative flex-1 overflow-hidden"
        style={{ 'padding-bottom': `${props.keyboardHeight}px` }}
      >
        <div
          class="pointer-events-none absolute inset-0"
          style={{
            'background-image': `repeating-linear-gradient(to bottom, transparent 0, transparent ${ruleTop}px, ${NotesPalette.rule} ${ruleTop}px, ${NotesPalette.rule} ${ruleBottom}px, transparent ${ruleBottom}px, transparent ${pitch}px)`
          }}
        />

        <textarea
          value={props.note.content}
          spellcheck={false}
          onInput={(event) => {
            moveCaret(event.currentTarget.selectionStart)
            props.onChange(event.currentTarget.value)
          }}
          onFocus={(event) => {
            beginEditingNote(event.currentTarget.selectionStart)
            props.onFocus()
          }}
          onSelect={(event) => moveCaret(event.currentTarget.selectionStart)}
          onClick={(event) => moveCaret(event.currentTarget.selectionStart)}
          class="absolute inset-0 h-full w-full resize-none"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            'caret-color': NotesPalette.caret,
            'font-family': Noteworthy,
            'font-size': `${NotesMetrics.bodyFontSize}px`,
            'font-weight': '700',
            'line-height': `${pitch}px`,
            color: NotesPalette.body,
            padding: `0 ${NotesMetrics.bodyInsetRight}px ${NotesMetrics.bodyInsetBottom}px ${NotesMetrics.bodyInsetLeft}px`
          }}
        />
      </div>

      <img
        src={assetURL('edgeTopMarginThin')}
        alt=""
        draggable={false}
        class="pointer-events-none absolute inset-x-0 top-0 w-full"
      />
      <img
        src={assetURL('gradBottomMarginThin')}
        alt=""
        draggable={false}
        class="pointer-events-none absolute inset-x-0 bottom-0 w-full"
      />

      <div
        class="absolute inset-x-0 flex items-center justify-evenly"
        style={{
          bottom: `${NotesMetrics.toolbarBottom}px`,
          height: `${NotesMetrics.toolbarHeight}px`
        }}
      >
        <button
          type="button"
          style={{ opacity: `${canPrevious() ? 1 : 0.5}` }}
          onClick={() => step(-1)}
        >
          <CGImage name="arrow_left" />
        </button>
        <button type="button">
          <CGImage name="email" />
        </button>
        <button type="button" onClick={props.onDelete}>
          <CGImage name="trash" />
        </button>
        <button
          type="button"
          style={{ opacity: `${canNext() ? 1 : 0.5}` }}
          onClick={() => step(1)}
        >
          <CGImage name="arrow_right" />
        </button>
      </div>
    </div>
  )
}
