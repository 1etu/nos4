import { Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { AssetCapInsets, CGImage, assetURL, type AssetName } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsPinTone, type MapsAnnotation } from '../Support/MapsTypes'
import type { MKPoint } from './MKProjection'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const AssetScale = 2

const capStyle = (name: AssetName): JSX.CSSProperties => {
  const insets = AssetCapInsets[name] ?? {}
  const left = insets.left ?? 0
  const right = insets.right ?? 0
  return {
    width: '50%',
    height: `${MapsMetrics.calloutCapHeight}px`,
    'border-image-source': `url(${assetURL(name)})`,
    'border-image-slice': `0 ${right} 0 ${left} fill`,
    'border-image-width': `0 ${right / AssetScale}px 0 ${left / AssetScale}px`,
    'border-style': 'solid',
    'border-color': 'transparent',
    'border-width': `0 ${right / AssetScale}px 0 ${left / AssetScale}px`
  }
}

const MKCallout = (props: { title: string }) => (
  <div
    class="pointer-events-none absolute left-1/2 flex items-center justify-center"
    style={{
      bottom: `${MapsMetrics.pinHeight - MapsMetrics.pinAnchorY}px`,
      transform: 'translateX(-50%)',
      height: `${MapsMetrics.calloutHeight}px`
    }}
  >
    <div class="relative flex items-center" style={{ height: `${MapsMetrics.calloutHeight}px` }}>
      <div class="absolute left-0 top-0 flex w-full">
        <div style={capStyle('UICalloutViewLeftCap')} />
        <div style={capStyle('UICalloutViewRightCap')} />
      </div>
      <CGImage
        name="UICalloutViewBottomAnchor"
        class="absolute left-1/2 top-0"
        style={{ transform: 'translateX(-50%)' }}
      />
      <div
        class="relative flex items-center"
        style={{
          height: `${MapsMetrics.calloutCapHeight}px`,
          padding: `0 ${MapsMetrics.calloutInsetX}px`,
          gap: `${MapsMetrics.calloutGap}px`
        }}
      >
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MapsMetrics.calloutFontSize}px`,
            'font-weight': '700',
            color: MapsPalette.calloutInk,
            'line-height': `${MapsMetrics.calloutCapHeight}px`,
            'text-shadow': '0 -0.66px 0 rgba(0,0,0,0.51)',
            'white-space': 'nowrap',
            'max-width': '190px',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
          }}
        >
          {props.title}
        </span>
        <CGImage name="ABTableNextButton" />
      </div>
    </div>
  </div>
)

export const MKAnnotationPin = (props: {
  annotation: MapsAnnotation
  at: MKPoint
  selected: boolean
  onSelect: () => void
}) => (
  <div
    class="absolute"
    style={{
      left: `${props.at.x + MapsMetrics.pinAnchorX - MapsMetrics.pinWidth / 2}px`,
      top: `${props.at.y - MapsMetrics.pinAnchorY - MapsMetrics.pinHeight / 2}px`,
      width: `${MapsMetrics.pinWidth}px`,
      height: `${MapsMetrics.pinHeight}px`,
      'z-index': props.selected ? '3' : '2'
    }}
  >
    <Show when={props.selected}>
      <MKCallout title={props.annotation.title} />
    </Show>
    <button
      type="button"
      class="block h-full w-full"
      onClick={(event) => {
        event.stopPropagation()
        props.onSelect()
      }}
    >
      <CGImage
        name={props.annotation.tone === MapsPinTone.origin ? 'PinGreen' : 'Pin'}
        style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))' }}
      />
    </button>
  </div>
)
