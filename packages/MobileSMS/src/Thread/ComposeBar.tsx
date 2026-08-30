import { Show } from 'solid-js'
import { MessagesMetrics, MessagesPalette } from '../Support/MessagesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const CameraGlyph = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
    <path
      d="M1 4h3.2l1.3-2h7l1.3 2H17v9H1Z"
      fill="none"
      stroke={MessagesPalette.cameraGlyph}
      stroke-width="1.6"
      stroke-linejoin="round"
    />
    <circle cx="9" cy="8" r="2.6" fill="none" stroke={MessagesPalette.cameraGlyph} stroke-width="1.6" />
  </svg>
)

export const ComposeBar = (props: {
  value: string
  placeholder: string
  focused: boolean
  onFocus: () => void
  onSend: () => void
}) => (
  <div
    class="flex shrink-0 items-center"
    style={{
      height: `${MessagesMetrics.composeHeight}px`,
      padding: `0 ${MessagesMetrics.composeInsetX}px`,
      gap: `${MessagesMetrics.composeGap}px`,
      background: MessagesPalette.composeBar,
      'border-top': `1px solid ${MessagesPalette.composeBarEdge}`
    }}
  >
    <div
      class="flex shrink-0 items-center justify-center"
      style={{
        width: `${MessagesMetrics.cameraSize}px`,
        height: `${MessagesMetrics.cameraSize}px`,
        'border-radius': '50%',
        background: MessagesPalette.cameraFace
      }}
    >
      <CameraGlyph />
    </div>

    <button
      type="button"
      class="flex min-w-0 flex-1 items-center"
      style={{
        height: `${MessagesMetrics.composeFieldHeight}px`,
        padding: `0 ${MessagesMetrics.composeGap * 2}px`,
        'border-radius': `${MessagesMetrics.composeFieldRadius}px`,
        background: MessagesPalette.composeField,
        border: `1px solid ${MessagesPalette.composeFieldStroke}`
      }}
      onClick={() => props.onFocus()}
    >
      <span
        class="truncate"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MessagesMetrics.composeFontSize}px`,
          color: props.value === '' ? MessagesPalette.composePlaceholder : 'black'
        }}
      >
        {props.value === '' ? props.placeholder : props.value}
      </span>
      <Show when={props.focused}>
        <div
          class="shrink-0"
          style={{
            width: `${MessagesMetrics.caretWidth}px`,
            height: `${MessagesMetrics.caretHeight}px`,
            background: MessagesPalette.caret
          }}
        />
      </Show>
    </button>

    <button
      type="button"
      class="flex shrink-0 items-center justify-center"
      style={{
        width: `${MessagesMetrics.sendWidth}px`,
        height: `${MessagesMetrics.sendHeight}px`,
        'border-radius': `${MessagesMetrics.sendRadius}px`,
        background: props.value === '' ? MessagesPalette.sendFaceIdle : MessagesPalette.sendFace,
        border: `1px solid ${MessagesPalette.sendStroke}`
      }}
      onClick={() => props.onSend()}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MessagesMetrics.sendFontSize}px`,
          'font-weight': '700',
          color: MessagesPalette.sendLabel,
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.35)'
        }}
      >
        Send
      </span>
    </button>
  </div>
)
