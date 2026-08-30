import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { celRequestMicrophoneAccess } from '../Permission/CELMicrophoneAccess'
import { CELRecorderState, type CELRecorderStateValue } from '../Support/CELTypes'
import { CELRecorderFormats, CELRecorderMetrics } from '../Support/CELMetrics'
import {
  CELRecorderDidChangeState,
  CELRecorderDidFinish,
  CelestialIdentifier
} from '../Support/CELNotifications'

export interface CELRecording {
  readonly blob: Blob
  readonly duration: number
  readonly recordedAt: number
}

export interface CELAudioRecorder {
  state: () => CELRecorderStateValue
  level: () => number
  elapsed: () => number
  startMonitoring: () => Promise<void>
  stopMonitoring: () => void
  startRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<CELRecording | undefined>
}

const supportedFormat = (): string | undefined => {
  if (typeof MediaRecorder === 'undefined') return undefined
  return CELRecorderFormats.find((format) => MediaRecorder.isTypeSupported(format))
}

export const celMakeAudioRecorder = (): CELAudioRecorder => {
  const [state, setState] = createSignal<CELRecorderStateValue>(CELRecorderState.stopped)
  const [level, setLevel] = createSignal<number>(CELRecorderMetrics.minimumVU)
  const [elapsed, setElapsed] = createSignal(0)

  let stream: MediaStream | undefined
  let context: AudioContext | undefined
  let source: MediaStreamAudioSourceNode | undefined
  let analyser: AnalyserNode | undefined
  let samples: Float32Array<ArrayBuffer> | undefined
  let frame = 0
  let lastTick = 0
  let smoothed: number = CELRecorderMetrics.minimumVU

  let recorder: MediaRecorder | undefined
  let chunks: Blob[] = []
  let startedAt = 0
  let accumulated = 0
  let resumedAt = 0

  const publish = (next: CELRecorderStateValue) => {
    setState(next)
    NSNotificationCenter.post(CELRecorderDidChangeState, CelestialIdentifier, { state: next })
  }

  const runningTime = (): number => {
    if (state() !== CELRecorderState.recording) return accumulated
    return accumulated + (performance.now() - resumedAt) / 1000
  }

  const measure = (now: number) => {
    frame = requestAnimationFrame(measure)
    if (!analyser || !samples) return
    analyser.getFloatTimeDomainData(samples)

    let sum = 0
    for (let i = 0; i < samples.length; i += 1) {
      const value = samples[i] ?? 0
      sum += value * value
    }
    const rms = Math.sqrt(Math.max(sum / samples.length, CELRecorderMetrics.silenceFloor))
    const instant = 20 * Math.log10(rms) + CELRecorderMetrics.referenceOffset

    const delta = lastTick === 0 ? 0 : (now - lastTick) / 1000
    lastTick = now
    const alpha = delta / (CELRecorderMetrics.smoothingTau + delta)
    smoothed =
      Number.isFinite(instant) && delta > 0
        ? (1 - alpha) * smoothed + alpha * instant
        : smoothed

    setLevel(
      Math.min(Math.max(smoothed, CELRecorderMetrics.minimumVU), CELRecorderMetrics.maximumVU)
    )
    setElapsed(runningTime())
  }

  const teardownGraph = () => {
    if (frame !== 0) cancelAnimationFrame(frame)
    frame = 0
    lastTick = 0
    source?.disconnect()
    analyser?.disconnect()
    source = undefined
    analyser = undefined
    samples = undefined
    void context?.close()
    context = undefined
    for (const track of stream?.getTracks() ?? []) track.stop()
    stream = undefined
    smoothed = CELRecorderMetrics.minimumVU
    setLevel(CELRecorderMetrics.minimumVU)
  }

  return {
    state,
    level,
    elapsed,

    startMonitoring: async () => {
      if (stream) return
      const granted = await celRequestMicrophoneAccess()
      if (!granted) return
      stream = granted
      context = new AudioContext()
      await context.resume().catch(() => undefined)
      source = context.createMediaStreamSource(granted)
      analyser = context.createAnalyser()
      analyser.fftSize = CELRecorderMetrics.fftSize
      samples = new Float32Array(analyser.fftSize)
      source.connect(analyser)
      frame = requestAnimationFrame(measure)
    },

    stopMonitoring: () => {
      recorder?.stop()
      recorder = undefined
      chunks = []
      accumulated = 0
      setElapsed(0)
      if (state() !== CELRecorderState.stopped) publish(CELRecorderState.stopped)
      teardownGraph()
    },

    startRecording: () => {
      if (!stream || recorder) return
      const format = supportedFormat()
      if (!format) return
      chunks = []
      accumulated = 0
      startedAt = Date.now()
      resumedAt = performance.now()
      const next = new MediaRecorder(stream, { mimeType: format })
      next.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      next.onerror = () => {
        recorder = undefined
        publish(CELRecorderState.stopped)
      }
      for (const track of stream.getAudioTracks()) {
        track.onended = () => {
          recorder = undefined
          publish(CELRecorderState.stopped)
        }
      }
      next.start()
      recorder = next
      publish(CELRecorderState.recording)
    },

    pauseRecording: () => {
      if (!recorder || state() !== CELRecorderState.recording) return
      accumulated = runningTime()
      recorder.pause()
      publish(CELRecorderState.paused)
    },

    resumeRecording: () => {
      if (!recorder || state() !== CELRecorderState.paused) return
      resumedAt = performance.now()
      recorder.resume()
      publish(CELRecorderState.recording)
    },

    stopRecording: async () => {
      const active = recorder
      if (!active) return undefined
      const duration = runningTime()
      recorder = undefined
      accumulated = 0
      setElapsed(0)

      const assemble = () => new Blob(chunks, { type: active.mimeType })
      const blob = await new Promise<Blob>((resolve) => {
        if (active.state === 'inactive') {
          resolve(assemble())
          return
        }
        const settle = setTimeout(() => resolve(assemble()), CELRecorderMetrics.stopTimeout)
        active.onstop = () => {
          clearTimeout(settle)
          resolve(assemble())
        }
        try {
          active.stop()
        } catch {
          clearTimeout(settle)
          resolve(assemble())
        }
      })
      chunks = []
      publish(CELRecorderState.stopped)
      NSNotificationCenter.post(CELRecorderDidFinish, CelestialIdentifier, { duration })
      return { blob, duration, recordedAt: startedAt }
    }
  }
}
