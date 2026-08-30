import { createSignal } from 'solid-js'
import { NSNotificationCenter } from 'Foundation'
import { CLLocationMetrics } from '../Support/CLMetrics'
import {
  CLLocationManagerDidChangeAuthorization,
  CLLocationManagerDidFailWithError,
  CLLocationManagerDidUpdateLocations,
  CoreLocationIdentifier
} from '../Support/CLNotifications'
import {
  CLAuthorizationStatus,
  CLError,
  type CLAuthorizationStatusValue,
  type CLErrorValue,
  type CLLocation,
  type CLLocationCoordinate2D
} from '../Support/CLTypes'

const [status, setStatus] = createSignal<CLAuthorizationStatusValue>(
  CLAuthorizationStatus.notDetermined
)
const [location, setLocation] = createSignal<CLLocation | undefined>()

let watch = 0

export const clAuthorizationStatus = status
export const clLocation = location

export const clLocationServicesEnabled = (): boolean => navigator.geolocation !== undefined

const publishStatus = (next: CLAuthorizationStatusValue): void => {
  if (status() === next) return
  setStatus(next)
  NSNotificationCenter.post(CLLocationManagerDidChangeAuthorization, CoreLocationIdentifier, {
    status: next
  })
}

const publishError = (code: CLErrorValue): void => {
  NSNotificationCenter.post(CLLocationManagerDidFailWithError, CoreLocationIdentifier, { code })
}

const publishFix = (position: GeolocationPosition): void => {
  const next: CLLocation = {
    coordinate: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    },
    horizontalAccuracy: position.coords.accuracy,
    course: position.coords.heading ?? -1,
    speed: position.coords.speed ?? -1,
    timestamp: position.timestamp
  }
  publishStatus(CLAuthorizationStatus.authorizedWhenInUse)
  setLocation(next)
  NSNotificationCenter.post(CLLocationManagerDidUpdateLocations, CoreLocationIdentifier, {
    location: next
  })
}

const publishFailure = (error: GeolocationPositionError): void => {
  if (error.code === error.PERMISSION_DENIED) {
    publishStatus(CLAuthorizationStatus.denied)
    publishError(CLError.denied)
    return
  }
  publishError(
    error.code === error.POSITION_UNAVAILABLE ? CLError.locationUnknown : CLError.network
  )
}

const fromPermissionState = (state: PermissionState): CLAuthorizationStatusValue => {
  if (state === 'granted') return CLAuthorizationStatus.authorizedWhenInUse
  if (state === 'denied') return CLAuthorizationStatus.denied
  return CLAuthorizationStatus.notDetermined
}

export const clRefreshAuthorizationStatus = async (): Promise<CLAuthorizationStatusValue> => {
  if (!clLocationServicesEnabled()) {
    publishStatus(CLAuthorizationStatus.restricted)
    return status()
  }
  const permissions = navigator.permissions
  if (!permissions) return status()
  try {
    const result = await permissions.query({ name: 'geolocation' })
    publishStatus(fromPermissionState(result.state))
    result.onchange = () => publishStatus(fromPermissionState(result.state))
  } catch {
    return status()
  }
  return status()
}

export const clStartUpdatingLocation = (): void => {
  if (watch !== 0 || !clLocationServicesEnabled()) return
  watch = navigator.geolocation.watchPosition(publishFix, publishFailure, {
    enableHighAccuracy: true,
    timeout: CLLocationMetrics.fixTimeoutMilliseconds,
    maximumAge: CLLocationMetrics.fixMaximumAgeMilliseconds
  })
}

export const clStopUpdatingLocation = (): void => {
  if (watch === 0) return
  navigator.geolocation.clearWatch(watch)
  watch = 0
}

export const clRequestWhenInUseAuthorization = (): void => {
  if (!clLocationServicesEnabled()) {
    publishStatus(CLAuthorizationStatus.restricted)
    return
  }
  navigator.geolocation.getCurrentPosition(publishFix, publishFailure, {
    enableHighAccuracy: true,
    timeout: CLLocationMetrics.fixTimeoutMilliseconds,
    maximumAge: CLLocationMetrics.fixMaximumAgeMilliseconds
  })
}

export const clDistanceBetween = (
  from: CLLocationCoordinate2D,
  to: CLLocationCoordinate2D
): number => {
  const radians = 1 / CLLocationMetrics.degreesPerRadian
  const fromLatitude = from.latitude * radians
  const toLatitude = to.latitude * radians
  const deltaLatitude = (to.latitude - from.latitude) * radians
  const deltaLongitude = (to.longitude - from.longitude) * radians
  const chord =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2
  return (
    CLLocationMetrics.earthRadiusMetres *
    2 *
    Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord))
  )
}
