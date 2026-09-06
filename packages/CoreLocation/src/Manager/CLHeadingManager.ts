import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { CLLocationMetrics } from '../Support/CLMetrics'
import {
  CLLocationManagerDidUpdateHeading,
  CoreLocationIdentifier
} from '../Support/CLNotifications'
import {
  CLAuthorizationStatus,
  type CLAuthorizationStatusValue,
  type CLHeading
} from '../Support/CLTypes'

interface OrientationPermission {
  readonly requestPermission?: () => Promise<PermissionState | 'default'>
}

interface CompassOrientationEvent extends DeviceOrientationEvent {
  readonly webkitCompassHeading?: number
  readonly webkitCompassAccuracy?: number
}

const [heading, setHeading] = createSignal<CLHeading | undefined>()
const [status, setStatus] = createSignal<CLAuthorizationStatusValue>(
  CLAuthorizationStatus.notDetermined
)

export const clHeading = heading
export const clHeadingAuthorizationStatus = status

const orientationEvent = (): OrientationPermission | undefined => {
  if (typeof DeviceOrientationEvent === 'undefined') return undefined
  return DeviceOrientationEvent as unknown as OrientationPermission
}

export const clHeadingAvailable = (): boolean => orientationEvent() !== undefined

export const clHeadingRequiresAuthorization = (): boolean =>
  typeof orientationEvent()?.requestPermission === 'function'

const wrap = (degrees: number): number =>
  ((degrees % CLLocationMetrics.fullTurnDegrees) + CLLocationMetrics.fullTurnDegrees) %
  CLLocationMetrics.fullTurnDegrees

const screenAngle = (): number => {
  const angle = window.screen?.orientation?.angle
  return typeof angle === 'number' ? angle : 0
}

let listening = false
let smoothedX = 0
let smoothedY = 0
let settled = false

const publish = (next: CLHeading): void => {
  setHeading(next)
  NSNotificationCenter.post(CLLocationManagerDidUpdateHeading, CoreLocationIdentifier, {
    heading: next
  })
}

const smooth = (degrees: number): number => {
  const radians = degrees / CLLocationMetrics.degreesPerRadian
  const alpha = settled ? CLLocationMetrics.headingSmoothing : 1
  smoothedX = (1 - alpha) * smoothedX + alpha * Math.sin(radians)
  smoothedY = (1 - alpha) * smoothedY + alpha * Math.cos(radians)
  settled = true
  return wrap(Math.atan2(smoothedX, smoothedY) * CLLocationMetrics.degreesPerRadian)
}

const readEvent = (
  event: CompassOrientationEvent
): { magnetic: number; accuracy: number } | undefined => {
  if (typeof event.webkitCompassHeading === 'number' && !Number.isNaN(event.webkitCompassHeading)) {
    return {
      magnetic: event.webkitCompassHeading,
      accuracy: event.webkitCompassAccuracy ?? CLLocationMetrics.headingDefaultAccuracy
    }
  }
  if (event.absolute && event.alpha !== null) {
    return {
      magnetic: CLLocationMetrics.fullTurnDegrees - event.alpha,
      accuracy: CLLocationMetrics.headingDefaultAccuracy
    }
  }
  return undefined
}

const onOrientation = (event: DeviceOrientationEvent): void => {
  const reading = readEvent(event as CompassOrientationEvent)
  if (!reading) return
  if (status() !== CLAuthorizationStatus.authorizedWhenInUse) {
    setStatus(CLAuthorizationStatus.authorizedWhenInUse)
  }
  const magnetic = smooth(wrap(reading.magnetic + screenAngle()))
  publish({
    magneticHeading: magnetic,
    trueHeading: magnetic,
    headingAccuracy: reading.accuracy,
    timestamp: Date.now()
  })
}

export const clStartUpdatingHeading = (): void => {
  if (listening || !clHeadingAvailable()) return
  listening = true
  window.addEventListener('deviceorientationabsolute', onOrientation)
  window.addEventListener('deviceorientation', onOrientation)
}

export const clStopUpdatingHeading = (): void => {
  if (!listening) return
  listening = false
  settled = false
  window.removeEventListener('deviceorientationabsolute', onOrientation)
  window.removeEventListener('deviceorientation', onOrientation)
}

export const clRequestHeadingAuthorization = async (): Promise<CLAuthorizationStatusValue> => {
  if (!clHeadingAvailable()) {
    setStatus(CLAuthorizationStatus.restricted)
    return status()
  }
  const request = orientationEvent()?.requestPermission
  if (typeof request !== 'function') {
    clStartUpdatingHeading()
    return status()
  }
  try {
    const result = await request()
    if (result === 'granted') {
      setStatus(CLAuthorizationStatus.authorizedWhenInUse)
      clStartUpdatingHeading()
      return status()
    }
    setStatus(CLAuthorizationStatus.denied)
  } catch {
    setStatus(CLAuthorizationStatus.denied)
  }
  return status()
}

export const clHeadingSectorName = (degrees: number): string => {
  const span = CLLocationMetrics.fullTurnDegrees / CLLocationMetrics.compassSectors.length
  const index = Math.round(wrap(degrees) / span) % CLLocationMetrics.compassSectors.length
  return CLLocationMetrics.compassSectors[index] ?? CLLocationMetrics.compassSectors[0] ?? 'N'
}

export const clCoordinateText = (value: number, latitude: boolean): string => {
  const hemisphere = latitude ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  const magnitude = Math.abs(value)
  const degrees = Math.trunc(magnitude)
  const remainder = (magnitude - degrees) * 60
  const minutes = Math.trunc(remainder)
  const seconds = Math.round((remainder - minutes) * 60)
  return `${degrees}°${minutes}'${seconds}" ${hemisphere}`
}
