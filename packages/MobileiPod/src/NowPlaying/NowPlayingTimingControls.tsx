import { CGImage, type AssetName } from 'CoreGraphics'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { formatTimeFor } from '../Support/MPMediaLibrary'
import {
  cycleRepeatMode,
  musicRepeatMode,
  musicShuffleMode,
  nowPlayingItem,
  playbackElapsed,
  progressRatio,
  remaining,
  seekTo,
  toggleShuffleMode
} from '../Support/MPMusicPlayerController'
import { UISlider } from '../Chrome/UISlider'

const repeatAsset = (): AssetName => {
  if (musicRepeatMode() === 'all') return 'repeat_on'
  if (musicRepeatMode() === 'one') return 'repeat_on_1'
  return 'repeat_off'
}

const TimeLabel = (props: { text: string; strong?: boolean }) => (
  <span
    class="shrink-0"
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileiPodMetrics.timingFontSize}px`,
      'font-weight': '700',
      color: 'white',
      'text-shadow': props.strong ? '0 -1px 0 rgba(0,0,0,0.75)' : '0 -1px 0 rgba(0,0,0,0.21)'
    }}
  >
    {props.text}
  </span>
)

export const NowPlayingTimingControls = () => (
  <div
    class="flex w-full flex-col justify-center"
    style={{
      height: `${MobileiPodMetrics.timingControlsHeight}px`,
      background: 'rgba(0,0,0,0.5)',
      'border-bottom': '1px solid black',
      'box-shadow': 'inset 0 -1px 0.0275px rgba(255,255,255,0.6)'
    }}
  >
    <div class="flex items-center" style={{ gap: '8px' }}>
      <div style={{ 'padding-left': `${MobileiPodMetrics.timingInsetX}px` }}>
        <TimeLabel text={formatTimeFor(playbackElapsed())} />
      </div>
      <div class="flex-1" style={{ height: `${MobileiPodMetrics.timingSliderHeight}px` }}>
        <UISlider
          value={progressRatio() * 100}
          trackHeight={MobileiPodMetrics.sliderTrackHeight}
          onChange={(value) => {
            const item = nowPlayingItem()
            if (!item) return
            seekTo((value / 100) * item.playbackDuration)
          }}
        />
      </div>
      <div style={{ 'padding-right': `${MobileiPodMetrics.timingInsetX}px` }}>
        <TimeLabel text={`-${formatTimeFor(remaining())}`} strong />
      </div>
    </div>

    <div class="flex items-center">
      <button
        type="button"
        style={{ 'padding-left': `${MobileiPodMetrics.timingButtonInset}px` }}
        onClick={cycleRepeatMode}
      >
        <CGImage name={repeatAsset()} />
      </button>
      <div class="flex-1" />
      <button type="button">
        <CGImage name="nowplaying_atom" />
      </button>
      <div class="flex-1" />
      <button
        type="button"
        style={{ 'padding-right': `${MobileiPodMetrics.timingButtonInset}px` }}
        onClick={toggleShuffleMode}
      >
        <CGImage name={musicShuffleMode() ? 'shuffle_on' : 'shuffle_off'} />
      </button>
    </div>
  </div>
)
