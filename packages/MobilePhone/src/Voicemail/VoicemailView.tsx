import { For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { ctCarrierName } from 'CoreTelephony'
import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

export const VoicemailView = () => (
  <div class="flex min-h-0 flex-1 flex-col" style={{ background: 'white' }}>
    <div class="flex-1" />

    <div
      class="flex justify-center"
      style={{ padding: `0 ${PhoneMetrics.voicemailImageInsetX}px` }}
    >
      <CGImage
        name="VMOutOfOrderImage"
        style={{ width: '100%', height: 'auto', 'object-fit': 'contain' }}
      />
    </div>

    <div style={{ height: `${PhoneMetrics.voicemailImageGap}px` }} />

    <div class="flex flex-col items-center">
      <For each={['Cannot Connect', 'to Voicemail']}>
        {(line) => (
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${PhoneMetrics.voicemailTitleFontSize}px`,
              'line-height': `${PhoneMetrics.voicemailTitleLineHeight}`,
              'font-weight': '700',
              color: PhonePalette.voicemailTitle
            }}
          >
            {line}
          </span>
        )}
      </For>
    </div>

    <div class="flex-1" />

    <div
      class="flex"
      style={{
        padding: `0 ${PhoneMetrics.voicemailButtonInsetX}px ${PhoneMetrics.voicemailButtonBottom}px`
      }}
    >
      <div
        class="w-full"
        style={{
          height: `${PhoneMetrics.voicemailButtonHeight}px`,
          'border-radius': `${PhoneMetrics.voicemailButtonStrokeRadius}px`,
          border: `${PhoneMetrics.voicemailButtonStroke}px solid ${PhonePalette.voicemailButtonStroke}`
        }}
      >
        <div
          class="flex h-full w-full items-center justify-center"
          style={{
            'border-radius': `${PhoneMetrics.voicemailButtonRadius}px`,
            background: PhonePalette.voicemailButton
          }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${PhoneMetrics.voicemailButtonFontSize}px`,
              'font-weight': '700',
              color: PhonePalette.voicemailButtonLabel
            }}
          >
            {`Call ${ctCarrierName()}`}
          </span>
        </div>
      </div>
    </div>
  </div>
)
