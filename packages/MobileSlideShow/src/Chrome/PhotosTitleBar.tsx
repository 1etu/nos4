import { Show } from 'solid-js'
import { CGImage, CGResizableImage } from 'CoreGraphics'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const BackButton = (props: { label: string; width: number; onClick: () => void }) => (
  <button
    type="button"
    class="relative flex items-center justify-center"
    style={{
      width: `${props.width}px`,
      height: `${PhotosMetrics.backButtonHeight}px`,
      'margin-left': `${PhotosMetrics.backButtonLeading}px`
    }}
    onClick={props.onClick}
  >
    <CGResizableImage
      name="UINavigationBarBlackTranslucentBack"
      width={props.width}
      height={PhotosMetrics.backButtonHeight}
      class="absolute inset-0"
    />
    <span
      class="relative"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PhotosMetrics.backButtonFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'padding-left': `${PhotosMetrics.backButtonLabelLeading}px`,
        'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
        transform: `translateY(${PhotosMetrics.backButtonLabelOffsetY}px)`,
        'white-space': 'nowrap'
      }}
    >
      {props.label}
    </span>
  </button>
)

export const ToolBarRectangleButton = (props: { icon: 'UIButtonBarAction'; onClick?: () => void }) => (
  <button
    type="button"
    class="flex items-center justify-center"
    style={{
      height: `${PhotosMetrics.toolBarButtonHeight}px`,
      padding: `0 ${PhotosMetrics.toolBarButtonPaddingX}px`,
      'border-radius': `${PhotosMetrics.toolBarButtonRadius}px`,
      background: PhotosPalette.blackButtonGradient,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)'
    }}
    onClick={() => props.onClick?.()}
  >
    <CGImage
      name={props.icon}
      style={{
        width: `${PhotosMetrics.toolBarButtonIconWidth}px`,
        height: 'auto',
        transform: 'translate(2px, -1px)'
      }}
    />
  </button>
)

export const PhotosTitleBar = (props: {
  title: string
  backLabel?: string
  backWidth?: number
  showAction?: boolean
  onBack?: () => void
  onAction?: () => void
}) => (
  <div class="relative flex items-center" style={{ height: `${PhotosMetrics.titleBarHeight}px` }}>
    <div
      class="absolute inset-0"
      style={{
        background: PhotosPalette.barGradient,
        'border-bottom': `0.95px solid ${PhotosPalette.barBorderBottom}`,
        'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.15)',
        opacity: `${PhotosMetrics.barOpacity}`
      }}
    />

    <Show when={props.backLabel}>
      {(label) => (
        <BackButton
          label={label()}
          width={props.backWidth ?? PhotosMetrics.backButtonAlbumsWidth}
          onClick={() => props.onBack?.()}
        />
      )}
    </Show>

    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhotosMetrics.titleFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)',
          'white-space': 'nowrap'
        }}
      >
        {props.title}
      </span>
    </div>

    <Show when={props.showAction}>
      <div class="relative ml-auto" style={{ 'margin-right': `${PhotosMetrics.actionButtonTrailing}px` }}>
        <ToolBarRectangleButton icon="UIButtonBarAction" onClick={props.onAction} />
      </div>
    </Show>
  </div>
)
