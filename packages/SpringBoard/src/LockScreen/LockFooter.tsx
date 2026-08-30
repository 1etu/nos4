import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const knobHeight = SpringBoardMetrics.lockFooterHeight - SpringBoardMetrics.sliderVerticalInset * 2

const UnlockArrow = () => (
  <svg
    width={SpringBoardMetrics.sliderArrowSize}
    height={(SpringBoardMetrics.sliderArrowSize * 24) / 40}
    viewBox="0 0 40 24"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="sbUnlockArrow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.5" stop-color="rgb(166,166,166)" />
        <stop offset="0.5" stop-color="rgb(134,134,134)" />
      </linearGradient>
    </defs>
    <path d="M3 7.5 H21 V1 L38.5 12 L21 23 V16.5 H3 Z" fill="url(#sbUnlockArrow)" />
  </svg>
)

export const LockFooter = (props: {
  offset: number
  dragging: boolean
  onPointerDown: (event: PointerEvent) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: () => void
}) => (
  <div class="relative" style={{ height: `${SpringBoardMetrics.lockFooterHeight}px` }}>
    <div
      class="absolute inset-x-0 top-0"
      style={{
        height: '50%',
        background: 'linear-gradient(to bottom, rgba(41,40,40,0.6), rgba(21,20,20,0.65))',
        'border-top': '1px solid black'
      }}
    >
      <div
        class="absolute inset-x-0 top-0"
        style={{
          height: `${SpringBoardMetrics.lockFooterHighlightHeight}px`,
          background: `linear-gradient(to bottom, rgba(255,255,255,${SpringBoardMetrics.lockFooterHighlightAlpha}), rgba(255,255,255,0) 50%, transparent)`
        }}
      />
    </div>
    <div
      class="absolute inset-x-0 bottom-0"
      style={{ height: '50%', background: 'rgba(0,0,0,0.835)' }}
    />

    <div
      class="absolute"
      style={{
        left: `${SpringBoardMetrics.sliderTrackInset}px`,
        right: `${SpringBoardMetrics.sliderTrackInset}px`,
        top: `${SpringBoardMetrics.sliderTrackVerticalInset}px`,
        bottom: `${SpringBoardMetrics.sliderTrackVerticalInset}px`,
        'border-radius': `${SpringBoardMetrics.sliderTrackRadius}px`,
        padding: `${SpringBoardMetrics.sliderTrackStroke}px`,
        background: 'linear-gradient(to bottom, rgb(83,83,83), rgb(143,143,143))'
      }}
    >
      <div
        class="h-full w-full"
        style={{
          'border-radius': `${SpringBoardMetrics.sliderTrackRadius - SpringBoardMetrics.sliderTrackStroke}px`,
          background: 'linear-gradient(to bottom, rgb(3,3,3), rgb(21,21,21), rgb(32,32,32))'
        }}
      />
    </div>

    <div
      class="absolute inset-0 flex items-center"
      style={{ 'padding-left': `${SpringBoardMetrics.sliderLeadingInset}px` }}
    >
      <div
        class="relative"
        style={{
          width: `${SpringBoardMetrics.sliderKnobWidth}px`,
          height: `${knobHeight}px`,
          'border-radius': `${SpringBoardMetrics.sliderKnobRadius}px`,
          background: 'linear-gradient(to bottom, rgb(208,208,208), rgb(168,168,168))',
          overflow: 'hidden',
          'z-index': '1',
          transform: `translateX(${props.offset}px)`,
          transition: props.dragging ? 'none' : 'transform 0.15s linear',
          'touch-action': 'none'
        }}
        onPointerDown={props.onPointerDown}
        onPointerMove={props.onPointerMove}
        onPointerUp={props.onPointerUp}
        onPointerCancel={props.onPointerUp}
      >
        <div
          class="absolute inset-x-0 top-0"
          style={{
            height: '50%',
            background: 'linear-gradient(to bottom, rgb(243,243,243), rgb(225,225,225))'
          }}
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <UnlockArrow />
        </div>
      </div>

      <div class="flex-1" />

      <div style={{ 'padding-right': `${SpringBoardMetrics.sliderLabelTrailing}px` }}>
        <span
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${SpringBoardMetrics.sliderLabelFontSize}px`,
            'white-space': 'nowrap',
            opacity: `${1 - props.offset / SpringBoardMetrics.sliderOpacityDivisor}`,
            'background-image': `linear-gradient(to right, rgb(78,78,78) 0%, rgb(78,78,78) ${SpringBoardMetrics.shimmerPeakOffset - SpringBoardMetrics.shimmerFalloff}%, #ffffff ${SpringBoardMetrics.shimmerPeakOffset}%, rgb(78,78,78) ${SpringBoardMetrics.shimmerPeakOffset + SpringBoardMetrics.shimmerFalloff}%, rgb(78,78,78) 100%)`,
            'background-size': `${SpringBoardMetrics.shimmerBandScale}% 100%`,
            'background-repeat': 'repeat-x',
            '-webkit-background-clip': 'text',
            'background-clip': 'text',
            color: 'transparent',
            animation: `sbShimmer ${SpringBoardMetrics.shimmerDuration}s linear infinite`
          }}
        >
          slide to unlock
        </span>
      </div>

      <div class="flex-1" />
    </div>
  </div>
)
