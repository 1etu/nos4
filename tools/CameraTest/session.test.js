import { afterEach, expect, mock, test } from 'bun:test'
import { createRoot } from 'solid-js'
import { ckMakeCaptureSession } from '../../packages/CameraKit/src/Capture/CKCaptureSession'

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
const originalDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
let dispose

const fixture = (getUserMedia) => {
  const document = Object.assign(new EventTarget(), { hidden: false })
  Object.defineProperty(globalThis, 'document', { value: document, configurable: true })
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia }, configurable: true })
  const video = { srcObject: null, play: mock(async () => undefined) }
  const camera = createRoot((cleanup) => {
    dispose = cleanup
    const session = ckMakeCaptureSession()
    session.attach(video)
    return session
  })
  return { camera, video, document }
}

const cameraStream = () => {
  const track = { stop: mock(() => undefined), getSettings: () => ({ facingMode: 'user' }), onended: null }
  return { track, getTracks: () => [track], getVideoTracks: () => [track] }
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument)
  else Reflect.deleteProperty(globalThis, 'document')
  if (originalDevices) Object.defineProperty(navigator, 'mediaDevices', originalDevices)
  else Reflect.deleteProperty(navigator, 'mediaDevices')
})

test('starts preview after access and releases it on close', async () => {
  const stream = cameraStream()
  const { camera, video } = fixture(async () => stream)
  await Promise.resolve()
  await Promise.resolve()
  expect(camera.ready()).toBe(true)
  expect(camera.facing()).toBe('user')
  expect(video.srcObject).toBe(stream)
  dispose?.()
  expect(stream.track.stop).toHaveBeenCalledTimes(1)
  expect(video.srcObject).toBeNull()
})

test('explains denied permission and can retry', async () => {
  const stream = cameraStream()
  const request = mock(async () => { throw new DOMException('Denied', 'NotAllowedError') })
  const { camera } = fixture(request)
  await Promise.resolve()
  expect(camera.ready()).toBe(false)
  expect(camera.message()).toContain('Allow camera access')
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: async () => stream }, configurable: true
  })
  await camera.start()
  expect(camera.ready()).toBe(true)
  expect(camera.message()).toBe('')
})

test('closes access granted after the app unmounts', async () => {
  const stream = cameraStream()
  const pending = Promise.withResolvers()
  const { camera } = fixture(() => pending.promise)
  dispose?.()
  pending.resolve(stream)
  await Promise.resolve()
  expect(stream.track.stop).toHaveBeenCalledTimes(1)
  expect(camera.ready()).toBe(false)
})

test('stops camera tracks when the document hides', async () => {
  const stream = cameraStream()
  const { camera, document } = fixture(async () => stream)
  await Promise.resolve()
  await Promise.resolve()
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  expect(stream.track.stop).toHaveBeenCalledTimes(1)
  expect(camera.ready()).toBe(false)
  expect(camera.message()).toContain('paused')
})

test('does not start a duplicate permission request', async () => {
  const pending = Promise.withResolvers()
  const request = mock(() => pending.promise)
  const { camera } = fixture(request)
  await camera.start()
  expect(request).toHaveBeenCalledTimes(1)
  dispose?.()
  pending.resolve(cameraStream())
  await Promise.resolve()
})

test('leaves capture disabled if preview playback fails', async () => {
  const stream = cameraStream()
  const { camera, video } = fixture(async () => stream)
  video.play.mockImplementation(async () => { throw new Error('Playback failed') })
  await Promise.resolve()
  await Promise.resolve()
  expect(camera.ready()).toBe(false)
  expect(stream.track.stop).toHaveBeenCalledTimes(1)
})
