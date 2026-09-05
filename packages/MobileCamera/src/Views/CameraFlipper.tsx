import { createEffect, createSignal } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CameraMetrics, CameraPalette } from '../Support/CameraMetrics'

export type CameraMode = 'photo' | 'video'

export const CameraFlipper = (props: {
  width: number
  mode: CameraMode
  disabled?: boolean
  onChange: (mode: CameraMode) => void
}) => {
  const knobWidth = () => props.width / 3
  const travel = () => props.width - knobWidth()

  const [offset, setOffset] = createSignal(props.mode === 'video' ? travel() : 0)
  const [dragging, setDragging] = createSignal(false)
  let start = 0
  createEffect(() => setOffset(props.mode === 'video' ? travel() : 0))

  const onPointerDown = (event: PointerEvent) => {
    if (props.disabled) return
    if (event.currentTarget instanceof Element) {
      const bounds = event.currentTarget.getBoundingClientRect()
      setOffset(Math.min(travel(), Math.max(0, event.clientX - bounds.left - knobWidth() / 2)))
    }
    start = event.clientX - offset()
    setDragging(true)
    if (event.currentTarget instanceof Element) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging()) return
    setOffset(Math.min(travel(), Math.max(0, event.clientX - start)))
  }

  const settle = () => {
    if (!dragging()) return
    setDragging(false)
    const toVideo = offset() > props.width / 2
    setOffset(toVideo ? travel() : 0)
    props.onChange(toVideo ? 'video' : 'photo')
  }

  return (
    <div
      class="flex flex-col"
      style={{ width: `${props.width}px`, gap: `${CameraMetrics.flipperStackSpacing}px` }}
    >
      <div class="flex items-center justify-between">
        <CGImage name="PLCameraSwitchIcon" />
        <CGImage name="PLVideo" />
      </div>

      <div
        class="relative"
        role='switch'
        aria-label='Video mode'
        aria-checked={props.mode === 'video'}
        aria-disabled={props.disabled}
        tabIndex={props.disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (props.disabled || (event.key !== ' ' && event.key !== 'Enter')) return
          event.preventDefault()
          props.onChange(props.mode === 'photo' ? 'video' : 'photo')
        }}
        style={{
          height: `${CameraMetrics.flipperTrackHeight}px`,
          'border-radius': '9999px',
          background: CameraPalette.flipperTrack,
          border: `0.33px solid ${CameraPalette.flipperTrackStroke}`,
          'box-shadow': 'inset 0 0.66px 0.8px rgba(0,0,0,0.45), 0 0.8px 0 rgba(255,255,255,0.48)',
          'touch-action': 'none'
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={settle}
        onPointerCancel={settle}
      >
        <div
          class="absolute top-1/2"
          style={{
            left: `${offset()}px`,
            width: `${knobWidth()}px`,
            height: `${CameraMetrics.flipperKnobHeight}px`,
            transform: 'translateY(-50%)',
            'border-radius': '9999px',
            background: CameraPalette.flipperKnob,
            border: `0.7px solid ${CameraPalette.flipperKnobStroke}`,
            'box-shadow': `${offset() > props.width / 2 ? '-1px' : '1px'} 1px 1px rgba(0,0,0,0.25)`,
            transition: dragging() ? 'none' : `left ${CameraMetrics.flipperSnapDuration}s linear`
          }}
        />
      </div>
    </div>
  )
}
