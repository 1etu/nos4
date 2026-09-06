export { CLAuthorizationStatus, CLError } from './Support/CLTypes'
export type {
  CLAuthorizationStatusValue,
  CLErrorValue,
  CLHeading,
  CLLocation,
  CLLocationCoordinate2D,
  CLPlacemark
} from './Support/CLTypes'
export { CLLocationMetrics } from './Support/CLMetrics'
export {
  CoreLocationIdentifier,
  CLLocationManagerDidUpdateLocations,
  CLLocationManagerDidUpdateHeading,
  CLLocationManagerDidChangeAuthorization,
  CLLocationManagerDidFailWithError
} from './Support/CLNotifications'
export {
  clAuthorizationStatus,
  clLocation,
  clLocationServicesEnabled,
  clRefreshAuthorizationStatus,
  clRequestWhenInUseAuthorization,
  clStartUpdatingLocation,
  clStopUpdatingLocation,
  clDistanceBetween
} from './Manager/CLLocationManager'
export {
  clHeading,
  clHeadingAuthorizationStatus,
  clHeadingAvailable,
  clHeadingRequiresAuthorization,
  clStartUpdatingHeading,
  clStopUpdatingHeading,
  clRequestHeadingAuthorization,
  clHeadingSectorName,
  clCoordinateText
} from './Manager/CLHeadingManager'
export {
  clFetchJSON,
  clGeocodeAddressString,
  clReverseGeocodeLocation
} from './Geocoder/CLGeocoder'
