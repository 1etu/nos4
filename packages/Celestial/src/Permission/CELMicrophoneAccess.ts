import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { CELAuthorizationStatus, type CELAuthorizationStatusValue } from '../Support/CELTypes'
import { CELMicrophoneAccessDidChange, CelestialIdentifier } from '../Support/CELNotifications'

const [status, setStatus] = createSignal<CELAuthorizationStatusValue>(
  CELAuthorizationStatus.notDetermined
)

export const celMicrophoneStatus = status

const publish = (next: CELAuthorizationStatusValue) => {
  if (status() === next) return
  setStatus(next)
  NSNotificationCenter.post(CELMicrophoneAccessDidChange, CelestialIdentifier, { status: next })
}

const fromPermissionState = (state: PermissionState): CELAuthorizationStatusValue => {
  if (state === 'granted') return CELAuthorizationStatus.authorized
  if (state === 'denied') return CELAuthorizationStatus.denied
  return CELAuthorizationStatus.notDetermined
}

export const celRefreshMicrophoneStatus = async (): Promise<CELAuthorizationStatusValue> => {
  const permissions = navigator.permissions
  if (!permissions) return status()
  try {
    const descriptor = { name: 'microphone' } as unknown as PermissionDescriptor
    const result = await permissions.query(descriptor)
    publish(fromPermissionState(result.state))
    result.onchange = () => publish(fromPermissionState(result.state))
  } catch {
    return status()
  }
  return status()
}

export const celRequestMicrophoneAccess = async (): Promise<MediaStream | undefined> => {
  const devices = navigator.mediaDevices
  if (!devices) {
    publish(CELAuthorizationStatus.restricted)
    return undefined
  }
  try {
    const stream = await devices.getUserMedia({ audio: true })
    publish(CELAuthorizationStatus.authorized)
    return stream
  } catch (error) {
    const name = error instanceof DOMException ? error.name : ''
    publish(
      name === 'NotFoundError' || name === 'NotSupportedError'
        ? CELAuthorizationStatus.restricted
        : CELAuthorizationStatus.denied
    )
    return undefined
  }
}
