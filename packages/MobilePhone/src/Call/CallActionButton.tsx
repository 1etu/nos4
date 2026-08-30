import { CGImage } from 'CoreGraphics'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

export type PHCallActionTone = 'end' | 'answer'

const face = (tone: PHCallActionTone): string =>
  tone === 'end' ? PhonePalette.callEndFace : PhonePalette.callAnswerFace

const stroke = (tone: PHCallActionTone): string =>
  tone === 'end' ? PhonePalette.callEndStroke : PhonePalette.callAnswerStroke

const rotation = (tone: PHCallActionTone): string =>
  tone === 'end' ? `rotate(${PhoneMetrics.callEndGlyphRotation}deg)` : 'none'

export const CallActionButton = (props: {
  title: string
  tone: PHCallActionTone
  onPress: () => void
}) => (
  <button
    type="button"
    class="flex flex-1 items-center justify-center"
    style={{
      height: `${PhoneMetrics.callButtonHeight}px`,
      gap: `${PhoneMetrics.callButtonGlyphGap}px`,
      'border-radius': `${PhoneMetrics.callButtonRadius}px`,
      background: face(props.tone),
      border: `${PhoneMetrics.callHairline}px solid ${stroke(props.tone)}`,
      'box-shadow': '0 1px 1px rgba(0,0,0,0.35)'
    }}
    onClick={() => props.onPress()}
  >
    <CGImage
      name="callglyph_big"
      style={{ transform: rotation(props.tone), filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.4))' }}
    />
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.callButtonFontSize}px`,
        'line-height': `${PhoneMetrics.callButtonLineHeight}`,
        'font-weight': '700',
        color: PhonePalette.callGlyph,
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.5)'
      }}
    >
      {props.title}
    </span>
  </button>
)
