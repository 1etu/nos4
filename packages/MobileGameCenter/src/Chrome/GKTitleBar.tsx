import { Show } from 'solid-js'
import { CGImage, CGResizableImage } from 'CoreGraphics'
import {
  GameCenterFonts,
  GameCenterMetrics,
  GameCenterPalette
} from '../Support/GameCenterMetrics'
import { gkCover } from '../Common/GKTexture'
import { GKBarButton } from './GKBarButton'

export const GKTitleBar = (props: {
  title: string
  backTitle?: string
  onBack?: () => void
  onAdd?: () => void
  onCancel?: () => void
  onDone?: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center justify-center"
    style={{
      height: `${GameCenterMetrics.titleBarHeight}px`,
      background: gkCover('GKNavbarPortrait'),
      'box-shadow': GameCenterPalette.navShadow
    }}
  >
    <span
      style={{
        'font-family': GameCenterFonts.helvetica,
        'font-size': `${GameCenterMetrics.titleFontSize}px`,
        'font-weight': '700',
        'line-height': '1',
        'white-space': 'nowrap',
        color: GameCenterPalette.white,
        'text-shadow': GameCenterPalette.titleShadow
      }}
    >
      {props.title}
    </span>

    <Show when={props.onCancel}>
      <div class="absolute" style={{ left: `${GameCenterMetrics.barButtonInset}px` }}>
        <GKBarButton title="Cancel" onPress={() => props.onCancel?.()} />
      </div>
    </Show>

    <Show when={props.onDone}>
      <div class="absolute" style={{ right: `${GameCenterMetrics.barButtonInset}px` }}>
        <GKBarButton title="Done" onPress={() => props.onDone?.()} />
      </div>
    </Show>

    <Show when={props.backTitle}>
      {(label) => (
        <button
          type="button"
          class="absolute flex items-center justify-center"
          style={{
            left: `${GameCenterMetrics.backButtonInset}px`,
            width: `${GameCenterMetrics.backButtonWidth}px`,
            height: `${GameCenterMetrics.backButtonHeight}px`
          }}
          onClick={() => props.onBack?.()}
        >
          <CGResizableImage
            name="GKNavbarBackButtonNormal"
            width={GameCenterMetrics.backButtonWidth}
            height={GameCenterMetrics.backButtonHeight}
            class="absolute inset-0"
          />
          <span
            class="relative"
            style={{
              'font-family': GameCenterFonts.helvetica,
              'font-size': `${GameCenterMetrics.backButtonFontSize}px`,
              'font-weight': '700',
              'line-height': '1',
              transform: `translateY(${GameCenterMetrics.backButtonLabelOffsetY}px)`,
              color: GameCenterPalette.white,
              'text-shadow': GameCenterPalette.backLabelShadow
            }}
          >
            {label()}
          </span>
        </button>
      )}
    </Show>

    <Show when={props.onAdd}>
      <button
        type="button"
        class="absolute flex items-center justify-center overflow-hidden"
        style={{
          right: `${GameCenterMetrics.plusButtonInset}px`,
          width: `${GameCenterMetrics.plusButtonSize}px`,
          height: `${GameCenterMetrics.plusButtonSize}px`,
          'border-radius': `${GameCenterMetrics.plusButtonRadius}px`,
          background: gkCover('GKNavbarPortrait'),
          'box-shadow': GameCenterPalette.plusInnerShadow
        }}
        onClick={() => props.onAdd?.()}
      >
        <CGImage
          name="UIButtonBarPlus"
          style={{ width: `${GameCenterMetrics.plusGlyphWidth}px`, height: 'auto' }}
        />
      </button>
    </Show>
  </div>
)
