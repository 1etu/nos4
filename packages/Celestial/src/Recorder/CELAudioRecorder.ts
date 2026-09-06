import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { celRequestMicrophoneAccess } from '../Permission/CELMicrophoneAccess'
import { CELRecorderState, type CELRecorderStateValue } from '../Support/CELTypes'
import { CELRecorderMetrics } from '../Support/CELMetrics'
import {
  CELRecorderDidChangeState,
  CELRecorderDidFinish,
  CelestialIdentifier
} from '../Support/CELNotifications'

export interface CELRecording {
  readonly blob: Blob
  readonly duration: number
  readonly recordedAt: number
  readonly sampleRate: number
}

export interface CELAudioRecorder {
  state: () => CELRecorderStateValue
  level: () => number
  elapsed: () => number
  startMonitoring: () => Promise<boolean>
  stopMonitoring: () => void
  startRecording: () => Promise<boolean>
  pauseRecording: () => void
  resumeRecording: () => void
  stopRecording: () => Promise<CELRecording | undefined>
}

const WorkletName = 'cel-capture'

const WorkletSource = `
class CELCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.buffer = new Float32Array(${CELRecorderMetrics.captureBlock})
    this.fill = 0
    this.port.onmessage = () => {
      this.port.postMessage(this.buffer.slice(0, this.fill))
      this.fill = 0
      this.port.postMessage('flushed')
    }
  }
  process(inputs) {
    const channel = inputs[0] && inputs[0][0]
    if (!channel) return true
    let at = 0
    while (at < channel.length) {
      const count = Math.min(channel.length - at, this.buffer.length - this.fill)
      this.buffer.set(channel.subarray(at, at + count), this.fill)
      this.fill += count
      at += count
      if (this.fill === this.buffer.length) {
        this.port.postMessage(this.buffer, [this.buffer.buffer])
        this.buffer = new Float32Array(${CELRecorderMetrics.captureBlock})
        this.fill = 0
      }
    }
    return true
  }
}
registerProcessor('${WorkletName}', CELCaptureProcessor)
`

let workletURL: string | undefined

const workletModule = (): string => {
  if (!workletURL) {
    workletURL = URL.createObjectURL(new Blob([WorkletSource], { type: 'application/javascript' }))
  }
  return workletURL
}

const encodeWAV = (chunks: readonly Float32Array[], sampleRate: number): Blob => {
  const frames = chunks.reduce((total, chunk) => total + chunk.length, 0)
  const bytes = new ArrayBuffer(44 + frames * 2)
  const view = new DataView(bytes)
  const ascii = (at: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) view.setUint8(at + i, text.charCodeAt(i))
  }
  ascii(0, 'RIFF')
  view.setUint32(4, 36 + frames * 2, true)
  ascii(8, 'WAVE')
  ascii(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  ascii(36, 'data')
  view.setUint32(40, frames * 2, true)
  let at = 44
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i += 1) {
      const sample = Math.max(-1, Math.min(1, chunk[i] ?? 0))
      view.setInt16(at, sample < 0 ? sample * 32768 : sample * 32767, true)
      at += 2
    }
  }
  return new Blob([bytes], { type: 'audio/wav' })
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

  let capture: AudioWorkletNode | ScriptProcessorNode | undefined
  let sink: GainNode | undefined
  let flushed: (() => void) | undefined
  let chunks: Float32Array[] = []
  let captured = 0
  let startedAt = 0
  let opening: Promise<boolean> | undefined

  const publish = (next: CELRecorderStateValue) => {
    setState(next)
    NSNotificationCenter.post(CELRecorderDidChangeState, CelestialIdentifier, { state: next })
  }

  const sampleRate = (): number => context?.sampleRate ?? CELRecorderMetrics.sampleRate

  const runningTime = (): number => captured / sampleRate()

  const accept = (chunk: Float32Array) => {
    if (state() !== CELRecorderState.recording || chunk.length === 0) return
    chunks.push(chunk)
    captured += chunk.length
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

  const attachCapture = async (engine: AudioContext, input: MediaStreamAudioSourceNode) => {
    sink = engine.createGain()
    sink.gain.value = 0
    sink.connect(engine.destination)
    if (engine.audioWorklet && typeof AudioWorkletNode !== 'undefined') {
      try {
        await engine.audioWorklet.addModule(workletModule())
        const node = new AudioWorkletNode(engine, WorkletName, {
          numberOfInputs: 1,
          numberOfOutputs: 1,
          channelCount: 1,
          channelCountMode: 'explicit'
        })
        node.port.onmessage = (event: MessageEvent<Float32Array | string>) => {
          if (event.data === 'flushed') {
            flushed?.()
            flushed = undefined
            return
          }
          if (event.data instanceof Float32Array) accept(event.data)
        }
        input.connect(node)
        node.connect(sink)
        capture = node
        return
      } catch {
        capture = undefined
      }
    }
    const processor = engine.createScriptProcessor(CELRecorderMetrics.captureBlock, 1, 1)
    processor.onaudioprocess = (event) => {
      accept(event.inputBuffer.getChannelData(0).slice())
    }
    input.connect(processor)
    processor.connect(sink)
    capture = processor
  }

  const flushCapture = async () => {
    const node = capture
    if (!(node instanceof AudioWorkletNode)) return
    await new Promise<void>((resolve) => {
      const settle = setTimeout(() => {
        flushed = undefined
        resolve()
      }, CELRecorderMetrics.stopTimeout)
      flushed = () => {
        clearTimeout(settle)
        resolve()
      }
      node.port.postMessage('flush')
    })
  }

  const teardownGraph = () => {
    if (frame !== 0) cancelAnimationFrame(frame)
    frame = 0
    lastTick = 0
    source?.disconnect()
    analyser?.disconnect()
    capture?.disconnect()
    sink?.disconnect()
    source = undefined
    analyser = undefined
    samples = undefined
    capture = undefined
    sink = undefined
    void context?.close()
    context = undefined
    for (const track of stream?.getTracks() ?? []) track.stop()
    stream = undefined
    smoothed = CELRecorderMetrics.minimumVU
    setLevel(CELRecorderMetrics.minimumVU)
  }

  const discard = () => {
    chunks = []
    captured = 0
    setElapsed(0)
    if (state() !== CELRecorderState.stopped) publish(CELRecorderState.stopped)
  }

  const open = async (): Promise<boolean> => {
    if (stream && context) return true
    const granted = await celRequestMicrophoneAccess({
      channelCount: { ideal: CELRecorderMetrics.channelCount },
      sampleRate: { ideal: CELRecorderMetrics.sampleRate }
    })
    if (!granted) return false
    stream = granted
    const engine = new AudioContext()
    context = engine
    await engine.resume().catch(() => undefined)
    const input = engine.createMediaStreamSource(granted)
    source = input
    analyser = engine.createAnalyser()
    analyser.fftSize = CELRecorderMetrics.fftSize
    samples = new Float32Array(analyser.fftSize)
    input.connect(analyser)
    await attachCapture(engine, input)
    for (const track of granted.getAudioTracks()) {
      track.onended = () => {
        discard()
        teardownGraph()
      }
    }
    frame = requestAnimationFrame(measure)
    return true
  }

  const startMonitoring = (): Promise<boolean> => {
    if (opening) return opening
    opening = open().finally(() => {
      opening = undefined
    })
    return opening
  }

  return {
    state,
    level,
    elapsed,
    startMonitoring,

    stopMonitoring: () => {
      discard()
      teardownGraph()
    },

    startRecording: async () => {
      if (state() !== CELRecorderState.stopped) return false
      const ready = await startMonitoring()
      if (!ready || !capture) return false
      if (context && context.state !== 'running') await context.resume().catch(() => undefined)
      chunks = []
      captured = 0
      startedAt = Date.now()
      publish(CELRecorderState.recording)
      return true
    },

    pauseRecording: () => {
      if (state() !== CELRecorderState.recording) return
      publish(CELRecorderState.paused)
    },

    resumeRecording: () => {
      if (state() !== CELRecorderState.paused) return
      publish(CELRecorderState.recording)
    },

    stopRecording: async () => {
      if (state() === CELRecorderState.stopped) return undefined
      await flushCapture()
      publish(CELRecorderState.stopped)
      const rate = sampleRate()
      const taken = chunks
      chunks = []
      captured = 0
      setElapsed(0)
      const duration = taken.reduce((total, chunk) => total + chunk.length, 0) / rate
      NSNotificationCenter.post(CELRecorderDidFinish, CelestialIdentifier, { duration })
      return { blob: encodeWAV(taken, rate), duration, recordedAt: startedAt, sampleRate: rate }
    }
  }
}
