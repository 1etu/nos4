import { CLLocationEndpoint, CLLocationMetrics } from '../Support/CLMetrics'
import type { CLLocationCoordinate2D, CLPlacemark } from '../Support/CLTypes'

interface NominatimAddress {
  readonly road?: string
  readonly pedestrian?: string
  readonly city?: string
  readonly town?: string
  readonly village?: string
  readonly suburb?: string
  readonly state?: string
  readonly country?: string
}

interface NominatimPlace {
  readonly lat?: string
  readonly lon?: string
  readonly name?: string
  readonly display_name?: string
  readonly address?: NominatimAddress
}

export const clFetchJSON = async <T>(url: string, timeout: number): Promise<T | undefined> => {
  const controller = new AbortController()
  const bell = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return undefined
    return (await response.json()) as T
  } catch {
    return undefined
  } finally {
    clearTimeout(bell)
  }
}

const locality = (address: NominatimAddress | undefined): string =>
  address?.city ?? address?.town ?? address?.village ?? address?.suburb ?? ''

const leadingSegment = (label: string): string => label.split(',')[0] ?? label

const toPlacemark = (place: NominatimPlace): CLPlacemark | undefined => {
  const latitude = Number(place.lat)
  const longitude = Number(place.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined
  const display = place.display_name ?? ''
  return {
    name: place.name && place.name.length > 0 ? place.name : leadingSegment(display),
    thoroughfare: place.address?.road ?? place.address?.pedestrian ?? '',
    locality: locality(place.address),
    administrativeArea: place.address?.state ?? '',
    country: place.address?.country ?? '',
    coordinate: { latitude, longitude }
  }
}

export const clGeocodeAddressString = async (
  query: string,
  near?: CLLocationCoordinate2D
): Promise<readonly CLPlacemark[]> => {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []
  const parameters = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(CLLocationMetrics.geocodeResultLimit),
    q: trimmed
  })
  if (near) parameters.set('lat', String(near.latitude))
  if (near) parameters.set('lon', String(near.longitude))
  const places = await clFetchJSON<readonly NominatimPlace[]>(
    `${CLLocationEndpoint.forward}?${parameters.toString()}`,
    CLLocationMetrics.geocodeTimeoutMilliseconds
  )
  if (!places) return []
  return places
    .map(toPlacemark)
    .filter((placemark): placemark is CLPlacemark => placemark !== undefined)
}

export const clReverseGeocodeLocation = async (
  coordinate: CLLocationCoordinate2D
): Promise<CLPlacemark | undefined> => {
  const parameters = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    lat: String(coordinate.latitude),
    lon: String(coordinate.longitude)
  })
  const place = await clFetchJSON<NominatimPlace>(
    `${CLLocationEndpoint.reverse}?${parameters.toString()}`,
    CLLocationMetrics.geocodeTimeoutMilliseconds
  )
  if (!place) return undefined
  return toPlacemark(place)
}
