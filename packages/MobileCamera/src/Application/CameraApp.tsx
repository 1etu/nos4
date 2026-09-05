import { createSignal, Show } from 'solid-js'
import { ckMakeCaptureSession, ckStorageError } from 'CameraKit'
import { CGImage, CGResizableImage } from 'CoreGraphics'
import { lastImage, mediaURL } from 'MobileSlideShow'
import { PressableButton } from '../Controls/PressableButton'
import { CameraMetrics, CameraPalette } from '../Support/CameraMetrics'
import { CameraFlipper, type CameraMode } from '../Views/CameraFlipper'
import { CameraHeader } from '../Views/CameraHeader'

export const CameraApp = (props: { width: number; onOpenLibrary: () => void }) => {
  const [mode, setMode] = createSignal<CameraMode>('photo')
  const camera = ckMakeCaptureSession()
  const thumbnail = () => {
    const asset = lastImage()
    return asset ? mediaURL(asset) : undefined
  }
  const shutter = () => {
    if (mode() === 'photo') return void camera.takePhoto()
    if (camera.recording()) return camera.stopRecording()
    void camera.startRecording()
  }
  const selectMode = (next: CameraMode) => {
    if (camera.busy()) return
    camera.stopRecording()
    setMode(next)
  }
  const shutterIcon = () => {
    if (mode() === 'photo') return 'PLCameraButtonIcon' as const
    return camera.recording() && camera.elapsed() % 2 === 0
      ? 'PLCameraButtonRecordOn' as const
      : 'PLCameraButtonRecordOff' as const
  }

  return (
    <div class='relative h-full w-full overflow-hidden' style={{ background: 'black' }}>
      <video
        ref={camera.attach}
        class='absolute inset-0 h-full w-full object-cover'
        playsinline
        muted
        autoplay
        style={{
          transform: camera.facing() === 'user' ? 'scaleX(-1)' : 'none',
          opacity: `${camera.ready() ? 1 : 0}`
        }}
      />

      <div class='relative flex h-full w-full flex-col'>
        <CameraHeader
          mode={mode()}
          recording={camera.recording()}
          elapsed={camera.elapsed()}
          onFlip={camera.flip}
        />

        <div class='flex flex-1 items-center justify-center'>
          <Show when={camera.message() || ckStorageError() || camera.busy()}>
            <div role='status' style={{
              padding: `${CameraMetrics.statusPadding}px`,
              'font-size': `${CameraMetrics.statusFontSize}px`,
              'text-align': 'center',
              color: 'white',
              background: CameraPalette.statusFill
            }}>
              <p>{camera.message() || ckStorageError() || 'Please wait…'}</p>
              <Show when={!camera.ready() && !camera.busy()}>
                <button type='button' onClick={() => void camera.start()}>Try Again</button>
              </Show>
            </div>
          </Show>
        </div>

        <div
          class='relative flex items-center'
          style={{
            height: `${CameraMetrics.toolBarHeight}px`,
            background: CameraPalette.toolBar
          }}
        >
          <div
            class='flex items-center'
            style={{
              width: `${props.width / CameraMetrics.thumbnailGroupDivisor}px`,
              'margin-left': `${CameraMetrics.toolBarInset}px`
            }}
          >
            <PressableButton label='Open Photos' onClick={props.onOpenLibrary}>
              <Show
                when={thumbnail()}
                fallback={
                  <CGImage
                    name='PLCameraPreviewPlaceholder'
                    style={{
                      width: `${CameraMetrics.thumbnailSize}px`,
                      height: `${CameraMetrics.thumbnailSize}px`
                    }}
                  />
                }
              >
                {(source) => (
                  <img
                    src={source()}
                    alt=''
                    draggable={false}
                    style={{
                      width: `${CameraMetrics.thumbnailSize}px`,
                      height: `${CameraMetrics.thumbnailSize}px`,
                      'object-fit': 'cover',
                      'border-radius': `${CameraMetrics.thumbnailRadius}px`,
                      border: `0.33px solid ${CameraPalette.thumbnailStroke}`,
                      'box-shadow': '0 0.8px 0 rgba(255,255,255,0.48)'
                    }}
                  />
                )}
              </Show>
            </PressableButton>
          </div>

          <PressableButton
            class='relative flex items-center justify-center'
            style={{
              width: `${props.width / CameraMetrics.shutterDivisor}px`,
              height: `${CameraMetrics.thumbnailSize}px`,
              margin: '0 auto'
            }}
            disabled={!camera.ready() || camera.busy()}
            label={mode() === 'photo' ? 'Take Photo' : camera.recording() ? 'Stop Recording' : 'Record Video'}
            onClick={shutter}
            scale={false}
          >
            <CGResizableImage
              name='PLCameraButtonSilver'
              width={props.width / CameraMetrics.shutterDivisor}
              height={CameraMetrics.thumbnailSize}
              class='absolute inset-0'
            />
            <CGImage name={shutterIcon()} class='relative' />
          </PressableButton>

          <div style={{ 'margin-right': `${CameraMetrics.toolBarInset}px` }}>
            <CameraFlipper
              width={props.width / CameraMetrics.flipperDivisor}
              mode={mode()}
              disabled={camera.busy()}
              onChange={selectMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
