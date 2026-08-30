import { For, Show } from 'solid-js'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { CallPadIcons, type PHCallPadIcon } from './CallPadIcons'

const LowerRow = [
  { icon: CallPadIcons.addCall, title: 'add call' },
  { icon: CallPadIcons.faceTime, title: 'FaceTime' },
  { icon: CallPadIcons.contacts, title: 'contacts' }
] as const

const maskStyle = (icon: PHCallPadIcon) => ({
  width: `${icon.width}px`,
  height: `${icon.height}px`,
  background: PhonePalette.callGlyph,
  '-webkit-mask-image': icon.mask,
  'mask-image': icon.mask,
  '-webkit-mask-repeat': 'no-repeat',
  'mask-repeat': 'no-repeat',
  '-webkit-mask-position': 'center',
  'mask-position': 'center',
  '-webkit-mask-size': 'contain',
  'mask-size': 'contain'
})

const MuteSlash = () => (
  <div
    class="absolute"
    style={{
      width: `${PhoneMetrics.callGlyphHeight}px`,
      height: `${PhoneMetrics.callMuteSlashWidth}px`,
      background: PhonePalette.callGlyph,
      transform: 'rotate(-45deg)'
    }}
  />
)

const CallPadCell = (props: {
  icon: PHCallPadIcon
  title: string
  slash: boolean
  active: boolean
  column: number
}) => (
  <div
    class="relative flex flex-1 flex-col items-center"
    style={{
      background: props.active ? PhonePalette.callPadActive : 'transparent',
      'box-shadow':
        props.column === 0
          ? 'none'
          : `inset ${PhoneMetrics.callHairline}px 0 0 ${PhonePalette.callPadSeparator}`
    }}
  >
    <div class="flex flex-1 items-center justify-center">
      <div class="relative flex items-center justify-center">
        <div style={maskStyle(props.icon)} />
        <Show when={props.slash}>
          <MuteSlash />
        </Show>
      </div>
    </div>
    <span
      style={{
        'margin-bottom': `${PhoneMetrics.callLabelBottom}px`,
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.callLabelFontSize}px`,
        'line-height': `${PhoneMetrics.callLabelLineHeight}`,
        color: PhonePalette.callGlyph,
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.4)'
      }}
    >
      {props.title}
    </span>
  </div>
)

export const CallPad = (props: {
  muted: boolean
  speaker: boolean
  onMute: () => void
  onSpeaker: () => void
}) => (
  <div
    class="overflow-hidden"
    style={{
      margin: `0 ${PhoneMetrics.callGutter}px`,
      height: `${PhoneMetrics.callPadHeight}px`,
      'border-radius': `${PhoneMetrics.callPadRadius}px`,
      background: PhonePalette.callPadFace,
      border: `${PhoneMetrics.callHairline}px solid ${PhonePalette.callPadBorder}`,
      'box-shadow': `inset 0 ${PhoneMetrics.callHairline}px 0 ${PhonePalette.callPadTopEdge}`
    }}
  >
    <div class="flex h-1/2 w-full">
      <button type="button" class="flex flex-1" onClick={() => props.onMute()}>
        <CallPadCell
          icon={CallPadIcons.mute}
          title="mute"
          slash={true}
          active={props.muted}
          column={0}
        />
      </button>
      <CallPadCell
        icon={CallPadIcons.keypad}
        title="keypad"
        slash={false}
        active={false}
        column={1}
      />
      <button type="button" class="flex flex-1" onClick={() => props.onSpeaker()}>
        <CallPadCell
          icon={CallPadIcons.speaker}
          title="speaker"
          slash={false}
          active={props.speaker}
          column={2}
        />
      </button>
    </div>

    <div
      class="w-full"
      style={{
        height: `${PhoneMetrics.callHairline}px`,
        background: PhonePalette.callPadSeparator
      }}
    />

    <div class="flex w-full" style={{ height: `calc(50% - ${PhoneMetrics.callHairline}px)` }}>
      <For each={LowerRow}>
        {(entry, column) => (
          <CallPadCell
            icon={entry.icon}
            title={entry.title}
            slash={false}
            active={false}
            column={column()}
          />
        )}
      </For>
    </div>
  </div>
)
