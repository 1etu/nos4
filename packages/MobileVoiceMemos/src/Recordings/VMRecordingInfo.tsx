import { assetURL } from 'CoreGraphics'
import { UIScrollView, UITablePalette } from 'UIKit'
import { vmDurationLabel, type VMRecordingItem } from '../Support/VMLibrary'
import { VMMetrics, VMPalette } from '../Support/VMMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const recordedOn = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

const ActionTile = (props: { title: string }) => (
  <div
    class="flex items-center justify-center"
    style={{
      flex: '1',
      height: `${VMMetrics.footerButtonHeight}px`,
      background: 'white',
      'border-radius': `${VMMetrics.infoCardRadius}px`,
      'box-shadow': `inset 0 0 0 1px ${VMPalette.infoCardStroke}`
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${VMMetrics.actionFontSize}px`,
        'font-weight': '700',
        color: VMPalette.infoRecorded,
        width: `${VMMetrics.actionWidth}px`,
        'text-align': 'center'
      }}
    >
      {props.title}
    </span>
  </div>
)

export const VMRecordingInfo = (props: { recording: VMRecordingItem }) => (
  <div class="relative h-full w-full" style={{ background: UITablePalette.pinstripe }}>
    <UIScrollView class="absolute inset-0">
      <div
        class="flex items-start"
        style={{
          height: `${VMMetrics.infoCardHeight}px`,
          margin: `${VMMetrics.infoCardTop}px ${VMMetrics.infoCardInset}px 0`,
          background: 'white',
          'border-radius': `${VMMetrics.infoCardRadius}px`,
          'box-shadow': `inset 0 0 0 1px ${VMPalette.infoCardStroke}`
        }}
      >
        <img
          src={assetURL('vm_microphone_icon')}
          alt=""
          draggable={false}
          style={{
            'margin-left': `${VMMetrics.infoIconLeading}px`,
            'margin-top': `${VMMetrics.infoIconOffsetY}px`
          }}
        />
        <div
          class="flex flex-col"
          style={{ 'padding-left': `${VMMetrics.infoTextLeading}px`, 'padding-top': '12px' }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${VMMetrics.infoTitleFontSize}px`,
              'font-weight': '700',
              color: 'black',
              'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
            }}
          >
            {props.recording.title}
          </span>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${VMMetrics.infoDurationFontSize}px`,
              color: VMPalette.infoDuration,
              'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)'
            }}
          >
            {vmDurationLabel(props.recording.duration)}
          </span>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${VMMetrics.infoRecordedFontSize}px`,
              'font-weight': '700',
              color: VMPalette.infoRecorded,
              'padding-top': '1px'
            }}
          >
            {`Recorded on ${recordedOn(props.recording.date)}`}
          </span>
        </div>
        <div class="flex-1" />
        <img
          src={assetURL('chevron')}
          alt=""
          draggable={false}
          style={{ 'margin-right': `${VMMetrics.infoCardInset}px`, 'margin-top': '48px' }}
        />
      </div>

      <div
        class="flex"
        style={{
          gap: '8px',
          margin: `${VMMetrics.infoCardTop}px ${VMMetrics.infoCardInset}px`
        }}
      >
        <ActionTile title="Trim Memo" />
        <ActionTile title="Share" />
      </div>
    </UIScrollView>
  </div>
)
