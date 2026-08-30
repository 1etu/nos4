import { Show } from 'solid-js'
import { CGImage, type AssetName } from 'CoreGraphics'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { mailRefreshing, mailUpdated } from '../Support/MailStore'
import { mailUpdatedLabel } from '../Support/MailDate'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const ToolButton = (props: { icon: AssetName; onClick: () => void }) => (
  <button type="button" class="shrink-0" onClick={props.onClick}>
    <CGImage
      name={props.icon}
      style={{ filter: 'drop-shadow(0 -1px 0 rgba(0,0,0,0.41))' }}
    />
  </button>
)

const StatusArea = () => (
  <div class="flex flex-col items-center justify-center">
    <Show
      when={mailRefreshing()}
      fallback={
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MailMetrics.toolBarStatusFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.41)',
            'white-space': 'nowrap'
          }}
        >
          {`Updated ${mailUpdatedLabel(mailUpdated())}`}
        </span>
      }
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.toolBarStatusFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.41)',
          'white-space': 'nowrap'
        }}
      >
        Checking for Mail...
      </span>
    </Show>
  </div>
)

export const MailToolBar = (props: {
  detail: boolean
  onRefresh: () => void
  onCompose: () => void
  onMove?: () => void
  onDelete?: () => void
  onReply?: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${MailMetrics.toolBarHeight}px`,
      background: MailPalette.toolBar,
      'border-top': `1px solid ${MailPalette.barEdge}`,
      padding: `0 ${MailMetrics.toolBarInset}px`
    }}
  >
    <ToolButton icon="UIButtonBarRefresh" onClick={props.onRefresh} />

    <Show
      when={props.detail}
      fallback={
        <>
          <div class="flex flex-1 justify-center">
            <StatusArea />
          </div>
          <ToolButton icon="UIButtonBarCompose" onClick={props.onCompose} />
        </>
      }
    >
      <div class="flex flex-1 items-center justify-around">
        <ToolButton icon="UIButtonBarOrganize" onClick={() => props.onMove?.()} />
        <ToolButton icon="UIButtonBarTrash" onClick={() => props.onDelete?.()} />
        <ToolButton icon="UIButtonBarReply" onClick={() => props.onReply?.()} />
      </div>
      <ToolButton icon="UIButtonBarCompose" onClick={props.onCompose} />
    </Show>
  </div>
)
