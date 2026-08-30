import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { mailRelativeTime, mailSplitMeridiem } from '../Support/MailDate'
import type { MailMessage } from '../Support/MailTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const StampedDate = (props: { received: number }) => {
  const parts = () => mailSplitMeridiem(mailRelativeTime(props.received))
  return (
    <span
      class="shrink-0"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MailMetrics.dateFontSize}px`,
        'line-height': `${MailMetrics.senderLineHeight}px`,
        color: MailPalette.accent,
        'white-space': 'nowrap'
      }}
    >
      <Show when={parts().meridiem} fallback={parts().head}>
        <span style={{ 'font-weight': '700' }}>{parts().head}</span>
        <span>{` ${parts().meridiem}`}</span>
      </Show>
    </span>
  )
}

export const MailMessageRow = (props: {
  message: MailMessage
  onOpen: (message: MailMessage) => void
}) => (
  <button
    type="button"
    class="relative flex w-full items-center"
    style={{
      height: `${MailMetrics.messageRowHeight}px`,
      background: 'white',
      'border-bottom': `1px solid ${MailPalette.messageSeparator}`
    }}
    onClick={() => props.onOpen(props.message)}
  >
    <Show when={!props.message.seen}>
      <div
        class="absolute"
        style={{
          left: `${MailMetrics.unreadDotInset}px`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: `${MailMetrics.unreadDotSize}px`,
          height: `${MailMetrics.unreadDotSize}px`,
          'border-radius': '50%',
          background: MailPalette.unreadDot,
          border: `${MailMetrics.unreadDotStroke}px solid ${MailPalette.unreadDotStroke}`
        }}
      />
    </Show>

    <div
      class="flex min-w-0 flex-1 flex-col"
      style={{
        'padding-left': `${MailMetrics.rowTextInset}px`,
        'padding-right': `${MailMetrics.chevronInset}px`,
        'text-align': 'left'
      }}
    >
      <div class="flex w-full items-center" style={{ gap: '8px' }}>
        <span
          class="min-w-0 flex-1"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MailMetrics.senderFontSize}px`,
            'font-weight': '700',
            'line-height': `${MailMetrics.senderLineHeight}px`,
            color: 'black',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
          }}
        >
          {props.message.sender.displayName}
        </span>
        <StampedDate received={props.message.received} />
        <CGImage name="UITableNext" class="shrink-0" />
      </div>

      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.subjectFontSize}px`,
          'line-height': `${MailMetrics.subjectLineHeight}px`,
          color: 'black',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis'
        }}
      >
        {props.message.subject.length > 0 ? props.message.subject : '(No Subject)'}
      </span>

      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.previewFontSize}px`,
          'line-height': `${MailMetrics.previewLineHeight}px`,
          height: `${MailMetrics.previewLineHeight * 2}px`,
          color: MailPalette.preview,
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden'
        }}
      >
        {props.message.preview}
      </span>
    </div>
  </button>
)
