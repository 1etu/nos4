export const CLAuthorizationStatus = {
  notDetermined: 'notDetermined',
  restricted: 'restricted',
  denied: 'denied',
  authorizedWhenInUse: 'authorizedWhenInUse'
} as const

export type CLAuthorizationStatusValue =
  (typeof CLAuthorizationStatus)[keyof typeof CLAuthorizationStatus]

export const CLError = {
  locationUnknown: 'locationUnknown',
  denied: 'denied',
  network: 'network'
} as const

export type CLErrorValue = (typeof CLError)[keyof typeof CLError]

export interface CLLocationCoordinate2D {
  readonly latitude: number
  readonly longitude: number
}

export interface CLLocation {
  readonly coordinate: CLLocationCoordinate2D
  readonly horizontalAccuracy: number
  readonly course: number
  readonly speed: number
  readonly timestamp: number
}

export interface CLPlacemark {
  readonly name: string
  readonly thoroughfare: string
  readonly locality: string
  readonly administrativeArea: string
  readonly country: string
  readonly coordinate: CLLocationCoordinate2D
}
