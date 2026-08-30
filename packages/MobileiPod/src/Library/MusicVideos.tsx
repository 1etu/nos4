import { CGImage } from 'CoreGraphics'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'

export const MusicVideos = () => (
  <div
    class="flex h-full w-full flex-col items-center justify-center"
    style={{ background: 'white', gap: `${MobileiPodMetrics.videosStackSpacing}px` }}
  >
    <div
      class="flex w-full justify-center"
      style={{ padding: `0 ${MobileiPodMetrics.videosIconInsetX}px` }}
    >
      <CGImage
        name="no_videos_icon"
        style={{ width: '100%', height: 'auto', 'object-fit': 'contain' }}
      />
    </div>

    <div style={{ height: `${MobileiPodMetrics.videosGapLarge}px` }} />

    <span
      style={{
        'font-family': HelveticaNeue,
        'font-size': `${MobileiPodMetrics.videosTitleFontSize}px`,
        'font-weight': '700',
        color: MobileiPodPalette.videosText
      }}
    >
      No Videos
    </span>

    <div style={{ height: `${MobileiPodMetrics.videosGapSmall}px` }} />

    <div class="flex items-center justify-center" style={{ gap: '5px' }}>
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${MobileiPodMetrics.videosBodyFontSize}px`,
          'font-weight': '700',
          color: MobileiPodPalette.videosText
        }}
      >
        You can download videos from iTunes.
      </span>
      <div
        class="flex shrink-0 items-center justify-center"
        style={{
          width: `${MobileiPodMetrics.videosArrowCircle}px`,
          height: `${MobileiPodMetrics.videosArrowCircle}px`,
          'border-radius': '9999px',
          background: MobileiPodPalette.videosArrow
        }}
      >
        <svg
          width={MobileiPodMetrics.videosArrowSize}
          height={MobileiPodMetrics.videosArrowSize}
          viewBox="0 0 6 6"
          aria-hidden="true"
        >
          <path d="M3 0 L3 2 L0 2 L0 4 L3 4 L3 6 L6 3 Z" fill="white" />
        </svg>
      </div>
    </div>
  </div>
)
