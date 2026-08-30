import type { CLLocationCoordinate2D } from 'CoreLocation'
import { MapsMetrics } from '../Support/MapsMetrics'

export interface MKPoint {
  readonly x: number
  readonly y: number
}

const LatitudeLimit = 85.05112878
const DegreesPerTurn = 360
const HalfTurn = 180

export const mkWorldSize = (zoom: number): number =>
  MapsMetrics.tileSize * Math.pow(2, zoom)

export const mkClampLatitude = (latitude: number): number =>
  Math.min(Math.max(latitude, -LatitudeLimit), LatitudeLimit)

export const mkProject = (coordinate: CLLocationCoordinate2D, zoom: number): MKPoint => {
  const size = mkWorldSize(zoom)
  const latitude = (mkClampLatitude(coordinate.latitude) * Math.PI) / HalfTurn
  const sine = Math.sin(latitude)
  return {
    x: ((coordinate.longitude + HalfTurn) / DegreesPerTurn) * size,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size
  }
}

export const mkUnproject = (point: MKPoint, zoom: number): CLLocationCoordinate2D => {
  const size = mkWorldSize(zoom)
  const longitude = (point.x / size) * DegreesPerTurn - HalfTurn
  const exponent = Math.exp((0.5 - point.y / size) * 4 * Math.PI)
  const latitude = (Math.asin((exponent - 1) / (exponent + 1)) * HalfTurn) / Math.PI
  return { latitude, longitude }
}

export const mkZoomForSpan = (spanDegrees: number, widthPixels: number): number => {
  const tiles = widthPixels / MapsMetrics.tileSize
  const zoom = Math.log2((DegreesPerTurn * tiles) / Math.max(spanDegrees, 0.0001))
  return Math.min(Math.max(zoom, MapsMetrics.minimumZoom), MapsMetrics.maximumZoom)
}

export const mkZoomForBounds = (
  path: readonly CLLocationCoordinate2D[],
  width: number,
  height: number
): { centre: CLLocationCoordinate2D; zoom: number } | undefined => {
  const first = path[0]
  if (!first) return undefined
  let north = first.latitude
  let south = first.latitude
  let east = first.longitude
  let west = first.longitude
  for (const point of path) {
    north = Math.max(north, point.latitude)
    south = Math.min(south, point.latitude)
    east = Math.max(east, point.longitude)
    west = Math.min(west, point.longitude)
  }
  const centre = { latitude: (north + south) / 2, longitude: (east + west) / 2 }
  const spanX = Math.max(east - west, 0.0005)
  const spanY = Math.max(north - south, 0.0005)
  const zoom = Math.min(
    mkZoomForSpan(spanX, width),
    mkZoomForSpan(spanY * (width / Math.max(height, 1)), width)
  )
  return { centre, zoom: Math.min(zoom, MapsMetrics.maximumZoom) }
}
