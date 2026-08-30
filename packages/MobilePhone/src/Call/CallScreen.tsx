import { Show, createEffect, createSignal, onCleanup } from 'solid-js'
import { assetURL } from 'CoreGraphics'
import { caAfter } from 'CoreAnimation'
import { UIStatusBar, uiWallpaperLock } from 'UIKit'
import { PhoneMetrics } from '../Support/PhoneMetrics'
import {
  phCall,
  phCallDuration,
  phCallState,
  phConnectCall,
  phEndCall
} from '../Support/CallCenter'
import { CallActionButton } from './CallActionButton'
import { CallHeader } from './CallHeader'
import { CallPad } from './CallPad'

const TickInterval = 1000

export const CallScreen = () => {
  const [muted, setMuted] = createSignal(false)
  const [speaker, setSpeaker] = createSignal(false)
  const [now, setNow] = createSignal(Date.now())

  createEffect(() => {
    if (phCallState() !== 'dialing') return
    const transaction = caAfter(PhoneMetrics.callConnectDelay, phConnectCall)
    onCleanup(transaction.cancel)
  })

  createEffect(() => {
    if (phCallState() !== 'active') return
    setNow(Date.now())
    const handle = window.setInterval(() => setNow(Date.now()), TickInterval)
    onCleanup(() => window.clearInterval(handle))
  })

  const label = () => phCall()?.label ?? ''

  const status = () => {
    if (phCallState() === 'incoming') return label()
    if (phCallState() === 'dialing') return label() === '' ? 'calling...' : `calling ${label()}...`
    return phCallDuration(now())
  }

  return (
    <div class="absolute inset-0 flex flex-col overflow-hidden">
      <img
        src={assetURL(uiWallpaperLock())}
        alt=""
        draggable={false}
        class="absolute inset-0 h-full w-full"
        style={{ 'object-fit': 'cover' }}
      />

      <div class="relative">
        <UIStatusBar style="overlay" />
      </div>

      <div class="relative">
        <CallHeader name={phCall()?.name ?? ''} status={status()} />
      </div>

      <div class="relative" style={{ flex: `${PhoneMetrics.callGapTopRatio}` }} />

      <Show when={phCallState() !== 'incoming'}>
        <div class="relative">
          <CallPad
            muted={muted()}
            speaker={speaker()}
            onMute={() => setMuted(!muted())}
            onSpeaker={() => setSpeaker(!speaker())}
          />
        </div>
      </Show>

      <div class="relative" style={{ flex: `${PhoneMetrics.callGapMidRatio}` }} />

      <div
        class="relative flex"
        style={{
          padding: `0 ${PhoneMetrics.callGutter}px ${PhoneMetrics.callBottomMargin}px`,
          gap: `${PhoneMetrics.callAnswerGap}px`
        }}
      >
        <Show
          when={phCallState() === 'incoming'}
          fallback={<CallActionButton title="End" tone="end" onPress={phEndCall} />}
        >
          <CallActionButton title="Decline" tone="end" onPress={phEndCall} />
          <CallActionButton title="Answer" tone="answer" onPress={phConnectCall} />
        </Show>
      </div>
    </div>
  )
}
