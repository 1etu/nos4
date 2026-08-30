import { Show } from 'solid-js'
import { assetPointSize, assetURL, type AssetName } from 'CoreGraphics'
import { PreferencesMetrics, PreferencesPalette } from '../Support/PreferencesMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export interface PreferencesBackSpec {
  readonly label: string
  readonly destination: string
  readonly asset: AssetName
  readonly width: number
}

const BackButton = (props: { spec: PreferencesBackSpec; onBack: (id: string) => void }) => {
  const size = () => assetPointSize(props.spec.asset)
  const height = () => (props.spec.width * size().height) / size().width
  return (
    <button
      type="button"
      class="relative flex items-center justify-center"
      style={{
        width: `${props.spec.width}px`,
        height: `${height()}px`,
        'margin-left': `${PreferencesMetrics.backInset}px`,
        'background-image': `url(${assetURL(props.spec.asset)})`,
        'background-size': '100% 100%'
      }}
      onClick={() => props.onBack(props.spec.destination)}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PreferencesMetrics.backFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
          'padding-left': '5px'
        }}
      >
        {props.spec.label}
      </span>
    </button>
  )
}

export const PreferencesTitleBar = (props: {
  title: string
  back: PreferencesBackSpec | undefined
  onBack: (id: string) => void
}) => (
  <div
    class="relative flex shrink-0 items-center"
    style={{
      height: `${PreferencesMetrics.titleBarHeight}px`,
      background: PreferencesPalette.titleBar,
      'border-bottom': `1px solid ${PreferencesPalette.titleBarEdge}`,
      'box-shadow': `inset 0 -1px 0 ${PreferencesPalette.titleBarHighlight}`
    }}
  >
    <Show when={props.back}>
      {(spec) => <BackButton spec={spec()} onBack={props.onBack} />}
    </Show>
    <span
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${PreferencesMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)'
      }}
    >
      {props.title}
    </span>
  </div>
)
