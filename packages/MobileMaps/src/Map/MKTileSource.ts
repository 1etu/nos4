import { MapsType, type MapsTypeValue } from '../Support/MapsTypes'

export interface MKTileSource {
  readonly base: string
  readonly overlay?: string
  readonly attribution: string
}

const OpenStreetMap: MKTileSource = {
  base: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: 'Map data by OpenStreetMap contributors'
}

const Imagery: MKTileSource = {
  base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Imagery by Esri'
}

const ImageryWithLabels: MKTileSource = {
  base: Imagery.base,
  overlay:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  attribution: Imagery.attribution
}

export const mkTileSourceFor = (type: MapsTypeValue): MKTileSource => {
  if (type === MapsType.satellite) return Imagery
  if (type === MapsType.hybrid) return ImageryWithLabels
  return OpenStreetMap
}

export const mkTileURL = (template: string, x: number, y: number, z: number): string =>
  template.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
