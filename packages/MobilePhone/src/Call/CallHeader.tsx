import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

export const CallHeader = (props: { name: string; status: string }) => (
  <div
    class="relative flex w-full shrink-0 flex-col items-center justify-between"
    style={{
      height: `${PhoneMetrics.callHeaderHeight}px`,
      padding: `${PhoneMetrics.callHeaderPaddingY}px ${PhoneMetrics.callHeaderInsetX}px`,
      background: PhonePalette.callHeaderScrim,
      'border-bottom': `${PhoneMetrics.callHairline}px solid ${PhonePalette.callHeaderEdge}`
    }}
  >
    <span
      class="w-full text-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.callNameFontSize}px`,
        'line-height': `${PhoneMetrics.callNameLineHeight}`,
        color: PhonePalette.callName,
        'text-shadow': '0 -1px 2px rgba(0,0,0,0.6)',
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.name}
    </span>

    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhoneMetrics.callStatusFontSize}px`,
        'line-height': `${PhoneMetrics.callStatusLineHeight}`,
        color: PhonePalette.callName,
        'text-shadow': '0 -1px 2px rgba(0,0,0,0.6)',
        'white-space': 'nowrap'
      }}
    >
      {props.status}
    </span>
  </div>
)
