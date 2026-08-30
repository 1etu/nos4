import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { mailTotalIn, mailUnreadIn } from '../Support/MailStore'
import type { MailMessage } from '../Support/MailTypes'
import { MailMessageRow } from './MailMessageRow'
import { MailSearchField } from './MailSearchField'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const LoadMoreRow = (props: { path: string; onLoad: () => void }) => (
  <button
    type="button"
    class="flex w-full items-center"
    style={{
      height: `${MailMetrics.messageRowHeight}px`,
      background: 'white',
      'border-bottom': `1px solid ${MailPalette.messageSeparator}`
    }}
    onClick={props.onLoad}
  >
    <div
      class="flex min-w-0 flex-1 flex-col"
      style={{
        'padding-left': `${MailMetrics.rowTextInset}px`,
        transform: `translateY(-${MailMetrics.rowTextLift}px)`,
        'text-align': 'left'
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.senderFontSize}px`,
          'font-weight': '700',
          color: MailPalette.accent,
          'white-space': 'nowrap'
        }}
      >
        Load More Messages...
      </span>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.previewFontSize}px`,
          color: MailPalette.preview
        }}
      >
        {`${mailTotalIn(props.path)} messages total, ${mailUnreadIn(props.path)} unread`}
      </span>
    </div>
    <div style={{ 'margin-right': `${MailMetrics.chevronInset}px` }}>
      <CGImage name="UITableNext" />
    </div>
  </button>
)

export const MailMessageList = (props: {
  path: string
  messages: readonly MailMessage[]
  search: string
  onSearch: (value: string) => void
  onOpen: (message: MailMessage) => void
  onLoadMore: () => void
}) => (
  <UIScrollView class="h-full w-full">
    <div style={{ background: MailPalette.listBackdrop, 'min-height': '100%' }}>
      <MailSearchField value={props.search} onInput={props.onSearch} />
      <For each={props.messages}>
        {(message) => <MailMessageRow message={message} onOpen={props.onOpen} />}
      </For>
      <Show when={props.messages.length > 0}>
        <LoadMoreRow path={props.path} onLoad={props.onLoadMore} />
      </Show>
      <div style={{ background: 'white', height: '100%', 'min-height': '160px' }} />
    </div>
  </UIScrollView>
)
