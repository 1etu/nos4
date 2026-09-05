import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { ckCapturePhoto } from './CKPhotoOutput'
import { ckLoadPhotoLibrary, ckSaveCapture } from '../Library/CKPhotoLibrary'

const stopTracks = (stream: MediaStream | undefined) => {
  for (const track of stream?.getTracks() ?? []) track.stop()
}

const accessError = (error: unknown): string => {
  if (!(error instanceof DOMException)) return 'The camera could not start. Try again.'
  if (error.name === 'NotAllowedError') return 'Allow camera access in your browser, then try again.'
  if (error.name === 'NotFoundError') return 'Connect a camera, then try again.'
  if (error.name === 'NotReadableError') return 'Close other apps that use the camera, then try again.'
  return 'The camera could not start. Try again.'
}

export const ckMakeCaptureSession = () => {
  const [ready, setReady] = createSignal(false)
  const [busy, setBusy] = createSignal(false)
  const [recording, setRecording] = createSignal(false)
  const [elapsed, setElapsed] = createSignal(0)
  const [message, setMessage] = createSignal('')
  const [facing, setFacing] = createSignal<'user' | 'environment'>('environment')
  let video: HTMLVideoElement
  let stream: MediaStream | undefined
  let microphone: MediaStream | undefined
  let recorder: MediaRecorder | undefined
  let request = 0
  let disposed = false
  let startedAt = 0

  const stopRecording = () => {
    const active = recorder
    recorder = undefined
    if (active && active.state !== 'inactive') active.stop()
    stopTracks(microphone)
    microphone = undefined
    setRecording(false)
    setElapsed(0)
  }

  const stop = () => {
    request += 1
    stopRecording()
    stopTracks(stream)
    stream = undefined
    video.srcObject = null
    setReady(false)
    setBusy(false)
  }

  const start = async () => {
    if (disposed || document.hidden || busy()) return
    stop()
    const current = request
    setBusy(true)
    setMessage('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable')
      const next = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing() }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false
      })
      if (disposed || current !== request) return stopTracks(next)
      stream = next
      const track = next.getVideoTracks()[0]
      const actualFacing = track?.getSettings().facingMode
      if (actualFacing === 'user' || actualFacing === 'environment') setFacing(actualFacing)
      if (track) track.onended = () => { stop(); setMessage('The camera disconnected. Try again.') }
      video.srcObject = next
      await video.play()
      if (disposed || current !== request) return
      setReady(true)
    } catch (error) {
      if (disposed || current !== request) return
      stopTracks(stream)
      stream = undefined
      setMessage(accessError(error))
    } finally {
      if (!disposed && current === request) setBusy(false)
    }
  }

  const takePhoto = async () => {
    if (!ready() || busy() || recording()) return
    setBusy(true)
    setMessage('')
    try {
      const blob = await ckCapturePhoto(video)
      await ckSaveCapture(blob, 'image')
    } catch {
      if (!disposed) setMessage('The photo could not be captured. Try again.')
    } finally {
      if (!disposed) setBusy(false)
    }
  }

  const startRecording = async () => {
    if (!ready() || busy() || recorder || !stream) return
    if (typeof MediaRecorder === 'undefined') {
      setMessage('This browser cannot record video.')
      return
    }
    setBusy(true)
    setMessage('')
    const current = request
    try {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (disposed || current !== request) return stopTracks(audio)
      microphone = audio
      const source = new MediaStream([...stream.getVideoTracks(), ...audio.getAudioTracks()])
      const active = new MediaRecorder(source)
      const chunks: Blob[] = []
      let failed = false
      const recordingStart = performance.now()
      active.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
      active.onerror = () => { failed = true; stopRecording(); setMessage('Video recording failed. Try again.') }
      active.onstop = () => {
        const duration = (performance.now() - recordingStart) / 1000
        if (recorder === active) stopRecording()
        if (!failed && chunks.length) void ckSaveCapture(new Blob(chunks, { type: active.mimeType }), 'video', duration)
      }
      for (const track of audio.getAudioTracks()) track.onended = stopRecording
      active.start()
      startedAt = performance.now()
      recorder = active
      setRecording(true)
    } catch {
      if (disposed || current !== request) return
      stopTracks(microphone)
      microphone = undefined
      setMessage('Allow microphone access to record video with sound, then try again.')
    } finally {
      if (!disposed && current === request) setBusy(false)
    }
  }

  createEffect(() => {
    if (!recording()) return
    const timer = setInterval(() => setElapsed(Math.floor((performance.now() - startedAt) / 1000)), 1000)
    onCleanup(() => clearInterval(timer))
  })

  onMount(() => {
    void ckLoadPhotoLibrary()
    void start()
    const hide = () => {
      if (!document.hidden) return
      stop()
      setMessage('The camera paused. Tap Try Again to resume.')
    }
    document.addEventListener('visibilitychange', hide)
    onCleanup(() => {
      disposed = true
      stop()
      document.removeEventListener('visibilitychange', hide)
    })
  })

  return {
    ready, busy, recording, elapsed, message, facing, start, takePhoto, startRecording, stopRecording,
    attach: (element: HTMLVideoElement) => { video = element },
    flip: () => {
      if (busy() || recording()) return
      setFacing(facing() === 'user' ? 'environment' : 'user')
      void start()
    }
  }
}
