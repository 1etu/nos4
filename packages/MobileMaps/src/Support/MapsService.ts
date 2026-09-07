import {
  clFetchJSON,
  clGeocodeAddressString,
  clSearchCompletions,
  type CLLocationCoordinate2D,
  type CLPlacemark
} from 'CoreLocation'
import {
  MapsTransport,
  type MapsRoute,
  type MapsRouteStep,
  type MapsTransportValue
} from './MapsTypes'

const RouteEndpoint = 'https://router.project-osrm.org/route/v1'
const RouteTimeoutMilliseconds = 10000
const MetresPerMile = 1609.344
const MetresPerKilometre = 1000
const FeetPerMetre = 3.280839895
const ShortDistanceFeet = 1000
const SecondsPerMinute = 60
const SecondsPerHour = 3600
const RouteOverviewPrecision = 6

interface Maneuver {
  readonly type?: string
  readonly modifier?: string
  readonly location?: readonly number[]
  readonly exit?: number
}

interface RouteStep {
  readonly distance?: number
  readonly duration?: number
  readonly name?: string
  readonly maneuver?: Maneuver
}

interface RouteLeg {
  readonly steps?: readonly RouteStep[]
}

interface RoutePath {
  readonly distance?: number
  readonly duration?: number
  readonly geometry?: { readonly coordinates?: readonly (readonly number[])[] }
  readonly legs?: readonly RouteLeg[]
}

interface RouteReply {
  readonly routes?: readonly RoutePath[]
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

const Turns: Readonly<Record<string, string>> = {
  left: 'Turn left',
  right: 'Turn right',
  'sharp left': 'Turn sharp left',
  'sharp right': 'Turn sharp right',
  'slight left': 'Bear left',
  'slight right': 'Bear right',
  straight: 'Continue straight',
  uturn: 'Make a U-turn'
}

const ordinal = (value: number): string => {
  const names = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
  return names[value - 1] ?? `${value}th`
}

const onto = (name: string): string => (name.length > 0 ? ` onto ${name}` : '')
const along = (name: string): string => (name.length > 0 ? ` on ${name}` : '')

const instructionFor = (step: RouteStep, first: boolean, last: boolean): string => {
  const name = (step.name ?? '').trim()
  const maneuver = step.maneuver
  const modifier = maneuver?.modifier ?? ''
  const turn = Turns[modifier] ?? 'Continue'
  if (last) return 'Arrive at your destination'
  switch (maneuver?.type) {
    case 'depart':
      return name.length > 0 ? `Head out on ${name}` : 'Start your route'
    case 'arrive':
      return 'Arrive at your destination'
    case 'roundabout':
    case 'rotary':
      return maneuver.exit
        ? `At the roundabout take the ${ordinal(maneuver.exit)} exit${onto(name)}`
        : `Enter the roundabout${onto(name)}`
    case 'merge':
      return `Merge${onto(name)}`
    case 'on ramp':
      return `Take the ramp${onto(name)}`
    case 'off ramp':
      return `Take the exit${onto(name)}`
    case 'fork':
      return `Keep ${modifier.length > 0 ? modifier : 'ahead'}${onto(name)}`
    case 'end of road':
      return `${turn}${onto(name)}`
    case 'continue':
      return first ? `Head out${along(name)}` : `Continue${along(name)}`
    default:
      return `${turn}${onto(name)}`
  }
}

const toStep = (
  step: RouteStep,
  index: number,
  total: number
): MapsRouteStep | undefined => {
  const location = step.maneuver?.location
  const longitude = location?.[0]
  const latitude = location?.[1]
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  const metres = step.distance ?? 0
  return {
    id: `step-${index}`,
    instruction: instructionFor(step, index === 0, index === total - 1),
    roadName: (step.name ?? '').trim(),
    distance: metres > 0 ? mapsFormatDistance(metres) : '',
    coordinate: { latitude: latitude as number, longitude: longitude as number }
  }
}

export const mapsSuggestPlaces = async (
  query: string,
  near?: CLLocationCoordinate2D
): Promise<readonly CLPlacemark[]> => {
  const completions = await clSearchCompletions(query, near)
  if (completions.length > 0) return completions
  return clGeocodeAddressString(query, near)
}

export const mapsSearchPlacemarks = mapsSuggestPlaces

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
    `${RouteEndpoint}/${profileFor(transport)}/${pair}?overview=full&geometries=geojson&steps=true`,
    RouteTimeoutMilliseconds
  )
  const leg = reply?.routes?.[0]
  if (!leg) return undefined
  const path = (leg.geometry?.coordinates ?? [])
    .map((pointPair) => ({ longitude: pointPair[0] ?? 0, latitude: pointPair[1] ?? 0 }))
    .filter((point) => point.latitude !== 0 || point.longitude !== 0)
  if (path.length === 0) return undefined
  const raw = leg.legs?.flatMap((entry) => entry.steps ?? []) ?? []
  const steps = raw
    .map((step, index) => toStep(step, index, raw.length))
    .filter((step): step is MapsRouteStep => step !== undefined)
  return {
    path,
    steps,
    distance: mapsFormatDistance(leg.distance ?? 0),
    duration: mapsFormatDuration(leg.duration ?? 0)
  }
}

export const mapsSpanForMetres = (metres: number): number =>
  Math.max(metres / MetresPerKilometre, 0.1)
