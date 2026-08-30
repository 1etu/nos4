import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { HelveticaNeue } from '../Chrome/MusicListChrome'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'
import { MPArtwork } from '../Chrome/MPArtwork'
import { type MPMediaItem } from '../Support/MPMediaLibrary'

const flipIn = caAnimation(MobileiPodMetrics.flipDuration, CAMediaTimingFunction.easeIn)
const flipOut = caAnimation(MobileiPodMetrics.flipDuration, CAMediaTimingFunction.easeOut)

const MetaLine = (props: { text: string; muted?: boolean }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${MobileiPodMetrics.nowPlayingMetaFontSize}px`,
      'font-weight': '700',
      color: props.muted ? MobileiPodPalette.nowPlayingMeta : 'white',
      'text-shadow': '0 -1px 0 rgba(0,0,0,0.8)',
      'white-space': 'nowrap',
      overflow: 'hidden',
      'text-overflow': 'ellipsis',
      'max-width': '100%'
    }}
  >
    {props.text}
  </span>
)

export const NowPlayingTitleBar = (props: {
  item: MPMediaItem | undefined
  showBackTracks: boolean
  switchToTracks: boolean
  flipperBackground: boolean
  disabled: boolean
  onBack: () => void
  onFlip: () => void
}) => {
  const size = MobileiPodMetrics.nowPlayingFlipperSize

  return (
    <div
      class="relative flex shrink-0 items-center"
      style={{
        height: `${MobileiPodMetrics.nowPlayingTitleBarHeight}px`,
        background: MobileiPodPalette.chrome,
        'border-bottom': `1px solid ${MobileiPodPalette.barEdge}`,
        'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.2)'
      }}
    >
      <button
        type="button"
        class="relative flex shrink-0 items-center justify-center"
        style={{ 'margin-left': `${MobileiPodMetrics.nowPlayingBackInset}px` }}
        onClick={props.onBack}
      >
        <CGImage
          name="button_back_ipod2"
          style={{
            width: `${MobileiPodMetrics.nowPlayingBackWidth}px`,
            height: `${MobileiPodMetrics.nowPlayingBackHeight}px`,
            'object-fit': 'fill'
          }}
        />
        <CGImage
          name="UINavigationBarBackArrow"
          class="absolute"
          style={{
            width: `${MobileiPodMetrics.nowPlayingBackArrowWidth}px`,
            height: `${MobileiPodMetrics.nowPlayingBackArrowHeight}px`,
            'object-fit': 'contain',
            'padding-left': '2px'
          }}
        />
      </button>

      <div
        class="flex min-w-0 flex-1 flex-col items-center justify-center"
        style={{ transform: 'translateY(-1px)' }}
      >
        <MetaLine text={props.item?.artist ?? ''} muted />
        <MetaLine text={props.item?.title ?? ''} />
        <MetaLine text={props.item?.albumTitle ?? ''} muted />
      </div>

      <button
        type="button"
        class="relative flex shrink-0 items-center justify-end"
        style={{
          width: `${MobileiPodMetrics.nowPlayingBackWidth}px`,
          height: `${size}px`,
          'margin-right': `${MobileiPodMetrics.nowPlayingBackInset}px`,
          'pointer-events': props.disabled ? 'none' : 'auto'
        }}
        onClick={props.onFlip}
      >
        <CGImage
          name="NowPlayingFlipperBackground"
          class="absolute"
          style={{
            width: `${MobileiPodMetrics.nowPlayingFlipperBackgroundSize}px`,
            height: `${MobileiPodMetrics.nowPlayingFlipperBackgroundSize}px`,
            'object-fit': 'contain',
            right: `${-(MobileiPodMetrics.nowPlayingFlipperBackgroundSize - size) / 2}px`,
            top: `${-(MobileiPodMetrics.nowPlayingFlipperBackgroundSize - size) / 12}px`,
            opacity: `${props.flipperBackground ? 1 : 0}`
          }}
        />
        <MPArtwork
          item={props.item}
          class="absolute right-0"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            'object-fit': 'cover',
            'transform-origin': 'left center',
            transform: `perspective(400px) rotateY(${props.showBackTracks ? 0 : 90}deg) translateX(${props.showBackTracks ? 0 : size / 2}px)`,
            opacity: `${props.showBackTracks ? 1 : 0.5}`,
            transition: caTransition(['transform', 'opacity'], flipOut)
          }}
        />
        <CGImage
          name="NowPlayingAlbumInfo"
          class="absolute right-0"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            'object-fit': 'contain',
            'transform-origin': 'right center',
            transform: `perspective(400px) rotateY(${props.switchToTracks ? -90 : 0}deg) translateX(${props.switchToTracks ? -size / 2 : 0}px)`,
            transition: caTransition(['transform'], flipIn)
          }}
        />
      </button>
    </div>
  )
}
