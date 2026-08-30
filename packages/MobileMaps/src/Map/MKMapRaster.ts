import { assetURL } from 'CoreGraphics'
import type { CLLocationCoordinate2D } from 'CoreLocation'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import { MapsPinTone, type MapsAnnotation, type MapsRoute } from '../Support/MapsTypes'
import { mkProject } from './MKProjection'
import { mkPlaceTile, mkTileLevel, mkTileScale, mkVisibleTiles } from './MKTileLayout'
import { mkTileSourceFor, mkTileURL } from './MKTileSource'
import type { MapsTypeValue } from '../Support/MapsTypes'

export interface MKRasterRequest {
  readonly width: number
  readonly height: number
  readonly centre: CLLocationCoordinate2D
  readonly zoom: number
  readonly type: MapsTypeValue
  readonly annotations: readonly MapsAnnotation[]
  readonly route: MapsRoute | undefined
}

const loadImage = (src: string): Promise<HTMLImageElement | undefined> =>
  new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(undefined)
    image.src = src
  })

const drawLayer = async (
  context: CanvasRenderingContext2D,
  template: string,
  request: MKRasterRequest
): Promise<void> => {
  const tiles = mkVisibleTiles(request.centre, request.zoom, request.width, request.height)
  const images = await Promise.all(
    tiles.map((tile) => loadImage(mkTileURL(template, tile.wrapped, tile.y, tile.z)))
  )
  tiles.forEach((tile, index) => {
    const image = images[index]
    if (!image) return
    const box = mkPlaceTile(tile, request.centre, request.zoom, request.width, request.height)
    context.drawImage(image, box.left, box.top, box.size + 1, box.size + 1)
  })
}

const screenFor = (
  coordinate: CLLocationCoordinate2D,
  request: MKRasterRequest
): { x: number; y: number } => {
  const level = mkTileLevel(request.zoom)
  const factor = mkTileScale(request.zoom)
  const origin = mkProject(request.centre, level)
  const point = mkProject(coordinate, level)
  return {
    x: (point.x - origin.x) * factor + request.width / 2,
    y: (point.y - origin.y) * factor + request.height / 2
  }
}

const drawRoute = (context: CanvasRenderingContext2D, request: MKRasterRequest): void => {
  const route = request.route
  if (!route) return
  context.save()
  context.strokeStyle = MapsPalette.routeStroke
  context.globalAlpha = MapsMetrics.routeStrokeOpacity
  context.lineWidth = MapsMetrics.routeStrokeWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  route.path.forEach((point, index) => {
    const screen = screenFor(point, request)
    if (index === 0) context.moveTo(screen.x, screen.y)
    else context.lineTo(screen.x, screen.y)
  })
  context.stroke()
  context.restore()
}

const drawPins = async (
  context: CanvasRenderingContext2D,
  request: MKRasterRequest
): Promise<void> => {
  const pins = await Promise.all(
    request.annotations.map((annotation) =>
      loadImage(assetURL(annotation.tone === MapsPinTone.origin ? 'PinGreen' : 'Pin'))
    )
  )
  request.annotations.forEach((annotation, index) => {
    const image = pins[index]
    if (!image) return
    const screen = screenFor(annotation.coordinate, request)
    context.drawImage(
      image,
      screen.x + MapsMetrics.pinAnchorX - MapsMetrics.pinWidth / 2,
      screen.y - MapsMetrics.pinAnchorY - MapsMetrics.pinHeight / 2,
      MapsMetrics.pinWidth,
      MapsMetrics.pinHeight
    )
  })
}

export const mkRasteriseMap = async (
  request: MKRasterRequest
): Promise<HTMLCanvasElement | undefined> => {
  const canvas = document.createElement('canvas')
  const ratio = Math.min(window.devicePixelRatio, 2)
  canvas.width = Math.round(request.width * ratio)
  canvas.height = Math.round(request.height * ratio)
  const context = canvas.getContext('2d')
  if (!context) return undefined
  context.scale(ratio, ratio)
  context.fillStyle = MapsPalette.mapCanvas
  context.fillRect(0, 0, request.width, request.height)

  const source = mkTileSourceFor(request.type)
  await drawLayer(context, source.base, request)
  if (source.overlay) await drawLayer(context, source.overlay, request)
  drawRoute(context, request)
  await drawPins(context, request)
  return canvas
}
