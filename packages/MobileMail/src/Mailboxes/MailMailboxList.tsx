import { For, Show } from 'solid-js'
import { CGImage, assetURL } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { MailFolders, mailUnreadIn } from '../Support/MailStore'
import type { MailFolder } from '../Support/MailTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MailUnreadBadge = (props: { count: number }) => (
  <div class="relative flex items-center" style={{ height: `${MailMetrics.badgeCenterHeight}px` }}>
    <img src={assetURL('unreadbubble_left')} alt="" draggable={false} style={{ height: '100%' }} />
    <div
      class="flex items-center justify-center"
      style={{
        height: '100%',
        'background-image': `url(${assetURL('unreadbubble_center')})`,
        'background-size': '100% 100%',
        'background-repeat': 'repeat-x',
        padding: `0 ${MailMetrics.badgePaddingX}px`
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.badgeFontSize}px`,
          'font-weight': '700',
          color: 'white'
        }}
      >
        {props.count}
      </span>
    </div>
    <img src={assetURL('unreadbubble_right')} alt="" draggable={false} style={{ height: '100%' }} />
  </div>
)

export const MailMailboxRow = (props: {
  folder: MailFolder
  disabled?: boolean
  showChevron?: boolean
  onOpen: (folder: MailFolder) => void
}) => (
  <button
    type="button"
    class="flex w-full items-center"
    style={{
      height: `${MailMetrics.mailboxRowHeight}px`,
      'padding-left': `${MailMetrics.mailboxRowInset}px`,
      'border-bottom': `${MailMetrics.mailboxSeparator}px solid ${MailPalette.mailboxSeparator}`,
      background: 'white'
    }}
    onClick={() => {
      if (props.disabled) return
      props.onOpen(props.folder)
    }}
  >
    <div
      class="flex shrink-0 items-center justify-center"
      style={{ width: `${MailMetrics.mailboxIconWidth}px` }}
    >
      <CGImage name={props.folder.icon} style={{ width: '25px', height: 'auto' }} />
    </div>
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MailMetrics.senderFontSize}px`,
        'font-weight': '700',
        color: props.disabled ? MailPalette.disabledFolder : 'black',
        'margin-left': `${MailMetrics.mailboxNameInset}px`,
        'white-space': 'nowrap'
      }}
    >
      {props.folder.name}
    </span>
    <div class="ml-auto flex items-center" style={{ gap: '6px' }}>
      <Show when={props.folder.path === 'INBOX' && mailUnreadIn('INBOX') > 0}>
        <MailUnreadBadge count={mailUnreadIn('INBOX')} />
      </Show>
      <Show when={props.showChevron !== false}>
        <div style={{ 'margin-right': `${MailMetrics.chevronInset}px` }}>
          <CGImage name="UITableNext" />
        </div>
      </Show>
      <Show when={props.showChevron === false}>
        <div style={{ 'margin-right': `${MailMetrics.chevronInset}px` }} />
      </Show>
    </div>
  </button>
)

export const MailMailboxList = (props: { onOpen: (folder: MailFolder) => void }) => (
  <UIScrollView class="h-full w-full">
    <div style={{ background: 'white', 'min-height': '100%' }}>
      <For each={MailFolders}>
        {(folder) => <MailMailboxRow folder={folder} onOpen={props.onOpen} />}
      </For>
    </div>
  </UIScrollView>
)
