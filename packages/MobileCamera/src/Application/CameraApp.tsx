import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { AVSystemSound, avPlaySystemSound } from 'AVFoundation'
import { CGImage, CGResizableImage } from 'CoreGraphics'
import { addAsset, lastImage, mediaURL } from 'MobileSlideShow'
import { CameraFlipper, type CameraMode } from '../Views/CameraFlipper'
import { CameraHeader } from '../Views/CameraHeader'
import { CameraMetrics, CameraPalette } from '../Support/CameraMetrics'
import { PressableButton } from '../Controls/PressableButton'

const RecordSoundVolume = 0.06

export const CameraApp = (props: { width: number; onOpenLibrary: () => void }) => {
  const [mode, setMode] = createSignal<CameraMode>('photo')
  const [recording, setRecording] = createSignal(false)
  const [elapsed, setElapsed] = createSignal(0)
  const [blink, setBlink] = createSignal(false)
  const [facing, setFacing] = createSignal<'user' | 'environment'>('environment')
  const [denied, setDenied] = createSignal(false)
  const [shot, setShot] = createSignal<string | undefined>()

  let video: HTMLVideoElement | undefined
  let stream: MediaStream | undefined

  const live = () => facing() === 'user' && !denied()

  const stop = () => {
    for (const track of stream?.getTracks() ?? []) track.stop()
    stream = undefined
    if (video) video.srcObject = null
  }

  const begin = async () => {
    stop()
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      setDenied(false)
      if (video) {
        video.srcObject = stream
        await video.play().catch(() => undefined)
      }
    } catch {
      setDenied(true)
    }
  }

  onMount(() => {
    const blinker = setInterval(() => setBlink((value) => !value), CameraMetrics.recordBlinkInterval)
    const ticker = setInterval(() => {
      if (recording()) setElapsed((value) => value + 1)
    }, 1000)
    onCleanup(() => {
      clearInterval(blinker)
      clearInterval(ticker)
      stop()
    })
  })

  const flip = () => {
    if (facing() === 'environment') {
      setFacing('user')
      void begin()
      return
    }
    setFacing('environment')
    setDenied(false)
    stop()
  }

  const record = (url: string) => {
    setShot(url)
    addAsset({
      id: `shot-${Date.now()}`,
      mediaType: 'image',
      path: '',
      url,
      duration: 0
    })
  }

  const capturePhoto = () => {
    if (!live()) {
      record(`${import.meta.env.BASE_URL}${CameraMetrics.placeholderScene}`)
      return
    }
    if (!video || video.videoWidth === 0) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    record(canvas.toDataURL('image/jpeg', 0.9))
  }

  const toggleRecording = () => {
    if (recording()) {
      setRecording(false)
      setElapsed(0)
      avPlaySystemSound(AVSystemSound.videoEnd, RecordSoundVolume)
      return
    }
    setElapsed(0)
    setRecording(true)
    avPlaySystemSound(AVSystemSound.videoBegin, RecordSoundVolume)
  }

  const shutter = () => {
    if (mode() === 'photo') {
      capturePhoto()
      return
    }
    toggleRecording()
  }

  const thumbnail = () => shot() ?? (lastImage() ? mediaURL(lastImage()!) : undefined)

  const shutterIcon = () => {
    if (mode() === 'photo') return 'PLCameraButtonIcon' as const
    return recording() && blink() ? ('PLCameraButtonRecordOn' as const) : ('PLCameraButtonRecordOff' as const)
  }

  return (
    <div class="relative h-full w-full overflow-hidden" style={{ background: 'black' }}>
      <img
        src={`${import.meta.env.BASE_URL}${CameraMetrics.placeholderScene}`}
        alt=""
        draggable={false}
        class="absolute inset-0 h-full w-full object-cover"
        style={{ opacity: `${live() ? 0 : 1}` }}
      />

      <video
        ref={video}
        class="absolute inset-0 h-full w-full object-cover"
        playsinline
        muted
        autoplay
        style={{
          transform: 'scaleX(-1)',
          opacity: `${live() ? 1 : 0}`
        }}
      />

      <div class="relative flex h-full w-full flex-col">
        <CameraHeader
          mode={mode()}
          recording={recording()}
          elapsed={elapsed()}
          onFlip={flip}
        />

        <div class="flex-1" />

        <div
          class="relative flex items-center"
          style={{
            height: `${CameraMetrics.toolBarHeight}px`,
            background: CameraPalette.toolBar
          }}
        >
          <div
            class="flex items-center"
            style={{
              width: `${props.width / CameraMetrics.thumbnailGroupDivisor}px`,
              'margin-left': `${CameraMetrics.toolBarInset}px`
            }}
          >
            <PressableButton onClick={props.onOpenLibrary}>
              <Show
                when={thumbnail()}
                fallback={
                  <CGImage
                    name="PLCameraPreviewPlaceholder"
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
                    alt=""
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
            class="relative flex items-center justify-center"
            style={{
              width: `${props.width / CameraMetrics.shutterDivisor}px`,
              height: `${CameraMetrics.thumbnailSize}px`,
              margin: '0 auto'
            }}
            onClick={shutter}
            scale={false}
          >
            <CGResizableImage
              name="PLCameraButtonSilver"
              width={props.width / CameraMetrics.shutterDivisor}
              height={CameraMetrics.thumbnailSize}
              class="absolute inset-0"
            />
            <CGImage name={shutterIcon()} class="relative" />
          </PressableButton>

          <div style={{ 'margin-right': `${CameraMetrics.toolBarInset}px` }}>
            <CameraFlipper
              width={props.width / CameraMetrics.flipperDivisor}
              mode={mode()}
              onChange={setMode}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
