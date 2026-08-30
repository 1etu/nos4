import { For, createSignal, onCleanup } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { AVSystemSound, avPlaySystemSound, type AVSystemSoundValue } from 'AVFoundation'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'
import { phoneNumberFormat } from '../Support/PhoneNumberFormat'
import { KeypadDisplay } from './KeypadDisplay'
import { KeypadKey } from './KeypadKey'

interface KeypadDigit {
  readonly value: string
  readonly letters: string
  readonly tone: AVSystemSoundValue
}

const digit = (value: string, letters: string, tone: AVSystemSoundValue): KeypadDigit => ({
  value,
  letters,
  tone
})

const DigitRows: readonly (readonly KeypadDigit[])[] = [
  [
    digit('1', '', AVSystemSound.dtmf1),
    digit('2', 'ABC', AVSystemSound.dtmf2),
    digit('3', 'DEF', AVSystemSound.dtmf3)
  ],
  [
    digit('4', 'GHI', AVSystemSound.dtmf4),
    digit('5', 'JKL', AVSystemSound.dtmf5),
    digit('6', 'MNO', AVSystemSound.dtmf6)
  ],
  [
    digit('7', 'PQRS', AVSystemSound.dtmf7),
    digit('8', 'TUV', AVSystemSound.dtmf8),
    digit('9', 'WXYZ', AVSystemSound.dtmf9)
  ]
]

const Star = digit('*', '', AVSystemSound.dtmfStar)
const Zero = digit('0', '+', AVSystemSound.dtmf0)
const Pound = digit('#', '', AVSystemSound.dtmfPound)

const KeyDigit = (props: { value: string }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${PhoneMetrics.digitFontSize}px`,
      'line-height': `${PhoneMetrics.digitLineHeight}`,
      'font-weight': '700',
      color: 'white',
      'text-shadow': '0 4px 4px rgba(0,0,0,0.3)'
    }}
  >
    {props.value}
  </span>
)

const KeyLetters = (props: { value: string; scale: number }) => (
  <div
    class="flex items-center justify-center"
    style={{
      height: `${PhoneMetrics.lettersFontSize * PhoneMetrics.lettersLineHeight}px`,
      'margin-top': `${PhoneMetrics.keyLabelGap}px`
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.lettersFontSize}px`,
        'line-height': `${PhoneMetrics.lettersLineHeight}`,
        'font-weight': '700',
        color: PhonePalette.keyLetters,
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.6)',
        transform: `scale(${props.scale})`
      }}
    >
      {props.value}
    </span>
  </div>
)

export const KeypadView = (props: {
  width: number
  onAddContact: () => void
  onCall: (formatted: string) => void
}) => {
  const [digits, setDigits] = createSignal('')
  const [pressed, setPressed] = createSignal('')

  let delayHandle: number | undefined
  let repeatHandle: number | undefined

  const deleteBackward = () => setDigits(digits().slice(0, -1))

  const stopRepeat = () => {
    if (delayHandle !== undefined) window.clearTimeout(delayHandle)
    if (repeatHandle !== undefined) window.clearInterval(repeatHandle)
    delayHandle = undefined
    repeatHandle = undefined
  }

  onCleanup(stopRepeat)

  const release = () => {
    setPressed('')
    stopRepeat()
  }

  const append = (key: KeypadDigit) => {
    setPressed(key.value)
    setDigits(digits() + key.value)
    avPlaySystemSound(key.tone)
  }

  const beginDelete = () => {
    setPressed('delete')
    deleteBackward()
    delayHandle = window.setTimeout(() => {
      deleteBackward()
      repeatHandle = window.setInterval(
        deleteBackward,
        PhoneMetrics.deleteRepeatInterval * 1000
      )
    }, PhoneMetrics.deleteRepeatDelay * 1000)
  }

  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <KeypadDisplay text={phoneNumberFormat(digits())} width={props.width} />

      <div class="flex min-h-0 flex-1 flex-col">
        <For each={DigitRows}>
          {(row) => (
            <div class="flex flex-1">
              <For each={row}>
                {(key, column) => (
                  <KeypadKey
                    kind="digit"
                    column={column()}
                    pressed={pressed() === key.value}
                    onDown={() => append(key)}
                    onUp={release}
                  >
                    <KeyDigit value={key.value} />
                    <KeyLetters value={key.letters} scale={1} />
                  </KeypadKey>
                )}
              </For>
            </div>
          )}
        </For>

        <div class="flex flex-1">
          <KeypadKey
            kind="digit"
            column={0}
            pressed={pressed() === Star.value}
            onDown={() => append(Star)}
            onUp={release}
          >
            <CGImage
              name="star_phone"
              style={{
                width: `${PhoneMetrics.glyphSize}px`,
                height: `${PhoneMetrics.glyphSize}px`,
                'object-fit': 'contain',
                'margin-top': `${PhoneMetrics.glyphPaddingTop}px`,
                filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'
              }}
            />
            <KeyLetters value="" scale={1} />
          </KeypadKey>

          <KeypadKey
            kind="digit"
            column={1}
            pressed={pressed() === Zero.value}
            onDown={() => append(Zero)}
            onUp={release}
          >
            <KeyDigit value={Zero.value} />
            <KeyLetters value={Zero.letters} scale={PhoneMetrics.plusScale} />
          </KeypadKey>

          <KeypadKey
            kind="digit"
            column={2}
            pressed={pressed() === Pound.value}
            onDown={() => append(Pound)}
            onUp={release}
          >
            <CGImage
              name="pound_phone"
              style={{
                width: `${PhoneMetrics.glyphSize}px`,
                height: `${PhoneMetrics.glyphSize}px`,
                'object-fit': 'contain',
                'margin-top': `${PhoneMetrics.glyphPaddingTop}px`,
                filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'
              }}
            />
            <KeyLetters value="" scale={1} />
          </KeypadKey>
        </div>

        <div class="flex flex-1">
          <KeypadKey
            kind="add"
            column={0}
            pressed={pressed() === 'add'}
            onDown={() => {
              setPressed('add')
              props.onAddContact()
            }}
            onUp={release}
          >
            <CGImage
              name="add_contact"
              style={{
                height: `${PhoneMetrics.actionGlyphHeight}px`,
                width: 'auto',
                filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.6))'
              }}
            />
          </KeypadKey>

          <KeypadKey
            kind="call"
            column={1}
            pressed={pressed() === 'call'}
            onDown={() => {
              setPressed('call')
              props.onCall(phoneNumberFormat(digits()))
            }}
            onUp={release}
          >
            <div class="flex items-center" style={{ gap: `${PhoneMetrics.callGlyphGap}px` }}>
              <CGImage name="callglyph_big" />
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${PhoneMetrics.callFontSize}px`,
                  'line-height': `${PhoneMetrics.digitLineHeight}`,
                  'font-weight': '700',
                  color: 'white',
                  'text-shadow': '0 -1px 0 rgba(0,0,0,0.6)'
                }}
              >
                Call
              </span>
            </div>
          </KeypadKey>

          <KeypadKey
            kind="delete"
            column={2}
            pressed={pressed() === 'delete'}
            onDown={beginDelete}
            onUp={release}
          >
            <CGImage
              name="backspace"
              style={{
                height: `${PhoneMetrics.actionGlyphHeight}px`,
                width: 'auto',
                filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.6))'
              }}
            />
          </KeypadKey>
        </div>
      </div>
    </div>
  )
}
