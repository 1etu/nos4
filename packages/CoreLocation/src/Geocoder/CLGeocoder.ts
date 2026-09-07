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

interface PhotonProperties {
  readonly name?: string
  readonly street?: string
  readonly housenumber?: string
  readonly district?: string
  readonly city?: string
  readonly county?: string
  readonly state?: string
  readonly country?: string
}

interface PhotonFeature {
  readonly geometry?: { readonly coordinates?: readonly number[] }
  readonly properties?: PhotonProperties
}

interface PhotonReply {
  readonly features?: readonly PhotonFeature[]
}

const fromCompletion = (feature: PhotonFeature): CLPlacemark | undefined => {
  const longitude = feature.geometry?.coordinates?.[0]
  const latitude = feature.geometry?.coordinates?.[1]
  const properties = feature.properties
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !properties) return undefined
  const street = [properties.street, properties.housenumber].filter(Boolean).join(' ')
  const name = properties.name ?? street
  if (!name || name.length === 0) return undefined
  return {
    name,
    thoroughfare: street,
    locality: properties.district ?? properties.city ?? properties.county ?? '',
    administrativeArea: properties.state ?? '',
    country: properties.country ?? '',
    coordinate: { latitude: latitude as number, longitude: longitude as number }
  }
}

export const clSearchCompletions = async (
  query: string,
  near?: CLLocationCoordinate2D
): Promise<readonly CLPlacemark[]> => {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []
  const parameters = new URLSearchParams({
    q: trimmed,
    limit: String(CLLocationMetrics.completionResultLimit),
    lang: 'en'
  })
  if (near) parameters.set('lat', String(near.latitude))
  if (near) parameters.set('lon', String(near.longitude))
  const reply = await clFetchJSON<PhotonReply>(
    `${CLLocationEndpoint.complete}?${parameters.toString()}`,
    CLLocationMetrics.geocodeTimeoutMilliseconds
  )
  const seen = new Set<string>()
  return (reply?.features ?? [])
    .map(fromCompletion)
    .filter((place): place is CLPlacemark => place !== undefined)
    .filter((place) => {
      const key = `${place.name}|${place.locality}|${place.coordinate.latitude.toFixed(4)}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
