import { createSignal, onCleanup } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { MobileiPodMetrics, MobileiPodPalette } from '../Support/MobileiPodMetrics'

const KnobSize = 22

export const UISlider = (props: {
  value: number
  trackHeight: number
  onChange: (value: number) => void
  onCommit?: () => void
}) => {
  const [dragging, setDragging] = createSignal(false)
  let rail: HTMLDivElement | undefined

  const ratio = () => Math.min(Math.max(props.value, 0), 100) / 100

  const applyFromClientX = (clientX: number) => {
    if (!rail) return
    const box = rail.getBoundingClientRect()
    const usable = box.width - KnobSize
    if (usable <= 0) return
    const offset = clientX - box.left - KnobSize / 2
    props.onChange(Math.min(Math.max(offset / usable, 0), 1) * 100)
  }

  const move = (event: PointerEvent) => applyFromClientX(event.clientX)

  const release = () => {
    setDragging(false)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', release)
    props.onCommit?.()
  }

  onCleanup(release)

  return (
    <div
      ref={rail}
      class="relative flex w-full items-center"
      style={{ height: `${KnobSize}px`, 'touch-action': 'none' }}
      onPointerDown={(event) => {
        setDragging(true)
        applyFromClientX(event.clientX)
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', release)
      }}
    >
      <div
        class="absolute"
        style={{
          left: `${MobileiPodMetrics.sliderTrackInset}px`,
          right: `${MobileiPodMetrics.sliderTrackInset}px`,
          height: `${props.trackHeight}px`,
          'border-radius': `${MobileiPodMetrics.sliderTrackRadius}px`,
          background: MobileiPodPalette.sliderTrack
        }}
      />
      <div
        class="absolute overflow-hidden"
        style={{
          left: `${MobileiPodMetrics.sliderTrackInset}px`,
          width: `calc((100% - ${MobileiPodMetrics.sliderTrackInset * 2}px) * ${ratio()})`,
          height: `${props.trackHeight}px`,
          'border-radius': `${MobileiPodMetrics.sliderTrackRadius}px`,
          background: MobileiPodPalette.sliderFill
        }}
      />
      <div
        class="absolute"
        style={{
          left: `calc((100% - ${KnobSize}px) * ${ratio()})`,
          width: `${KnobSize}px`,
          height: `${KnobSize}px`,
          transform: dragging() ? 'scale(1.04)' : 'none'
        }}
      >
        <CGImage
          name="volume_slider_fat_knob"
          style={{ width: `${KnobSize}px`, height: `${KnobSize}px`, 'object-fit': 'contain' }}
        />
      </div>
    </div>
  )
}
