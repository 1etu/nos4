import { HelveticaNeue, PhoneMetrics, PhonePalette } from '../Support/PhoneMetrics'

export const KeypadDisplay = (props: { text: string; width: number }) => {
  const available = () => props.width - PhoneMetrics.displayInsetX * 2
  const natural = () =>
    props.text.length * PhoneMetrics.displayFontSize * PhoneMetrics.displayDigitAdvance

  const fontSize = () =>
    Math.max(
      PhoneMetrics.displayFontSize * PhoneMetrics.displayMinScale,
      Math.min(
        PhoneMetrics.displayFontSize,
        (PhoneMetrics.displayFontSize * available()) / natural()
      )
    )

  const clipped = () => natural() * PhoneMetrics.displayMinScale > available()

  return (
    <div
      class="flex w-full shrink-0 items-center overflow-hidden"
      style={{
        height: `${PhoneMetrics.displayHeight}px`,
        background: PhonePalette.display,
        padding: `0 ${PhoneMetrics.displayInsetX}px`,
        'justify-content': clipped() ? 'flex-end' : 'center'
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${fontSize()}px`,
          'line-height': `${PhoneMetrics.digitLineHeight}`,
          color: 'white',
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.6)',
          'white-space': 'nowrap'
        }}
      >
        {props.text}
      </span>
    </div>
  )
}
