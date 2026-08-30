import { Show } from 'solid-js'
import { CGImage, assetPointSize, assetURL } from 'CoreGraphics'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const BackButton = (props: { label: string; onClick: () => void }) => {
  const size = assetPointSize('Button2')
  const height = (MailMetrics.backButtonWidth * size.height) / size.width
  return (
    <button
      type="button"
      class="relative flex shrink-0 items-center justify-center"
      style={{
        width: `${MailMetrics.backButtonWidth}px`,
        height: `${height}px`,
        'margin-left': `${MailMetrics.backInset}px`,
        'background-image': `url(${assetURL('Button2')})`,
        'background-size': '100% 100%'
      }}
      onClick={props.onClick}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.backFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
          'padding-left': '5px',
          'white-space': 'nowrap',
          overflow: 'hidden'
        }}
      >
        {props.label}
      </span>
    </button>
  )
}

const StepControl = (props: { onUp: () => void; onDown: () => void }) => (
  <div
    class="flex shrink-0 overflow-hidden"
    style={{
      width: `${MailMetrics.segmentedWidth}px`,
      height: `${MailMetrics.segmentedHeight}px`,
      'margin-right': `${MailMetrics.backInset}px`,
      'border-radius': '5px',
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)',
      background:
        'linear-gradient(180deg, rgb(142,166,196) 0%, rgb(88,119,166) 50%, rgb(71,105,153) 53%, rgb(74,108,155) 100%)'
    }}
  >
    <button type="button" class="flex flex-1 items-center justify-center" onClick={props.onUp}>
      <CGImage name="arrowup" />
    </button>
    <div style={{ width: '1px', background: 'rgb(119,128,144)' }} />
    <button type="button" class="flex flex-1 items-center justify-center" onClick={props.onDown}>
      <CGImage name="arrowdown" />
    </button>
  </div>
)

export const MailTitleBar = (props: {
  title: string
  back?: string
  stepping?: boolean
  onBack?: () => void
  onUp?: () => void
  onDown?: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${MailMetrics.titleBarHeight}px`,
      background: MailPalette.titleBar,
      'border-bottom': `1px solid ${MailPalette.barEdge}`,
      'box-shadow': `inset 0 -1px 0 ${MailPalette.barHighlight}`
    }}
  >
    <Show when={props.back}>
      {(label) => <BackButton label={label()} onClick={() => props.onBack?.()} />}
    </Show>

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
          'max-width': `${MailMetrics.titleMaxWidth}px`,
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap'
        }}
      >
        {props.title}
      </span>
    </span>

    <Show when={props.stepping}>
      <div class="ml-auto">
        <StepControl onUp={() => props.onUp?.()} onDown={() => props.onDown?.()} />
      </div>
    </Show>
  </div>
)
