import { Show, type JSX } from 'solid-js'
import { assetPointSize, assetURL, type AssetName } from 'CoreGraphics'
import { AppStoreMetrics, AppStorePalette } from '../Support/AppStoreMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface AppStoreBackSpec {
  readonly label: string
  readonly asset: AssetName
  readonly width: number
  readonly offsetX: number
}

const BackButton = (props: { spec: AppStoreBackSpec; onBack: () => void }) => {
  const size = () => assetPointSize(props.spec.asset)
  const height = () => (props.spec.width * size().height) / size().width

  return (
    <button
      type="button"
      class="absolute flex items-center justify-center"
      style={{
        left: `${AppStoreMetrics.backButtonInset}px`,
        width: `${props.spec.width}px`,
        height: `${height()}px`,
        'background-image': `url(${assetURL(props.spec.asset)})`,
        'background-size': '100% 100%'
      }}
      onClick={() => props.onBack()}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${AppStoreMetrics.backButtonFontSize}px`,
          'font-weight': '700',
          'line-height': '1',
          color: 'white',
          'text-shadow': AppStorePalette.backLabelShadow,
          'padding-left': `${AppStoreMetrics.backButtonLabelInset}px`,
          transform: `translate(${props.spec.offsetX}px, ${AppStoreMetrics.backButtonLabelOffsetY}px)`
        }}
      >
        {props.spec.label}
      </span>
    </button>
  )
}

export const AppStoreTitleBar = (props: {
  title: string
  clampTitle: boolean
  titleView?: JSX.Element
  back?: AppStoreBackSpec
  onBack: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center justify-center"
    style={{
      height: `${AppStoreMetrics.titleBarHeight}px`,
      background: AppStorePalette.navBar,
      'box-shadow': `inset 0 -1px 0 ${AppStorePalette.navBorder}`
    }}
  >
    <Show
      when={props.titleView}
      fallback={
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${AppStoreMetrics.titleFontSize}px`,
            'font-weight': '700',
            'line-height': '1',
            color: 'white',
            'text-shadow': AppStorePalette.navTitleShadow,
            'max-width': props.clampTitle ? `${AppStoreMetrics.titleMaxWidth}px` : 'none',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'white-space': 'nowrap'
          }}
        >
          {props.title}
        </span>
      }
    >
      {(view) => view()}
    </Show>

    <Show when={props.back}>
      {(spec) => <BackButton spec={spec()} onBack={props.onBack} />}
    </Show>
  </div>
)
