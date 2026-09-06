import { CompassMetrics, CompassPalette } from '../Support/CompassMetrics'
import { CompassHeadingState, type CompassHeadingStateValue } from '../Support/CompassHeading'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Copy: Readonly<Record<string, { title: string; detail: string; action?: string }>> = {
  [CompassHeadingState.needsPermission]: {
    title: 'Compass Needs Your Heading',
    detail: 'Allow motion access so the needle can find magnetic north.',
    action: 'Turn On Compass'
  },
  [CompassHeadingState.denied]: {
    title: 'Motion Access Is Off',
    detail: 'Turn on Motion & Orientation Access in your browser settings, then reopen Compass.'
  },
  [CompassHeadingState.unavailable]: {
    title: 'No Compass Found',
    detail: 'This device has no magnetometer, so the needle cannot point north.'
  }
}

export const CompassPrompt = (props: {
  state: CompassHeadingStateValue
  onRequest: () => void
}) => {
  const copy = () => Copy[props.state]

  return (
    <div
      class="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        background: CompassPalette.promptScrim,
        padding: `0 ${CompassMetrics.promptInsetX}px`,
        'text-align': 'center'
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${CompassMetrics.promptTitleFontSize}px`,
          'font-weight': '700',
          color: CompassPalette.text,
          'text-shadow': CompassPalette.textShadow
        }}
      >
        {copy()?.title ?? ''}
      </span>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${CompassMetrics.promptDetailFontSize}px`,
          'line-height': '1.35',
          color: CompassPalette.promptDetail,
          'text-shadow': CompassPalette.textShadow,
          'margin-top': `${CompassMetrics.promptDetailTopInset}px`,
          'max-width': `${CompassMetrics.promptDetailMaxWidth}px`
        }}
      >
        {copy()?.detail ?? ''}
      </span>
      {copy()?.action ? (
        <button
          type="button"
          class="flex items-center justify-center"
          style={{
            height: `${CompassMetrics.buttonHeight}px`,
            padding: `0 ${CompassMetrics.promptButtonPaddingX}px`,
            'margin-top': `${CompassMetrics.promptButtonTopInset}px`,
            'border-radius': `${CompassMetrics.buttonRadius}px`,
            background: CompassPalette.buttonFace,
            'box-shadow': CompassPalette.buttonShadow
          }}
          onClick={props.onRequest}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CompassMetrics.promptButtonFontSize}px`,
              'font-weight': '700',
              color: CompassPalette.text,
              'text-shadow': CompassPalette.textShadow
            }}
          >
            {copy()?.action ?? ''}
          </span>
        </button>
      ) : undefined}
    </div>
  )
}
