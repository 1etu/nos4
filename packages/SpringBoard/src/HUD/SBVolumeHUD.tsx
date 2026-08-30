import { createSignal, For, onCleanup } from 'solid-js'
import { AVSystemVolumeDidChange, AVVolumeStep } from 'AVFoundation'
import { NSNotificationCenter } from 'Foundation'
import { CAMediaTimingFunction, caAnimation, caTransition } from 'CoreAnimation'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const Segments = Math.round(1 / AVVolumeStep)

const fadeAnimation = caAnimation(
  SpringBoardMetrics.volumeHUDFadeDuration,
  CAMediaTimingFunction.easeInOut
)

const artwork = (name: string): string => `${import.meta.env.BASE_URL}springboard/${name}@2x.png`

export const SBVolumeHUD = () => {
  const [level, setLevel] = createSignal(0)
  const [visible, setVisible] = createSignal(false)

  let hide: ReturnType<typeof setTimeout> | undefined

  onCleanup(
    NSNotificationCenter.addObserver(AVSystemVolumeDidChange, (notification) => {
      setLevel(notification.userInfo.volume)
      setVisible(true)
      clearTimeout(hide)
      hide = setTimeout(() => setVisible(false), SpringBoardMetrics.volumeHUDHold * 1000)
    })
  )

  onCleanup(() => clearTimeout(hide))

  const filled = () => Math.round(level() * Segments)

  return (
    <div
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{
        opacity: `${visible() ? 1 : 0}`,
        transition: caTransition(['opacity'], fadeAnimation)
      }}
    >
      <div
        class="relative flex flex-col items-center"
        style={{
          width: `${SpringBoardMetrics.volumeHUDSize}px`,
          height: `${SpringBoardMetrics.volumeHUDSize}px`,
          'border-radius': `${SpringBoardMetrics.volumeHUDRadius}px`,
          background: `rgba(0,0,0,${SpringBoardMetrics.volumeHUDOpacity})`,
          'backdrop-filter': `blur(${SpringBoardMetrics.volumeHUDBlur}px)`,
          '-webkit-backdrop-filter': `blur(${SpringBoardMetrics.volumeHUDBlur}px)`
        }}
      >
        <div class="flex flex-1 items-center justify-center">
          <img
            src={artwork('speaker')}
            alt=""
            draggable={false}
            style={{
              width: `${SpringBoardMetrics.volumeHUDGlyphWidth}px`,
              height: `${SpringBoardMetrics.volumeHUDGlyphHeight}px`
            }}
          />
        </div>

        <div
          class="flex items-center"
          style={{
            gap: `${SpringBoardMetrics.volumeHUDSegmentPitch - SpringBoardMetrics.volumeHUDSegment}px`,
            'padding-bottom': `${SpringBoardMetrics.volumeHUDSegmentBottom}px`
          }}
        >
          <For each={Array.from({ length: Segments })}>
            {(_, at) => (
              <div
                class="relative flex items-center justify-center"
                style={{
                  width: `${SpringBoardMetrics.volumeHUDSegment}px`,
                  height: `${SpringBoardMetrics.volumeHUDSegment}px`
                }}
              >
                <img
                  src={artwork(at() < filled() ? 'block' : 'emptyblock')}
                  alt=""
                  draggable={false}
                  style={{
                    width: `${at() < filled() ? SpringBoardMetrics.volumeHUDSegmentFilled : SpringBoardMetrics.volumeHUDSegment}px`,
                    height: 'auto'
                  }}
                />
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
