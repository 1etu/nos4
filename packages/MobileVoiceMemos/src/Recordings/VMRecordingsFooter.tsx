import { assetURL } from 'CoreGraphics'
import { VMWellButton } from './VMWellButton'
import { vmDurationLabel } from '../Support/VMLibrary'
import { VMMetrics, VMPalette } from '../Support/VMMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const ActionFill = {
  blue: 'linear-gradient(to bottom, rgb(137,173,238) 0%, rgb(80,140,231) 51%, rgb(43,120,228) 52%, rgb(46,123,229) 100%)',
  red: 'linear-gradient(to bottom, rgb(239,135,142) 0%, rgb(199,52,63) 48%, rgb(189,20,33) 49%, rgb(189,20,33) 100%)'
} as const

const ActionBorder = 'rgba(255,255,255,0.9)'

export const VMRecordingsFooter = (props: {
  currentTime: number
  duration: number
  onSeek: (seconds: number) => void
  onShare: () => void
  onDelete: () => void
}) => {
  let track!: HTMLDivElement

  const progress = () =>
    props.duration > 0 ? Math.min(Math.max(props.currentTime / props.duration, 0), 1) : 0

  const scrub = (clientX: number) => {
    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    props.onSeek(ratio * props.duration)
  }

  return (
    <div class="relative w-full" style={{ height: `${VMMetrics.footerHeight}px` }}>
      <div
        class="absolute inset-x-0 top-0"
        style={{
          height: `${VMMetrics.footerLipHeight}px`,
          background: VMPalette.footerLip,
          'border-top': '1px solid black',
          'box-shadow': 'inset 0 3px 3px -3px rgba(255,255,255,0.98)'
        }}
      />
      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          top: `${VMMetrics.footerLipHeight}px`,
          background: VMPalette.footerBody
        }}
      />

      <div
        class="absolute inset-x-0 flex items-center"
        style={{ top: `${VMMetrics.footerSliderOffsetY}px`, height: `${VMMetrics.footerSliderHeight}px` }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${VMMetrics.footerTimeFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'padding-left': `${VMMetrics.footerTimeInset}px`,
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
          }}
        >
          {vmDurationLabel(props.currentTime)}
        </span>

        <div
          ref={track}
          class="relative flex-1"
          style={{ height: `${VMMetrics.footerSliderHeight}px`, margin: '0 8px', cursor: 'default' }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            scrub(event.clientX)
          }}
          onPointerMove={(event) => {
            if (event.buttons === 0) return
            scrub(event.clientX)
          }}
        >
          <div
            class="absolute"
            style={{
              left: '4px',
              right: '4px',
              top: `${(VMMetrics.footerSliderHeight - VMMetrics.footerTrackHeight) / 2}px`,
              height: `${VMMetrics.footerTrackHeight}px`,
              'border-radius': `${VMMetrics.footerTrackRadius}px`,
              background: VMPalette.trackEmpty
            }}
          />
          <div
            class="absolute"
            style={{
              left: '4px',
              width: `calc((100% - 8px) * ${progress()})`,
              top: `${(VMMetrics.footerSliderHeight - VMMetrics.footerTrackHeight) / 2}px`,
              height: `${VMMetrics.footerTrackHeight}px`,
              'border-radius': `${VMMetrics.footerTrackRadius}px`,
              background: VMPalette.trackFilled
            }}
          />
          <img
            src={assetURL('volume_slider_fat_knob')}
            alt=""
            draggable={false}
            class="absolute"
            style={{
              width: `${VMMetrics.footerKnobWidth}px`,
              left: `calc(4px + (100% - 8px) * ${progress()} - ${VMMetrics.footerKnobWidth / 2}px)`,
              top: `${(VMMetrics.footerSliderHeight - VMMetrics.footerKnobWidth) / 2}px`
            }}
          />
        </div>

        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${VMMetrics.footerTimeFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'padding-right': `${VMMetrics.footerTimeInset}px`,
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.75)'
          }}
        >
          {vmDurationLabel(props.duration)}
        </span>
      </div>

      <div
        class="absolute inset-x-0 flex items-center"
        style={{ top: `${VMMetrics.footerSliderOffsetY + VMMetrics.footerButtonTop}px` }}
      >
        <VMWellButton
          title="Share"
          fill={ActionFill.blue}
          border={ActionBorder}
          style={{ 'margin-left': '12px', 'margin-right': '6px', flex: '1' }}
          onClick={props.onShare}
        />
        <VMWellButton
          title="Delete"
          fill={ActionFill.red}
          border={ActionBorder}
          style={{ 'margin-left': '6px', 'margin-right': '12px', flex: '1' }}
          onClick={props.onDelete}
        />
      </div>
    </div>
  )
}
