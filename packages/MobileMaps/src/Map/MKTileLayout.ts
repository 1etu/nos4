import type { CLLocationCoordinate2D } from 'CoreLocation'
import { MapsMetrics } from '../Support/MapsMetrics'
import { mkProject } from './MKProjection'

export interface MKTile {
  readonly key: string
  readonly x: number
  readonly y: number
  readonly z: number
  readonly wrapped: number
}

export interface MKTileBox {
  readonly left: number
  readonly top: number
  readonly size: number
}

const cache = new Map<string, MKTile>()

const tileFor = (x: number, y: number, z: number): MKTile => {
  const key = `${z}/${x}/${y}`
  const held = cache.get(key)
  if (held) return held
  const span = Math.pow(2, z)
  const made: MKTile = { key, x, y, z, wrapped: ((x % span) + span) % span }
  cache.set(key, made)
  return made
}

export const mkTileLevel = (zoom: number): number =>
  Math.min(Math.max(Math.round(zoom), MapsMetrics.minimumZoom), MapsMetrics.maximumZoom)

export const mkTileScale = (zoom: number): number => Math.pow(2, zoom - mkTileLevel(zoom))

export const mkVisibleTiles = (
  centre: CLLocationCoordinate2D,
  zoom: number,
  width: number,
  height: number
): readonly MKTile[] => {
  const z = mkTileLevel(zoom)
  const factor = mkTileScale(zoom)
  const origin = mkProject(centre, z)
  const size = MapsMetrics.tileSize
  const halfWide = width / 2 / factor
  const halfTall = height / 2 / factor
  const pad = MapsMetrics.tilePadding
  const first = Math.floor((origin.x - halfWide) / size) - pad
  const last = Math.floor((origin.x + halfWide) / size) + pad
  const top = Math.floor((origin.y - halfTall) / size) - pad
  const bottom = Math.floor((origin.y + halfTall) / size) + pad
  const span = Math.pow(2, z)
  const tiles: MKTile[] = []
  for (let row = Math.max(top, 0); row <= Math.min(bottom, span - 1); row += 1) {
    for (let column = first; column <= last; column += 1) tiles.push(tileFor(column, row, z))
  }
  return tiles
}

export const mkPlaceTile = (
  tile: MKTile,
  centre: CLLocationCoordinate2D,
  zoom: number,
  width: number,
  height: number
): MKTileBox => {
  const factor = mkTileScale(zoom)
  const origin = mkProject(centre, mkTileLevel(zoom))
  const size = MapsMetrics.tileSize
  return {
    left: (tile.x * size - origin.x) * factor + width / 2,
    top: (tile.y * size - origin.y) * factor + height / 2,
    size: size * factor
  }
}
