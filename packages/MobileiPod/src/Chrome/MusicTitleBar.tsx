import { Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { HelveticaNeue } from './MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'

export const MusicTitleBar = (props: {
  title: string
  backLabel?: string
  showNowPlaying: boolean
  onBack: () => void
  onNowPlaying: () => void
}) => (
  <div
    class="relative flex shrink-0 items-center justify-center"
    style={{
      height: `${MobileiPodMetrics.titleBarHeight}px`,
      background: MobileiPodPalette.titleBar,
      'border-bottom': `1px solid ${MobileiPodPalette.barEdge}`,
      'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)'
    }}
  >
    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileiPodMetrics.titleFontSize}px`,
        'font-weight': '700',
        color: 'white',
        'text-shadow': '0 -1px 0 rgba(0,0,0,0.21)',
        'max-width': `${MobileiPodMetrics.titleMaxWidth}px`,
        'white-space': 'nowrap',
        overflow: 'hidden',
        'text-overflow': 'ellipsis'
      }}
    >
      {props.title}
    </span>

    <Show when={props.backLabel}>
      {(label) => (
        <button
          type="button"
          class="absolute flex items-center justify-center"
          style={{ left: `${MobileiPodMetrics.backButtonLeading}px` }}
          onClick={props.onBack}
        >
          <CGImage
            name="Button_wp4"
            style={{
              width: `${MobileiPodMetrics.backButtonWidth}px`,
              height: `${MobileiPodMetrics.backButtonHeight}px`,
              'object-fit': 'fill'
            }}
          />
          <span
            class="absolute"
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${MobileiPodMetrics.backButtonFontSize}px`,
              'font-weight': '700',
              color: 'white',
              'text-shadow': '0 -0.6px 0 rgba(0,0,0,0.45)',
              'max-width': `${MobileiPodMetrics.backButtonLabelMaxWidth}px`,
              'padding-left': '5px',
              transform: 'translate(1px, -1.1px)',
              'white-space': 'nowrap',
              overflow: 'hidden',
              'text-overflow': 'ellipsis'
            }}
          >
            {label()}
          </span>
        </button>
      )}
    </Show>

    <Show when={props.showNowPlaying}>
      <button
        type="button"
        class="absolute flex items-center justify-center"
        style={{ right: `${MobileiPodMetrics.nowPlayingButtonTrailing}px` }}
        onClick={props.onNowPlaying}
      >
        <CGImage
          name="now_playing_icon"
          style={{
            width: `${MobileiPodMetrics.nowPlayingButtonWidth}px`,
            height: `${MobileiPodMetrics.nowPlayingButtonHeight}px`,
            'object-fit': 'contain'
          }}
        />
        <span
          class="absolute flex flex-col items-center"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${MobileiPodMetrics.nowPlayingLabelFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'text-shadow': '0 -1px 0 rgba(0,0,0,0.6)',
            transform: `translateX(${MobileiPodMetrics.nowPlayingLabelOffsetX}px)`,
            'line-height': '1.1'
          }}
        >
          <span>Now</span>
          <span>Playing</span>
        </span>
      </button>
    </Show>
  </div>
)
