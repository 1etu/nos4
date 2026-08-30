import { For, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { UIScrollView } from 'UIKit'
import {
  photoLibrary,
  durationLabel,
  mediaURL,
  photoCount,
  videoCount,
  type PHAsset
} from '../Support/PhotoLibrary'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const Cell = (props: { asset: PHAsset; onOpen: (asset: PHAsset) => void }) => (
  <button
    type="button"
    class="relative block w-full overflow-hidden"
    style={{ 'aspect-ratio': '1', 'box-shadow': 'inset 0 0 2px rgba(128,128,128,0.8)' }}
    onClick={() => props.onOpen(props.asset)}
  >
    <Show
      when={props.asset.mediaType === 'video'}
      fallback={
        <img
          src={mediaURL(props.asset)}
          alt=""
          draggable={false}
          class="h-full w-full object-cover"
        />
      }
    >
      <video
        src={mediaURL(props.asset)}
        class="h-full w-full object-cover"
        muted
        playsinline
        preload="metadata"
      />
      <div
        class="absolute inset-x-0 bottom-0 flex items-center"
        style={{
          height: `${100 / PhotosMetrics.videoOverlayDivisor}%`,
          background: 'rgba(0,0,0,0.5)'
        }}
      >
        <CGImage name="PLVideoCameraPreview" style={{ 'margin-left': '4px' }} />
        <span
          class="ml-auto"
          style={{
            'font-family': HelveticaNeue,
            'font-size': `${PhotosMetrics.videoDurationFontSize}px`,
            'font-weight': '700',
            color: 'white',
            'margin-right': '4px'
          }}
        >
          {durationLabel(props.asset.duration)}
        </span>
      </div>
    </Show>
  </button>
)

export const CameraRoll = (props: { onOpen: (asset: PHAsset) => void }) => (
  <UIScrollView class="h-full w-full" style={{ background: 'white' }}>
    <div
      class="grid"
      style={{
        'grid-template-columns': `repeat(${PhotosMetrics.gridColumns}, minmax(${PhotosMetrics.gridMinimumCell}px, 1fr))`,
        gap: `${PhotosMetrics.gridSpacing}px`,
        padding: `${PhotosMetrics.gridPadding}px`,
        'padding-top': `${PhotosMetrics.contentInsetTop + PhotosMetrics.gridPadding}px`
      }}
    >
      <For each={photoLibrary()}>{(asset) => <Cell asset={asset} onOpen={props.onOpen} />}</For>
    </div>
    <div
      class="flex justify-center"
      style={{ 'padding-bottom': `${PhotosMetrics.bottomInfoPaddingBottom}px` }}
    >
      <span
        style={{
          'font-family': HelveticaNeue,
          'font-size': `${PhotosMetrics.bottomInfoFontSize}px`,
          color: PhotosPalette.bottomInfo,
          'white-space': 'nowrap'
        }}
      >
        {photoCount()} Photos, {videoCount()} Videos
      </span>
    </div>
  </UIScrollView>
)
