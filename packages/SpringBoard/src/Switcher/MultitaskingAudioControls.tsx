import { CGImage, assetPointSize } from 'CoreGraphics'
import { avOutputVolume, avSetOutputVolume } from 'AVFoundation'
import { SpringBoardMetrics } from '../Support/SpringBoardMetrics'

const KnobSize = assetPointSize('SwitcherSliderThumb').width

export const MultitaskingAudioControls = () => {
  let rail: HTMLDivElement | undefined

  const ratio = () => Math.min(Math.max(avOutputVolume(), 0), 1)

  const applyFromClientX = (clientX: number) => {
    if (!rail) return
    const box = rail.getBoundingClientRect()
    const usable = box.width - KnobSize
    if (usable <= 0) return
    avSetOutputVolume(Math.min(Math.max((clientX - box.left - KnobSize / 2) / usable, 0), 1))
  }

  const move = (event: PointerEvent) => applyFromClientX(event.clientX)

  const release = () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', release)
  }

  return (
    <div class="flex h-full w-full items-center justify-center">
      <div
        class="relative flex items-center"
        style={{ 'column-gap': `${SpringBoardMetrics.gridColumnSpacing}px` }}
      >
        <div
          class="flex items-center"
          style={{
            width: `${SpringBoardMetrics.cellWidth * 3}px`,
            'padding-left': `${SpringBoardMetrics.audioSliderLeading}px`
          }}
        >
          <div
            ref={rail}
            class="relative flex w-full items-center"
            style={{
              height: `${SpringBoardMetrics.audioSliderHeight}px`,
              'touch-action': 'none'
            }}
            onPointerDown={(event) => {
              applyFromClientX(event.clientX)
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', release)
            }}
          >
            <div
              class="absolute"
              style={{
                left: `${SpringBoardMetrics.audioTrackInset}px`,
                right: `${SpringBoardMetrics.audioTrackInset}px`,
                height: `${SpringBoardMetrics.audioTrackHeight}px`,
                'border-radius': `${SpringBoardMetrics.audioTrackHeight / 2}px`,
                background: 'rgba(0,0,0,0.4)',
                filter: 'brightness(0.9)',
                'box-shadow':
                  'inset 0 0.75px 1.5px rgba(0,0,0,0.75), 0 1px 0 rgba(183,183,184,0.5)'
              }}
            />
            <div
              class="absolute"
              style={{
                left: `${SpringBoardMetrics.audioTrackInset}px`,
                width: `calc((100% - ${SpringBoardMetrics.audioTrackInset * 2}px) * ${ratio()})`,
                height: `${SpringBoardMetrics.audioTrackHeight}px`,
                'border-radius': `${SpringBoardMetrics.audioTrackHeight / 2}px`,
                background: 'rgba(255,255,255,0.4)',
                filter: 'brightness(0.98)',
                'box-shadow': 'inset 0 0.75px 1.5px rgb(0,0,0), 0 1px 0 rgba(183,183,184,0.5)'
              }}
            />
            <CGImage
              name="SwitcherSliderThumb"
              class="absolute"
              style={{ left: `calc((100% - ${KnobSize}px) * ${ratio()})` }}
            />
          </div>
        </div>

        <div
          class="flex items-center justify-center"
          style={{ width: `${SpringBoardMetrics.cellWidth}px` }}
        >
          <CGImage name="SwitcherAirPlayNowPlayingButton" />
        </div>

        <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
          <CGImage
            name="SwitcherVolumeIcon"
            style={{ transform: `translateY(${SpringBoardMetrics.volumeIconOffsetY}px)` }}
          />
        </div>
      </div>
    </div>
  )
}
