import { For, type JSX } from 'solid-js'
import { uiInnerShadowTop } from 'UIKit'
import { MobileSafariMetrics, MobileSafariPalette } from '../Support/MobileSafariMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Actions = ['Add Bookmark', 'Add to Home Screen', 'Mail Link to this Page', 'Print'] as const

const SheetButton = (props: {
  label: string
  cancel?: boolean
  style?: JSX.CSSProperties
  onClick: () => void
}) => (
  <button
    type="button"
    class="relative flex shrink-0 items-center justify-center"
    style={{
      height: `${MobileSafariMetrics.shareButtonHeight}px`,
      'margin-left': `${MobileSafariMetrics.shareButtonInsetX}px`,
      'margin-right': `${MobileSafariMetrics.shareButtonInsetX}px`,
      'border-radius': `${MobileSafariMetrics.shareButtonRadius}px`,
      background: MobileSafariPalette.shareShell,
      'box-shadow': 'inset 0 0.33px 1.66px rgb(0,0,0)',
      ...props.style
    }}
    onClick={props.onClick}
  >
    <span
      class="pointer-events-none absolute inset-0"
      style={{
        'border-radius': `${MobileSafariMetrics.shareButtonRadius}px`,
        padding: '0.5px',
        background: MobileSafariPalette.shareShellStroke,
        '-webkit-mask':
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude'
      }}
    />
    <span
      class="absolute"
      style={{
        inset: `${MobileSafariMetrics.shareInnerInset}px`,
        'border-radius': `${MobileSafariMetrics.shareInnerRadius}px`,
        background: props.cancel
          ? MobileSafariPalette.shareCancelFace
          : MobileSafariPalette.shareButtonFace,
        opacity: props.cancel ? '0.6' : '1'
      }}
    />
    <span
      class="pointer-events-none absolute"
      style={{
        inset: `${MobileSafariMetrics.shareInnerInset}px`,
        'border-radius': `${MobileSafariMetrics.shareInnerRadius}px`,
        padding: '0.4px',
        background: props.cancel
          ? MobileSafariPalette.shareCancelStroke
          : MobileSafariPalette.shareFaceStroke,
        opacity: props.cancel ? '0.6' : '1',
        '-webkit-mask':
          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        '-webkit-mask-composite': 'xor',
        'mask-composite': 'exclude'
      }}
    />
    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileSafariMetrics.shareFontSize}px`,
        'font-weight': '700',
        color: props.cancel ? 'white' : 'black',
        'text-shadow': props.cancel
          ? '0 -0.9px 0 rgba(0,0,0,0.9)'
          : '0 0.9px 0 rgba(255,255,255,0.9)'
      }}
    >
      {props.label}
    </span>
  </button>
)

export const SafariShareSheet = (props: {
  height: number
  onAddBookmark: () => void
  onCancel: () => void
}) => (
  <div
    class="relative w-full"
    style={{ height: `${props.height}px`, contain: 'paint' }}
  >
    <div class="absolute inset-0 flex flex-col">
      <div
        style={{
          height: `${MobileSafariMetrics.shareTopBarHeight}px`,
          'flex-shrink': '0',
          background: `${uiInnerShadowTop('rgba(255,255,255,0.735)', MobileSafariMetrics.shareGlossHeight)}, ${MobileSafariPalette.shareTop}`,
          'border-top': '1px solid black'
        }}
      />
      <div class="flex-1" style={{ background: MobileSafariPalette.shareBody }} />
    </div>

    <div
      class="absolute inset-0 flex flex-col"
      style={{ gap: `${MobileSafariMetrics.shareRowSpacing}px` }}
    >
      <For each={Actions}>
        {(label, index) => (
          <SheetButton
            label={label}
            style={{
              'margin-top':
                index() === 0
                  ? `${MobileSafariMetrics.shareTopPadding}px`
                  : `${MobileSafariMetrics.shareGap}px`,
              'margin-bottom': `${MobileSafariMetrics.shareGap}px`
            }}
            onClick={() => {
              if (index() === 0) props.onAddBookmark()
            }}
          />
        )}
      </For>

      <div class="flex-1" />

      <SheetButton
        label="Cancel"
        cancel
        style={{ 'margin-bottom': `${MobileSafariMetrics.shareCancelBottom}px` }}
        onClick={props.onCancel}
      />
    </div>
  </div>
)
