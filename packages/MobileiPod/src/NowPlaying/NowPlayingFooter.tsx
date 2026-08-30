import { CGImage } from 'CoreGraphics'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import {
  changeVolume,
  isPlaying,
  playbackElapsed,
  playbackVolume,
  skipToBeginning,
  skipToNextItem,
  skipToPreviousItem,
  togglePlayback
} from '../Support/MPMusicPlayerController'
import { UISlider } from '../Chrome/UISlider'

const RewindThreshold = 5

export const NowPlayingFooter = () => (
  <div
    class="relative flex shrink-0 flex-col"
    style={{ height: `${MobileiPodMetrics.footerHeight}px` }}
  >
    <div class="absolute inset-0 flex flex-col">
      <div
        class="flex-1"
        style={{
          background: MobileiPodPalette.footerTop,
          'border-top': '1px solid black',
          'box-shadow': 'inset 0 -1px 0.05px rgba(255,255,255,0.6)'
        }}
      />
      <div class="flex-1" style={{ background: MobileiPodPalette.footerBottom }} />
    </div>

    <div class="relative flex flex-col">
      <div
        class="flex items-center justify-around"
        style={{ height: `${MobileiPodMetrics.transportRowHeight}px` }}
      >
        <button
          type="button"
          onClick={() => {
            if (playbackElapsed() < RewindThreshold) {
              skipToPreviousItem()
              return
            }
            skipToBeginning()
          }}
        >
          <CGImage
            name="prevtrack"
            style={{
              width: `${MobileiPodMetrics.prevNextWidth}px`,
              height: `${MobileiPodMetrics.prevNextHeight}px`,
              'object-fit': 'contain'
            }}
          />
        </button>
        <button type="button" onClick={togglePlayback}>
          <CGImage
            name={isPlaying() ? 'pause' : 'play'}
            style={{
              width: `${MobileiPodMetrics.playPauseWidth}px`,
              height: `${MobileiPodMetrics.playPauseHeight}px`,
              'object-fit': 'contain'
            }}
          />
        </button>
        <button type="button" onClick={skipToNextItem}>
          <CGImage
            name="nexttrack"
            style={{
              width: `${MobileiPodMetrics.prevNextWidth}px`,
              height: `${MobileiPodMetrics.prevNextHeight}px`,
              'object-fit': 'contain'
            }}
          />
        </button>
      </div>

      <div style={{ height: `${MobileiPodMetrics.transportGap}px` }} />

      <div
        class="flex items-center"
        style={{
          height: `${MobileiPodMetrics.volumeRowHeight}px`,
          padding: `0 ${MobileiPodMetrics.volumeInsetX}px`
        }}
      >
        <UISlider
          value={playbackVolume()}
          trackHeight={MobileiPodMetrics.volumeTrackHeight}
          onChange={changeVolume}
        />
      </div>
    </div>
  </div>
)
