import { Show } from 'solid-js'
import { UIBarButton } from 'UIKit'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import type { MapsRouteStep } from '../Support/MapsTypes'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Chevron = (props: { back: boolean }) => (
  <svg
    viewBox="0 0 12 20"
    aria-hidden="true"
    style={{
      width: `${MapsMetrics.navChevronWidth}px`,
      height: `${MapsMetrics.navChevronHeight}px`,
      transform: props.back ? 'scaleX(-1)' : 'none'
    }}
  >
    <path
      d="M2 1 L11 10 L2 19"
      fill="none"
      stroke="white"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const StepButton = (props: { back: boolean; disabled: boolean; onPress: () => void }) => (
  <button
    type="button"
    class="flex shrink-0 items-center justify-center"
    style={{
      width: `${MapsMetrics.navStepButtonWidth}px`,
      height: `${MapsMetrics.navStepButtonHeight}px`,
      'border-radius': `${MapsMetrics.toolBarButtonRadius}px`,
      background: MapsPalette.navStepFace,
      'box-shadow': 'inset 0 0.6px 1.6px rgba(0,0,0,0.7), 0 0.8px 0 rgba(255,255,255,0.28)',
      opacity: props.disabled ? MapsMetrics.navDisabledOpacity : 1
    }}
    disabled={props.disabled}
    onClick={props.onPress}
  >
    <Chevron back={props.back} />
  </button>
)

export const MapsNavigationBar = (props: {
  step: MapsRouteStep | undefined
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
  onEnd: () => void
}) => (
  <div
    style={{
      background: MapsPalette.barGradient,
      'border-bottom': `1px solid ${MapsPalette.barEdge}`
    }}
  >
    <div
      class="relative flex items-center justify-between"
      style={{
        height: `${MapsMetrics.titleBarHeight}px`,
        padding: `0 ${MapsMetrics.toolBarInsetX}px`,
        gap: `${MapsMetrics.navBarGap}px`
      }}
    >
      <StepButton back disabled={props.index <= 0} onPress={props.onPrevious} />

      <div class="flex min-w-0 flex-1 flex-col items-center">
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MapsMetrics.navInstructionFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.45)',
            'line-height': '1.2',
            'text-align': 'center',
            display: '-webkit-box',
            '-webkit-line-clamp': '2',
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden'
          }}
        >
          {props.step?.instruction ?? ''}
        </span>
        <Show when={(props.step?.distance ?? '').length > 0}>
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MapsMetrics.navDistanceFontSize}px`,
              color: MapsPalette.navSubtitle,
              'text-shadow': '0 -1px 0 rgba(0,0,0,0.35)',
              'white-space': 'nowrap'
            }}
          >
            {props.step?.distance}
          </span>
        </Show>
      </div>

      <StepButton
        back={false}
        disabled={props.index >= props.total - 1}
        onPress={props.onNext}
      />
    </div>

    <div
      class="flex items-center justify-between"
      style={{
        height: `${MapsMetrics.navFooterHeight}px`,
        padding: `0 ${MapsMetrics.toolBarInsetX}px`,
        background: MapsPalette.footerFill,
        'border-top': `1px solid ${MapsPalette.barEdge}`
      }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MapsMetrics.navProgressFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': '0 -1px 0 rgba(0,0,0,0.5)',
          'padding-left': `${MapsMetrics.navProgressInset}px`
        }}
      >
        {props.total > 0 ? `Step ${props.index + 1} of ${props.total}` : ''}
      </span>
      <UIBarButton title="End" tone="blueGray" onClick={props.onEnd} />
    </div>
  </div>
)
