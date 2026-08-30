import { createSignal, Show } from 'solid-js'
import { MPArtwork } from '../Chrome/MPArtwork'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { MobileiPodMetrics } from '../Support/MobileiPodMetrics'
import { albumForItem, type MPMediaItem } from '../Support/MPMediaLibrary'
import { nowPlayingItem, setPlaybackQueue } from '../Support/MPMusicPlayerController'
import { NowPlayingFooter } from './NowPlayingFooter'
import { NowPlayingTimingControls } from './NowPlayingTimingControls'
import { NowPlayingTitleBar } from './NowPlayingTitleBar'
import { NowPlayingTracks } from './NowPlayingTracks'

const flipIn = caAnimation(MobileiPodMetrics.flipDuration, CAMediaTimingFunction.easeIn)
const flipOut = caAnimation(MobileiPodMetrics.flipDuration, CAMediaTimingFunction.easeOut)

export const NowPlaying = (props: { height: number; onBack: () => void }) => {
  const [switchToTracks, setSwitchToTracks] = createSignal(false)
  const [showBackTracks, setShowBackTracks] = createSignal(false)
  const [hideAlbumImage, setHideAlbumImage] = createSignal(false)
  const [flipperBackground, setFlipperBackground] = createSignal(false)
  const [showTimingControls, setShowTimingControls] = createSignal(false)
  const [momentaryDisable, setMomentaryDisable] = createSignal(false)
  const [rating, setRating] = createSignal(nowPlayingItem()?.rating ?? 0)

  const artworkHeight = () =>
    props.height -
    MobileiPodMetrics.statusBarHeight -
    MobileiPodMetrics.nowPlayingTitleBarHeight -
    MobileiPodMetrics.footerHeight

  const tracks = (): readonly MPMediaItem[] => {
    const item = nowPlayingItem()
    if (!item) return []
    return albumForItem(item)
  }

  const flipToTracks = () => {
    setMomentaryDisable(true)
    setSwitchToTracks(true)
    setFlipperBackground(true)
    caAfter(MobileiPodMetrics.flipHandoff, () => setShowBackTracks(true))
    caAfter(MobileiPodMetrics.flipSettle, () => {
      setMomentaryDisable(false)
      setHideAlbumImage(true)
    })
  }

  const flipToArtwork = () => {
    setMomentaryDisable(true)
    setShowBackTracks(false)
    setHideAlbumImage(false)
    caAfter(MobileiPodMetrics.flipHandoff, () => setSwitchToTracks(false))
    caAfter(MobileiPodMetrics.flipBackgroundDelay, () => setFlipperBackground(false))
    caAfter(MobileiPodMetrics.flipSettle, () => setMomentaryDisable(false))
  }

  const flip = () => {
    if (momentaryDisable()) return
    if (switchToTracks()) {
      flipToArtwork()
      return
    }
    flipToTracks()
  }

  return (
    <div class="relative flex h-full w-full flex-col" style={{ background: 'black' }}>
      <NowPlayingTitleBar
        item={nowPlayingItem()}
        showBackTracks={showBackTracks()}
        switchToTracks={switchToTracks()}
        flipperBackground={flipperBackground()}
        disabled={momentaryDisable()}
        onBack={props.onBack}
        onFlip={flip}
      />

      <div class="relative flex-1 overflow-hidden" style={{ perspective: '900px' }}>
        <div
          class="absolute inset-0"
          style={{
            'transform-origin': 'left center',
            transform: `rotateY(${showBackTracks() ? 0 : 90}deg) translateX(${showBackTracks() ? 0 : 50}%)`,
            opacity: `${showBackTracks() ? 1 : 0.5}`,
            'border-top': '1px solid rgb(53,53,53)',
            transition: caTransition(['transform', 'opacity'], flipOut)
          }}
        >
          <NowPlayingTracks
            tracks={tracks()}
            rating={rating()}
            onRate={setRating}
            onSelect={(track) => setPlaybackQueue([track, ...tracks().filter((t) => t.id !== track.id)])}
          />
        </div>

        <div
          class="absolute inset-0"
          style={{
            'transform-origin': 'right center',
            transform: `rotateY(${switchToTracks() ? -90 : 0}deg) translateX(${switchToTracks() ? -50 : 0}%)`,
            opacity: `${switchToTracks() ? 0.5 : 1}`,
            visibility: hideAlbumImage() ? 'hidden' : 'visible',
            'border-top': '1px solid rgb(53,53,53)',
            transition: caTransition(['transform', 'opacity'], flipIn)
          }}
          onDblClick={flip}
          onClick={() => setShowTimingControls(!showTimingControls())}
        >
          <div class="relative h-full w-full overflow-hidden">
            <MPArtwork
              item={nowPlayingItem()}
              class="absolute inset-x-0 top-0"
              style={{ width: '100%', height: `${artworkHeight()}px`, 'object-fit': 'cover' }}
            />
            <div
              class="absolute inset-x-0 bottom-0"
              style={{
                height: `${artworkHeight()}px`,
                background:
                  'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgb(0,0,0) 28%, rgb(0,0,0) 100%)'
              }}
            />
            <Show when={showTimingControls()}>
              <div class="absolute inset-x-0 top-0">
                <NowPlayingTimingControls />
              </div>
            </Show>
          </div>
        </div>
      </div>

      <NowPlayingFooter />
    </div>
  )
}
