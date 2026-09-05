import { createSignal, Show } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CAMediaTimingFunction, caAfter, caAnimation, caTransition } from 'CoreAnimation'
import { downloadAsset, mediaURL, photoLibrary, type PHAsset } from '../Support/PhotoLibrary'
import { PhotosMetrics, PhotosPalette } from '../Support/PhotosMetrics'

const HideBarsDuration = 0.25
const ShowBarsDuration = 0.1
const TapDebounce = 0.3
const DisabledOpacity = 0.25

const ToolBarButton = (props: {
  icon: 'UIButtonBarAction' | 'UIButtonBarPreviousSlide' | 'UIButtonBarPlay' | 'UIButtonBarPause' | 'UIButtonBarNextSlide' | 'UIButtonBarTrash'
  enabled?: boolean
  label?: string
  onClick?: () => void
}) => (
  <button
    type="button"
    aria-label={props.label}
    class="flex flex-1 items-center justify-center"
    style={{ opacity: `${props.enabled === false ? DisabledOpacity : 1}` }}
    onClick={() => {
      if (props.enabled === false) return
      props.onClick?.()
    }}
  >
    <CGImage name={props.icon} />
  </button>
)

export const PhotoDestination = (props: { asset: PHAsset; onIndexChange: (index: number) => void }) => {
  const [hidden, setHidden] = createSignal(false)
  const [playing, setPlaying] = createSignal(false)
  let blocked = false
  let video: HTMLVideoElement | undefined

  const index = () => photoLibrary().findIndex((entry) => entry.id === props.asset.id)

  const toggleBars = () => {
    if (blocked) return
    blocked = true
    setHidden(!hidden())
    caAfter(TapDebounce, () => {
      blocked = false
    })
  }

  const step = (delta: number) => {
    const next = index() + delta
    if (next < 0 || next >= photoLibrary().length) return
    setPlaying(false)
    props.onIndexChange(next)
  }

  const togglePlay = () => {
    if (!video) return
    if (playing()) {
      video.pause()
      setPlaying(false)
      return
    }
    void video.play()
    setPlaying(true)
  }

  const barAnimation = () =>
    caAnimation(hidden() ? HideBarsDuration : ShowBarsDuration, CAMediaTimingFunction.linear)

  return (
    <div class="relative h-full w-full overflow-hidden" style={{ background: 'black' }}>
      <div class="absolute inset-0" onClick={toggleBars}>
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
            ref={video}
            src={mediaURL(props.asset)}
            class="h-full w-full object-contain"
            playsinline
            onEnded={() => setPlaying(false)}
          />
          <Show when={!playing()}>
            <button
              type="button"
              class="absolute inset-0 flex items-center justify-center"
              onClick={(event) => {
                event.stopPropagation()
                togglePlay()
              }}
            >
              <CGImage name="PLVideoOverlayPlay" />
            </button>
          </Show>
        </Show>
      </div>

      <div
        class="absolute inset-x-0 bottom-0"
        style={{
          opacity: `${hidden() ? 0 : 1}`,
          'pointer-events': hidden() ? 'none' : 'auto',
          transition: caTransition(['opacity'], barAnimation())
        }}
      >
        <div class="relative flex items-center" style={{ height: `${PhotosMetrics.toolBarHeight}px` }}>
          <div
            class="absolute inset-0"
            style={{
              background: PhotosPalette.barGradient,
              'border-top': '0.95px solid rgb(0,0,0)',
              'box-shadow': 'inset 0 -1px 0 rgba(230,230,230,0.15)',
              opacity: `${PhotosMetrics.barOpacity}`
            }}
          />
          <div class="relative flex w-full items-center">
            <ToolBarButton icon='UIButtonBarAction' label='Download' onClick={() => downloadAsset(props.asset)} />
            <div class="flex-1" />
            <ToolBarButton
              icon="UIButtonBarPreviousSlide"
              enabled={index() > 0}
              onClick={() => step(-1)}
            />
            <ToolBarButton
              icon={playing() ? 'UIButtonBarPause' : 'UIButtonBarPlay'}
              onClick={togglePlay}
            />
            <ToolBarButton
              icon="UIButtonBarNextSlide"
              enabled={index() < photoLibrary().length - 1}
              onClick={() => step(1)}
            />
            <div class="flex-1" />
            <ToolBarButton icon="UIButtonBarTrash" />
          </div>
        </div>
      </div>
    </div>
  )
}
