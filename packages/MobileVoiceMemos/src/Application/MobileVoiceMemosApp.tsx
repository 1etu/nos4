import { createSignal, onCleanup, onMount, Show } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { avMakeAudioPlayer, AVPlaybackState } from 'AVFoundation'
import { celMakeAudioRecorder, CELRecorderState } from 'Celestial'
import { UIStatusBar, UIStatusBarMetrics } from 'UIKit'
import { VMBezelFooter } from '../Recorder/VMBezelFooter'
import { VMRecordingsView } from '../Recordings/VMRecordingsView'
import {
  vmAddRecording,
  vmRecordings,
  vmRefreshLibrary,
  vmRemoveRecording,
  type VMRecordingItem
} from '../Support/VMLibrary'
import { VMMetrics } from '../Support/VMMetrics'

export const MobileVoiceMemosApp = (props: { width: number; height: number }) => {
  const recorder = celMakeAudioRecorder()
  const player = avMakeAudioPlayer()

  const [showRecordings, setShowRecordings] = createSignal(false)
  const [selected, setSelected] = createSignal<VMRecordingItem | undefined>()
  const [speaker, setSpeaker] = createSignal(false)

  const bodyWidth = () => props.width * VMMetrics.bodyWidthRatio
  const bodyHeight = () => bodyWidth() * VMMetrics.bodyAspect
  const footerHeight = () => props.width * VMMetrics.footerAspect
  const glowSize = () => props.width * VMMetrics.glowSpreadRatio

  const select = (item: VMRecordingItem) => {
    if (selected()?.id === item.id) return
    player.pause()
    setSelected(item)
    player.load(item.source)
  }

  onMount(() => {
    void vmRefreshLibrary().then(() => {
      const first = vmRecordings()[0]
      if (first) select(first)
    })
    void recorder.startMonitoring()
  })

  onCleanup(() => {
    recorder.stopMonitoring()
    player.dispose()
  })

  const transport = () => {
    if (recorder.state() === CELRecorderState.stopped) {
      recorder.startRecording()
      return
    }
    if (recorder.state() === CELRecorderState.paused) {
      recorder.resumeRecording()
      return
    }
    recorder.pauseRecording()
  }

  const secondary = async () => {
    if (recorder.state() !== CELRecorderState.recording) {
      setShowRecordings(true)
      return
    }
    const captured = await recorder.stopRecording()
    if (!captured || captured.duration <= 0) return
    await vmAddRecording(captured)
    const latest = vmRecordings()[0]
    if (latest) select(latest)
  }

  const removeSelected = async () => {
    const doomed = selected()
    if (!doomed) return
    player.pause()
    setSelected(undefined)
    await vmRemoveRecording(doomed.id)
    const next = vmRecordings()[0]
    if (next) select(next)
  }

  const share = () => {
    const item = selected()
    if (!item || !navigator.share) return
    void navigator.share({ title: item.title, url: item.source }).catch(() => undefined)
  }

  return (
    <div class="relative h-full w-full" style={{ background: 'black', overflow: 'hidden' }}>
      <div class="flex h-full w-full flex-col">
        <UIStatusBar style={showRecordings() ? 'inApp' : 'overlay'} />
        <div class="flex-1" />
        <div
          class="relative self-center"
          style={{ width: `${bodyWidth()}px`, height: `${bodyHeight()}px` }}
        >
          <img
            src={assetURL('whiteglow')}
            alt=""
            draggable={false}
            class="pointer-events-none absolute"
            style={{
              width: `${glowSize()}px`,
              height: `${glowSize()}px`,
              left: `${(bodyWidth() - glowSize()) / 2}px`,
              top: `${(bodyHeight() - glowSize()) / 2}px`,
              opacity: `${VMMetrics.glowOpacity}`
            }}
          />
          <img
            src={assetURL('mic')}
            alt=""
            draggable={false}
            class="absolute inset-0 h-full w-full"
            style={{ 'object-fit': 'cover' }}
          />
        </div>
        <VMBezelFooter
          width={props.width}
          height={footerHeight()}
          level={recorder.level()}
          state={recorder.state()}
          onTransport={transport}
          onSecondary={() => void secondary()}
        />
      </div>

      <Show when={showRecordings()}>
        <div
          class="absolute inset-x-0 bottom-0"
          style={{ top: `${UIStatusBarMetrics.height}px` }}
        >
          <VMRecordingsView
            recordings={vmRecordings()}
            selectedId={selected()?.id}
            playing={player.state() === AVPlaybackState.playing}
            currentTime={player.currentTime()}
            duration={player.duration()}
            speaker={speaker()}
            onSelect={select}
            onTogglePlay={() => {
              if (player.state() === AVPlaybackState.playing) {
                player.pause()
                return
              }
              void player.play()
            }}
            onSeek={(seconds) => player.seek(seconds)}
            onToggleSpeaker={() => setSpeaker(!speaker())}
            onShare={share}
            onDelete={() => void removeSelected()}
            onDone={() => setShowRecordings(false)}
          />
        </div>
      </Show>
    </div>
  )
}
