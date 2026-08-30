import { defineNotification } from 'Foundation'
import type { CLAuthorizationStatusValue, CLErrorValue, CLLocation } from './CLTypes'

export const CoreLocationIdentifier = 'com.nos4.corelocation'

export const CLLocationManagerDidUpdateLocations = defineNotification<{
  location: CLLocation
}>('CLLocationManagerDidUpdateLocationsNotification')

export const CLLocationManagerDidChangeAuthorization = defineNotification<{
  status: CLAuthorizationStatusValue
}>('CLLocationManagerDidChangeAuthorizationNotification')

export const CLLocationManagerDidFailWithError = defineNotification<{
  code: CLErrorValue
}>('CLLocationManagerDidFailWithErrorNotification')
