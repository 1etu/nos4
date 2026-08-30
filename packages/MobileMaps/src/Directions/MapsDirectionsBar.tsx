import { Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsEditingState, type MapsEditingStateValue } from '../Support/MapsTypes'
import { MapsBarButton } from '../Chrome/MapsBarButton'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const fieldShell: JSX.CSSProperties = {
  height: `${MapsMetrics.directionsFieldHeight}px`,
  background: 'white',
  'border-radius': `${MapsMetrics.directionsFieldRadius}px`,
  border: `0.65px solid ${MapsPalette.directionsFieldStroke}`,
  'box-shadow': 'inset 0 1px 1.8px rgba(0,0,0,0.3)',
  padding: `0 ${MapsMetrics.directionsLabelInset}px`,
  gap: '8px'
}

const labelStyle: JSX.CSSProperties = {
  'font-family': HelveticaNeue,
  'font-size': `${MapsMetrics.directionsLabelFontSize}px`,
  color: MapsPalette.fieldPlaceholder,
  'flex-shrink': '0'
}

export const MapsDirectionsBar = (props: {
  origin: string
  destination: string
  editing: MapsEditingStateValue
  onDestination: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onSubmit: () => void
  onSwap: () => void
}) => (
  <div
    class="relative flex items-center"
    style={{
      height: `${MapsMetrics.directionsBarHeight}px`,
      background: MapsPalette.directionsGradient,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`,
      padding: `0 ${MapsMetrics.directionsSwapInset}px`,
      gap: `${MapsMetrics.directionsSwapInset}px`
    }}
  >
    <MapsBarButton icon="DirectionsSwap" onClick={props.onSwap} />
    <div
      class="flex flex-1 flex-col justify-center"
      style={{ gap: `${MapsMetrics.directionsFieldGap}px` }}
    >
      <div class="flex items-center" style={fieldShell}>
        <span style={labelStyle}>Start:</span>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MapsMetrics.directionsLabelFontSize}px`,
            color: MapsPalette.currentLocation,
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis'
          }}
        >
          {props.origin}
        </span>
      </div>
      <div class="flex items-center" style={fieldShell}>
        <span style={labelStyle}>End:</span>
        <input
          type="text"
          value={props.destination}
          enterkeyhint="search"
          class="min-w-0 flex-1 bg-transparent outline-none"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MapsMetrics.directionsLabelFontSize}px`,
            color: 'black'
          }}
          onInput={(event) => props.onDestination(event.currentTarget.value)}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.currentTarget.blur()
            props.onSubmit()
          }}
        />
        <Show when={props.destination.length > 0 && props.editing !== MapsEditingState.none}>
          <button type="button" class="shrink-0" onClick={() => props.onDestination('')}>
            <CGImage name="UITextFieldClearButton" />
          </button>
        </Show>
      </div>
    </div>
  </div>
)
