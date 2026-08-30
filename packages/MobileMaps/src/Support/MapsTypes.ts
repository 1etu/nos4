import type { CLLocationCoordinate2D } from 'CoreLocation'

export const MapsSegment = {
  search: 'search',
  directions: 'directions'
} as const

export type MapsSegmentValue = (typeof MapsSegment)[keyof typeof MapsSegment]

export const MapsTransport = {
  automobile: 'automobile',
  transit: 'transit',
  walking: 'walking'
} as const

export type MapsTransportValue = (typeof MapsTransport)[keyof typeof MapsTransport]

export const MapsType = {
  standard: 'standard',
  satellite: 'satellite',
  hybrid: 'hybrid',
  list: 'list'
} as const

export type MapsTypeValue = (typeof MapsType)[keyof typeof MapsType]

export const MapsEditingState = {
  none: 'none',
  activeEmpty: 'activeEmpty',
  active: 'active'
} as const

export type MapsEditingStateValue = (typeof MapsEditingState)[keyof typeof MapsEditingState]

export const MapsPinTone = {
  destination: 'destination',
  origin: 'origin'
} as const

export type MapsPinToneValue = (typeof MapsPinTone)[keyof typeof MapsPinTone]

export interface MapsAnnotation {
  readonly id: string
  readonly title: string
  readonly subtitle: string
  readonly coordinate: CLLocationCoordinate2D
  readonly tone: MapsPinToneValue
}

export interface MapsRoute {
  readonly path: readonly CLLocationCoordinate2D[]
  readonly distance: string
  readonly duration: string
}
