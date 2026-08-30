import {
  clFetchJSON,
  clGeocodeAddressString,
  type CLLocationCoordinate2D,
  type CLPlacemark
} from 'CoreLocation'
import { MapsTransport, type MapsRoute, type MapsTransportValue } from './MapsTypes'

const RouteEndpoint = 'https://router.project-osrm.org/route/v1'
const RouteTimeoutMilliseconds = 10000
const MetresPerMile = 1609.344
const MetresPerKilometre = 1000
const FeetPerMetre = 3.280839895
const ShortDistanceFeet = 1000
const SecondsPerMinute = 60
const SecondsPerHour = 3600
const RouteOverviewPrecision = 6

interface RouteLeg {
  readonly distance?: number
  readonly duration?: number
  readonly geometry?: { readonly coordinates?: readonly (readonly number[])[] }
}

interface RouteReply {
  readonly routes?: readonly RouteLeg[]
}

const profileFor = (transport: MapsTransportValue): string => {
  if (transport === MapsTransport.walking) return 'walking'
  if (transport === MapsTransport.transit) return 'driving'
  return 'driving'
}

export const mapsFormatDistance = (metres: number): string => {
  const feet = metres * FeetPerMetre
  if (feet < ShortDistanceFeet) return `${Math.round(feet)} feet`
  const miles = metres / MetresPerMile
  if (miles < 10) return `${miles.toFixed(1)} miles`
  return `${Math.round(miles)} miles`
}

export const mapsFormatDuration = (seconds: number): string => {
  if (seconds < SecondsPerMinute) return '1 minute'
  const hours = Math.floor(seconds / SecondsPerHour)
  const minutes = Math.round((seconds - hours * SecondsPerHour) / SecondsPerMinute)
  const hourLabel = hours === 1 ? '1 hour' : `${hours} hours`
  const minuteLabel = minutes === 1 ? '1 minute' : `${minutes} minutes`
  if (hours === 0) return minuteLabel
  if (minutes === 0) return hourLabel
  return `${hourLabel} ${minuteLabel}`
}

export const mapsSearchPlacemarks = async (
  query: string,
  near?: CLLocationCoordinate2D
): Promise<readonly CLPlacemark[]> => clGeocodeAddressString(query, near)

export const mapsCalculateRoute = async (
  origin: CLLocationCoordinate2D,
  destination: CLLocationCoordinate2D,
  transport: MapsTransportValue
): Promise<MapsRoute | undefined> => {
  const pair = [
    `${origin.longitude.toFixed(RouteOverviewPrecision)},${origin.latitude.toFixed(RouteOverviewPrecision)}`,
    `${destination.longitude.toFixed(RouteOverviewPrecision)},${destination.latitude.toFixed(RouteOverviewPrecision)}`
  ].join(';')
  const reply = await clFetchJSON<RouteReply>(
    `${RouteEndpoint}/${profileFor(transport)}/${pair}?overview=full&geometries=geojson`,
    RouteTimeoutMilliseconds
  )
  const leg = reply?.routes?.[0]
  if (!leg) return undefined
  const path = (leg.geometry?.coordinates ?? [])
    .map((pointPair) => ({ longitude: pointPair[0] ?? 0, latitude: pointPair[1] ?? 0 }))
    .filter((point) => point.latitude !== 0 || point.longitude !== 0)
  if (path.length === 0) return undefined
  return {
    path,
    distance: mapsFormatDistance(leg.distance ?? 0),
    duration: mapsFormatDuration(leg.duration ?? 0)
  }
}

export const mapsSpanForMetres = (metres: number): number =>
  Math.max(metres / MetresPerKilometre, 0.1)
