import { assetPointSize, assetURL, type AssetName } from 'CoreGraphics'
import { PhoneMetrics } from '../Support/PhoneMetrics'

export interface PHCallPadIcon {
  readonly mask: string
  readonly width: number
  readonly height: number
}

const drawn = (viewBox: string, body: string, aspect: number): PHCallPadIcon => ({
  mask: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'%3E${body}%3C/svg%3E")`,
  width: PhoneMetrics.callGlyphHeight * aspect,
  height: PhoneMetrics.callGlyphHeight
})

const fromAsset = (name: AssetName): PHCallPadIcon => {
  const size = assetPointSize(name)
  return {
    mask: `url(${assetURL(name)})`,
    width: (PhoneMetrics.callGlyphHeight * size.width) / size.height,
    height: PhoneMetrics.callGlyphHeight
  }
}

export const CallPadIcons = {
  mute: fromAsset('vm_microphone_icon'),
  keypad: fromAsset('Keypad_Phone'),
  speaker: fromAsset('SpeakerMax'),
  addCall: drawn(
    '0 0 32 32',
    `%3Cpath d='M13 2h6v11h11v6H19v11h-6V19H2v-6h11z' fill='%23000'/%3E`,
    1
  ),
  faceTime: drawn(
    '0 0 44 28',
    `%3Cpath d='M3 3h24a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z' fill='%23000'/%3E%3Cpath d='M33 14 44 5v18z' fill='%23000'/%3E`,
    44 / 28
  ),
  contacts: fromAsset('Contacts_Phone')
} as const
