import { createSignal } from 'solid-js'
import { AssetCapInsets, assetURL } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { UIScrollView } from 'UIKit'
import { MailMetrics, MailPalette } from '../Support/MailMetrics'
import { mailDetailDate } from '../Support/MailDate'
import type { MailMessage } from '../Support/MailTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const reveal = caAnimation(MailMetrics.revealDuration, CAMediaTimingFunction.linear)

const ChipInsets = AssetCapInsets.address_atom_disclosure ?? {}
const ChipLeft = ChipInsets.left ?? 0
const ChipRight = ChipInsets.right ?? 0
const AssetScale = 2

const AddressChip = (props: { label: string; onOpen?: () => void }) => (
  <button
    type="button"
    class="flex items-center"
    style={{
      height: `${MailMetrics.detailChipHeight}px`,
      'border-image-source': `url(${assetURL('address_atom_disclosure')})`,
      'border-image-slice': `0 ${ChipRight} 0 ${ChipLeft} fill`,
      'border-image-width': `0 ${ChipRight / AssetScale}px 0 ${ChipLeft / AssetScale}px`,
      'border-style': 'solid',
      'border-color': 'transparent',
      'border-width': `0 ${ChipRight / AssetScale}px 0 ${ChipLeft / AssetScale}px`
    }}
    onClick={() => props.onOpen?.()}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MailMetrics.detailFieldFontSize}px`,
        color: 'black',
        'white-space': 'nowrap'
      }}
    >
      {props.label}
    </span>
  </button>
)

const FieldRow = (props: { label: string; children: unknown }) => (
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
    {props.children as never}
  </div>
)

export const MailBodyView = (props: {
  message: MailMessage
  onOpenSender: () => void
}) => {
  const [details, setDetails] = createSignal(false)

  return (
    <div class="h-full w-full" style={{ background: MailPalette.detailBackdrop }}>
      <UIScrollView class="h-full w-full">
        <div
          class="flex w-full flex-col"
          style={{ 'min-height': '100%', background: 'white', 'box-shadow': '0 0 8px rgba(0,0,0,0.65)' }}
        >
          <FieldRow label="From:">
            <AddressChip
              label={props.message.sender.displayName}
              onOpen={props.onOpenSender}
            />
            <button
              type="button"
              class="ml-auto shrink-0"
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${MailMetrics.detailActionFontSize}px`,
                color: MailPalette.detailAction
              }}
              onClick={() => setDetails(!details())}
            >
              {details() ? 'Hide' : 'Details'}
            </button>
          </FieldRow>

          <div
            class="w-full overflow-hidden"
            style={{
              height: `${details() ? MailMetrics.detailRevealHeight : 0}px`,
              transition: caTransition(['height'], reveal)
            }}
          >
            <FieldRow label="To:">
              <AddressChip label={props.message.to.displayName} />
            </FieldRow>
          </div>

          <div
            class="flex w-full flex-col"
            style={{
              background: 'white',
              padding: `${MailMetrics.detailBlockInset}px ${MailMetrics.detailBlockInset}px`,
              'border-bottom': `1px solid ${MailPalette.fieldSeparator}`
            }}
          >
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${MailMetrics.detailSubjectFontSize}px`,
                'font-weight': '700',
                color: 'black'
              }}
            >
              {props.message.subject.length > 0 ? props.message.subject : '(No Subject)'}
            </span>
            <div style={{ height: `${MailMetrics.detailBlockInset}px` }} />
            <span
              style={{
                'font-family': HelveticaNeue,
                'font-size': `${MailMetrics.previewFontSize}px`,
                color: MailPalette.preview
              }}
            >
              {mailDetailDate(props.message.received)}
            </span>
          </div>

          <div
            class="w-full"
            style={{
              background: 'white',
              padding: '8px',
              'font-family': 'Helvetica, Arial, sans-serif',
              'font-size': '15px',
              color: 'black',
              'line-height': '20px',
              flex: '1'
            }}
            innerHTML={props.message.body}
          />
        </div>
      </UIScrollView>
    </div>
  )
}
