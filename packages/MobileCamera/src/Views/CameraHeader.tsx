import { Show, type JSX } from 'solid-js'
import { CGImage } from 'CoreGraphics'
import { CameraMetrics, CameraPalette } from '../Support/CameraMetrics'
import { PressableButton } from '../Controls/PressableButton'
import type { CameraMode } from './CameraFlipper'

const HelveticaNeue = "'Helvetica Neue Local', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const clockLabel = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = Math.floor(seconds % 60)
  const pad = (value: number): string => (value < 10 ? `0${value}` : `${value}`)
  return `${pad(hours)}:${pad(minutes)}:${pad(rest)}`
}

const CameraCapsule = (props: { width: number; children: JSX.Element }) => (
  <div
    class="flex items-center justify-center"
    style={{
      width: `${props.width}px`,
      height: `${CameraMetrics.capsuleHeight}px`,
      'border-radius': '9999px',
      background: CameraPalette.capsuleFill,
      border: `${CameraMetrics.capsuleStroke}px solid ${CameraPalette.capsuleStroke}`,
      gap: '4px'
    }}
  >
    {props.children}
  </div>
)

const CapsuleText = (props: { children: JSX.Element }) => (
  <span
    style={{
      'font-family': HelveticaNeue,
      'font-size': `${CameraMetrics.capsuleFontSize}px`,
      'font-weight': '700',
      color: CameraPalette.capsuleText
    }}
  >
    {props.children}
  </span>
)

export const CameraHeader = (props: {
  mode: CameraMode
  recording: boolean
  elapsed: number
  onFlip: () => void
}) => (
  <div style={{ 'padding-top': `${CameraMetrics.headerPaddingTop}px` }}>
   <div class="relative flex items-center">
    <div style={{ 'margin-left': `${CameraMetrics.headerInset}px` }}>
      <CameraCapsule width={CameraMetrics.capsuleWidth}>
        <CGImage name="PLCameraFlashIcon_2only_" />
        <CapsuleText>Auto</CapsuleText>
      </CameraCapsule>
    </div>

    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div style={{ opacity: `${props.mode === 'photo' ? 1 : 0}` }}>
        <CameraCapsule width={CameraMetrics.hdrCapsuleWidth}>
          <CapsuleText>HDR On</CapsuleText>
        </CameraCapsule>
      </div>
    </div>

    <div class="ml-auto" style={{ 'margin-right': `${CameraMetrics.headerInset}px` }}>
      <Show
        when={props.recording}
        fallback={
          <PressableButton onClick={props.onFlip}>
            <CGImage
              name="PLCameraToggle_2x"
              style={{
                width: `${CameraMetrics.toggleWidth}px`,
                height: `${CameraMetrics.toggleHeight}px`
              }}
            />
          </PressableButton>
        }
      >
        <div
          class="flex items-center justify-center"
          style={{
            width: `${CameraMetrics.timerWidth}px`,
            height: `${CameraMetrics.timerHeight}px`,
            'border-radius': `${CameraMetrics.timerRadius}px`,
            background: CameraPalette.timerFill,
            border: `0.95px solid ${CameraPalette.timerStroke}`
          }}
        >
          <span
            style={{
              'font-family': HelveticaNeue,
              'font-size': `${CameraMetrics.timerFontSize}px`,
              color: 'white'
            }}
          >
            {clockLabel(props.elapsed)}
          </span>
        </div>
      </Show>
    </div>
   </div>
  </div>
)
