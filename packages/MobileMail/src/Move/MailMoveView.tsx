import { For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIBarButton, UIScrollView, UIStatusBar } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { MailFolders } from '../Support/MailStore'
import type { MailMessage } from '../Support/MailTypes'
import { MailMailboxRow } from '../Mailboxes/MailMailboxList'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const TopText = 'Move this message to a new mailbox.'

export const MailMoveView = (props: {
  message: MailMessage
  onCancel: () => void
  onMove: (path: string) => void
}) => (
  <div class="flex h-full w-full flex-col" style={{ background: 'white' }}>
    <UIStatusBar style="inApp" />

    <div
      class="relative flex shrink-0 flex-col"
      style={{
        height: `${MailMetrics.moveTitleBarHeight}px`,
        background: MailPalette.moveTitleBar,
        'border-bottom': `1px solid ${MailPalette.barEdge}`
      }}
    >
      <span
        class="text-center"
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.moveTopTextFontSize}px`,
          color: MailPalette.moveTopText,
          'text-shadow': '0 0.66px 0 rgba(255,255,255,0.65)',
          padding: '12px 24px 0'
        }}
      >
        {TopText}
      </span>
      <div class="relative flex flex-1 items-center">
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
          Mailboxes
        </span>
        <div class="ml-auto" style={{ 'margin-right': '5px', 'margin-bottom': '12px' }}>
          <UIBarButton title="Cancel" tone="blueGray" onClick={props.onCancel} />
        </div>
      </div>
    </div>

    <div
      class="flex shrink-0 flex-col justify-center"
      style={{
        height: `${MailMetrics.moveHeaderHeight}px`,
        background: MailPalette.moveHeader,
        'border-bottom': `1px solid ${MailPalette.moveHeaderRule}`,
        padding: `0 ${MailMetrics.moveHeaderIconInset}px`
      }}
    >
      <div class="flex items-center" style={{ gap: '8px' }}>
        <CGImage name="envelope" style={{ width: '30px', height: 'auto' }} />
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MailMetrics.senderFontSize}px`,
            'font-weight': '700',
            color: 'black',
            'text-shadow': '0 0.9px 0 rgba(255,255,255,0.8)',
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
          }}
        >
          {props.message.sender.displayName}
        </span>
      </div>
      <div style={{ height: '2px' }} />
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MailMetrics.senderFontSize}px`,
          color: MailPalette.moveSubject,
          'text-shadow': '0 0.9px 0 rgba(255,255,255,0.8)',
          'white-space': 'nowrap',
          overflow: 'hidden',
          'text-overflow': 'ellipsis'
        }}
      >
        {props.message.subject.length > 0 ? props.message.subject : '(No Subject)'}
      </span>
    </div>

    <UIScrollView class="flex-1">
      <div style={{ background: 'white', 'min-height': '100%' }}>
        <For each={MailFolders}>
          {(folder) => (
            <MailMailboxRow
              folder={folder}
              disabled={folder.path === props.message.folder || folder.path === 'Drafts'}
              showChevron={false}
              onOpen={() => props.onMove(folder.path)}
            />
          )}
        </For>
      </div>
    </UIScrollView>
  </div>
)
