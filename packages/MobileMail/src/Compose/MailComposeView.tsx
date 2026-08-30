import { createSignal } from 'solid-js'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { UIBarButton, UIStatusBar } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const DefaultBody = '\n\nSent from my iPhone'

const reveal = caAnimation(MailMetrics.revealDuration, CAMediaTimingFunction.linear)

const ComposeField = (props: {
  label: string
  value: string
  onInput: (value: string) => void
  onFocus?: () => void
}) => (
  <div
    class="flex w-full items-center"
    style={{
      height: `${MailMetrics.fieldRowHeight}px`,
      background: 'white',
      'border-bottom': `1px solid ${MailPalette.fieldSeparator}`,
      padding: `0 ${MailMetrics.detailLabelInset}px`,
      gap: '8px'
    }}
  >
    <span
      class="shrink-0"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MailMetrics.detailFieldFontSize}px`,
        color: MailPalette.preview
      }}
    >
      {props.label}
    </span>
    <input
      type="text"
      value={props.value}
      class="min-w-0 flex-1 bg-transparent outline-none"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MailMetrics.detailFieldFontSize}px`,
        color: 'black'
      }}
      onInput={(event) => props.onInput(event.currentTarget.value)}
      onFocus={() => props.onFocus?.()}
    />
  </div>
)

export const MailComposeView = (props: {
  onCancel: () => void
  onSend: (to: string, subject: string, body: string) => void
}) => {
  const [to, setTo] = createSignal('')
  const [cc, setCc] = createSignal('')
  const [bcc, setBcc] = createSignal('')
  const [subject, setSubject] = createSignal('')
  const [body, setBody] = createSignal(DefaultBody)
  const [expanded, setExpanded] = createSignal(false)

  return (
    <div class="flex h-full w-full flex-col" style={{ background: 'white' }}>
      <UIStatusBar style="inApp" />

      <div
        class="relative flex shrink-0 items-center justify-between"
        style={{
          height: `${MailMetrics.titleBarHeight}px`,
          background: MailPalette.titleBar,
          'border-bottom': `1px solid ${MailPalette.barEdge}`,
          padding: '0 5px'
        }}
      >
        <UIBarButton title="Cancel" tone="blueGray" onClick={props.onCancel} />
        <span
          class="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MailMetrics.titleFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
          }}
        >
          <span
            style={{
              'max-width': `${MailMetrics.composeTitleMaxWidth}px`,
              overflow: 'hidden',
              'text-overflow': 'ellipsis',
              'white-space': 'nowrap'
            }}
          >
            {subject().length > 0 ? subject() : 'New Message'}
          </span>
        </span>
        <UIBarButton
          title="Send"
          tone={to().length > 0 ? 'blue' : 'gray'}
          onClick={() => {
            if (to().length === 0) return
            props.onSend(to(), subject(), body())
          }}
        />
      </div>

      <div class="flex-1 overflow-hidden" style={{ background: 'white' }}>
        <ComposeField label="To:" value={to()} onInput={setTo} />
        <ComposeField
          label={expanded() ? 'Cc:' : 'Cc/Bcc:'}
          value={cc()}
          onInput={setCc}
          onFocus={() => setExpanded(true)}
        />
        <div
          class="w-full overflow-hidden"
          style={{
            height: `${expanded() ? MailMetrics.fieldRowHeight : 0}px`,
            transition: caTransition(['height'], reveal)
          }}
        >
          <ComposeField label="Bcc:" value={bcc()} onInput={setBcc} />
        </div>
        <ComposeField label="Subject:" value={subject()} onInput={setSubject} />

        <textarea
          class="w-full resize-none bg-transparent outline-none"
          style={{
            'font-family': HelveticaNeue,
            'font-size': '15.5px',
            color: 'black',
            padding: '8px',
            'min-height': '200px'
          }}
          value={body()}
          onInput={(event) => setBody(event.currentTarget.value)}
        />
      </div>

    </div>
  )
}
