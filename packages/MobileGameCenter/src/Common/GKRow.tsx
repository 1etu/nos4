import { Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkTile } from './GKTexture'

const clipped = {
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap'
} as const

const Detail = (props: { text: string }) => (
  <span
    class="w-full text-left"
    style={{
      ...clipped,
      'font-family': GameCenterFonts.helvetica,
      'font-size': `${GameCenterMetrics.rowStatusFontSize}px`,
      'font-weight': '700',
      'line-height': '1.2',
      color: GameCenterPalette.greenText,
      'text-shadow': GameCenterPalette.greenTextShadow
    }}
  >
    {props.text}
  </span>
)

export const GKRow = (props: {
  above: string
  title: string
  below: string
  separator: boolean
  leading?: JSX.Element
  onOpen: () => void
}) => (
  <button
    type="button"
    class="relative flex w-full items-center"
    style={{ height: `${GameCenterMetrics.rowHeight}px` }}
    onClick={() => props.onOpen()}
  >
    <Show when={props.leading}>{props.leading}</Show>

    <div
      class="flex min-w-0 flex-1 flex-col items-start"
      style={{
        gap: `${GameCenterMetrics.rowTextGap}px`,
        'padding-left': `${props.leading ? 0 : GameCenterMetrics.rowTextInset}px`
      }}
    >
      <Detail text={props.above} />
      <span
        class="w-full text-left"
        style={{
          ...clipped,
          'font-family': GameCenterFonts.clarendon,
          'font-size': `${GameCenterMetrics.rowAliasFontSize}px`,
          'line-height': '1.2',
          color: GameCenterPalette.white,
          'text-shadow': GameCenterPalette.whiteShadow
        }}
      >
        {props.title}
      </span>
      <Detail text={props.below} />
    </div>

    <div style={{ 'padding-right': `${GameCenterMetrics.disclosureInset}px` }}>
      <CGImage name="GKDisclosureIndicator" />
    </div>

    <Show when={props.separator}>
      <div
        class="pointer-events-none absolute bottom-0"
        style={{
          left: `${GameCenterMetrics.rowSeparatorInset}px`,
          right: `${GameCenterMetrics.rowSeparatorInset}px`,
          height: `${GameCenterMetrics.rowSeparator}px`,
          background: gkTile('GKCellBorderTexture')
        }}
      />
    </Show>
  </button>
)
