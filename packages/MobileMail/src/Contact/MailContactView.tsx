import { For } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView, UITableGroup, UITableRow } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import type { MailAddress } from '../Support/MailTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Actions: readonly string[] = ['Create New Contact', 'Add to Existing Contact']

export const MailContactView = (props: { sender: MailAddress }) => (
  <div class="h-full w-full" style={{ background: MailPalette.settingsBackdrop }}>
    <UIScrollView class="h-full w-full">
      <div
        class="flex flex-col"
        style={{
          gap: '20px',
          'padding-top': '20px',
          'padding-bottom': `${MailMetrics.listTopSpacing}px`
        }}
      >
        <div class="flex items-center" style={{ 'padding-left': `${MailMetrics.contactPhotoInset}px` }}>
          <CGImage
            name="ABPicturePerson"
            style={{
              width: `${MailMetrics.contactPhotoWidth}px`,
              height: `${MailMetrics.contactPhotoHeight}px`
            }}
          />
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MailMetrics.contactNameFontSize}px`,
              'font-weight': '700',
              color: 'black',
              'text-shadow': '0 0.9px 0 rgba(255,255,255,0.9)',
              'margin-left': '5px'
            }}
          >
            {props.sender.displayName}
          </span>
        </div>

        <UITableGroup>
          <UITableRow>
            <div
              class="flex h-full w-full items-center"
              style={{ padding: `0 ${MailMetrics.chevronInset}px` }}
            >
              <span
                class="shrink-0 text-right"
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${MailMetrics.contactRowFontSize}px`,
                  'font-weight': '700',
                  color: MailPalette.contactLink,
                  width: '75px'
                }}
              >
                other
              </span>
              <span
                style={{
                  'font-family': HelveticaNeue,
                  'font-size': `${MailMetrics.detailSubjectFontSize}px`,
                  'font-weight': '700',
                  color: 'black',
                  'margin-left': '5px',
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis'
                }}
              >
                {props.sender.mailbox}
              </span>
            </div>
          </UITableRow>
        </UITableGroup>

        <UITableGroup>
          <For each={Actions}>
            {(action, at) => (
              <UITableRow separator={at() < Actions.length - 1}>
                <div class="flex h-full w-full items-center justify-center">
                  <span
                    style={{
                      'font-family': HelveticaNeue,
                      'font-size': `${MailMetrics.contactRowFontSize}px`,
                      'font-weight': '700',
                      color: MailPalette.contactLink
                    }}
                  >
                    {action}
                  </span>
                </div>
              </UITableRow>
            )}
          </For>
        </UITableGroup>
      </div>
    </UIScrollView>
  </div>
)
