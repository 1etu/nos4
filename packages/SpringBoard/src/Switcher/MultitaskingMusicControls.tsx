import { CGImage } from 'CoreGraphics'
import { isPlaying, nowPlayingItem, skipToNextItem, skipToPreviousItem, togglePlayback } from 'MobileiPod'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const MultitaskingMusicControls = (props: { onOpeniPod: () => void }) => (
  <div class="flex h-full w-full items-center justify-center">
    <div
      class="relative flex items-center"
      style={{ 'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px` }}
    >
    <div
      class="flex items-center justify-center"
      style={{ width: `${SpringBoardMetrics.cellWidth}px` }}
    >
      <CGImage
        name="RotationUnlockButton"
        style={{ width: `${SpringBoardMetrics.iconSize}px`, height: 'auto' }}
      />
    </div>

    <div
      class="flex items-center justify-center"
      style={{ width: `${SpringBoardMetrics.musicNarrowCell}px` }}
    >
      <button type="button" onClick={skipToPreviousItem}>
        <CGImage name="MCPrev" />
      </button>
    </div>

    <div
      class="flex items-center justify-center"
      style={{ width: `${SpringBoardMetrics.musicNarrowCell}px` }}
    >
      <button type="button" onClick={togglePlayback}>
        <CGImage name={isPlaying() ? 'MCPause' : 'MCPlay'} />
      </button>
    </div>

    <div
      class="flex items-center justify-center"
      style={{ width: `${SpringBoardMetrics.musicNarrowCell}px` }}
    >
      <button type="button" onClick={skipToNextItem}>
        <CGImage name="MCNext" />
      </button>
    </div>

    <div
      class="flex items-center justify-center"
      style={{ width: `${SpringBoardMetrics.cellWidth}px` }}
    >
      <button type="button" onClick={props.onOpeniPod}>
        <CGImage
          name="iPod"
          style={{ width: `${SpringBoardMetrics.iconSize}px`, height: 'auto' }}
        />
      </button>
    </div>

    <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${SpringBoardMetrics.nowPlayingFontSize}px`,
          'font-weight': '700',
          color: 'white',
          'text-shadow': `0 ${SpringBoardMetrics.labelShadowOffsetY}px ${SpringBoardMetrics.labelShadowBlur}px rgba(0,0,0,0.9)`,
          transform: `translateY(${SpringBoardMetrics.nowPlayingOffsetY}px)`,
          'white-space': 'nowrap'
        }}
      >
        {nowPlayingItem()?.title ?? ''}
      </span>
    </div>
    </div>
  </div>
)
