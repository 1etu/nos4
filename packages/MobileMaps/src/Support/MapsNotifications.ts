import { defineNotification } from 'Foundation'
import type { CLLocationCoordinate2D } from 'CoreLocation'
import type { MapsRoute, MapsTransportValue } from './MapsTypes'

export const MapsIdentifier = 'com.nos4.maps'

export const MKMapViewRegionDidChange = defineNotification<{
  centre: CLLocationCoordinate2D
  zoom: number
}>('MKMapViewRegionDidChangeNotification')

export const MKLocalSearchDidComplete = defineNotification<{
  query: string
  matches: number
}>('MKLocalSearchDidCompleteNotification')

export const MKDirectionsDidCalculate = defineNotification<{
  transport: MapsTransportValue
  route: MapsRoute
}>('MKDirectionsDidCalculateNotification')
