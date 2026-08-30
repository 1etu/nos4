import { For, Show, createEffect, createMemo, createSignal, on, onCleanup } from 'solid-js'
import type { CLLocation, CLLocationCoordinate2D } from 'CoreLocation'
import { MapsMetrics, MapsPalette } from '../Support/MapsMetrics'
import type { MapsAnnotation, MapsRoute, MapsTypeValue } from '../Support/MapsTypes'
import { MKAnnotationPin } from './MKAnnotationPin'
import { MKUserLocationDot } from './MKUserLocationDot'
import { mkProject, mkUnproject, type MKPoint } from './MKProjection'
import { mkPlaceTile, mkTileLevel, mkTileScale, mkVisibleTiles, type MKTile } from './MKTileLayout'
import { mkTileSourceFor, mkTileURL } from './MKTileSource'

export interface MKMapRegion {
  readonly centre: CLLocationCoordinate2D
  readonly zoom: number
}

export const MKMapView = (props: {
  width: number
  height: number
  type: MapsTypeValue
  region: MKMapRegion
  annotations: readonly MapsAnnotation[]
  route: MapsRoute | undefined
  userLocation: CLLocation | undefined
  selected: string | undefined
  onRegionChange: (region: MKMapRegion) => void
  onSelect: (id: string | undefined) => void
}) => {
  const [centre, setCentre] = createSignal<CLLocationCoordinate2D>(props.region.centre)
  const [zoom, setZoom] = createSignal(props.region.zoom)

  let surface!: HTMLDivElement
  let frame = 0
  let lastTap = 0
  const pointers = new Map<number, MKPoint>()
  let pinchDistance = 0
  let pinchZoom = 0
  let velocityX = 0
  let velocityY = 0
  let lastMove = 0

  const level = createMemo(() => mkTileLevel(zoom()))
  const scale = createMemo(() => mkTileScale(zoom()))
  const anchor = createMemo(() => mkProject(centre(), level()))

  const screenFor = (coordinate: CLLocationCoordinate2D): MKPoint => {
    const point = mkProject(coordinate, level())
    const origin = anchor()
    return {
      x: (point.x - origin.x) * scale() + props.width / 2,
      y: (point.y - origin.y) * scale() + props.height / 2
    }
  }

  const tiles = createMemo<readonly MKTile[]>(() =>
    mkVisibleTiles(centre(), zoom(), props.width, props.height)
  )

  const tileStyle = (tile: MKTile) => {
    const box = mkPlaceTile(tile, centre(), zoom(), props.width, props.height)
    return {
      position: 'absolute' as const,
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.size + 1}px`,
      height: `${box.size + 1}px`
    }
  }

  const publish = () => props.onRegionChange({ centre: centre(), zoom: zoom() })

  createEffect(
    on(
      () => props.region,
      (region) => {
        setCentre(region.centre)
        setZoom(region.zoom)
      },
      { defer: true }
    )
  )

  const panBy = (dx: number, dy: number) => {
    const factor = scale()
    const origin = mkProject(centre(), level())
    setCentre(
      mkUnproject({ x: origin.x - dx / factor, y: origin.y - dy / factor }, level())
    )
  }

  const stopFling = () => {
    if (frame === 0) return
    cancelAnimationFrame(frame)
    frame = 0
  }

  const fling = () => {
    frame = 0
    velocityX *= MapsMetrics.flingFriction
    velocityY *= MapsMetrics.flingFriction
    panBy(velocityX, velocityY)
    if (Math.hypot(velocityX, velocityY) < MapsMetrics.flingCutoff) {
      publish()
      return
    }
    frame = requestAnimationFrame(fling)
  }

  const zoomAbout = (delta: number, focus: MKPoint) => {
    const before = mkUnproject(
      {
        x: anchor().x + (focus.x - props.width / 2) / scale(),
        y: anchor().y + (focus.y - props.height / 2) / scale()
      },
      level()
    )
    const next = Math.min(
      Math.max(zoom() + delta, MapsMetrics.minimumZoom),
      MapsMetrics.maximumZoom
    )
    setZoom(next)
    const after = screenFor(before)
    panBy(focus.x - after.x, focus.y - after.y)
  }

  const localPoint = (event: PointerEvent): MKPoint => {
    const box = surface.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }

  const onPointerDown = (event: PointerEvent) => {
    stopFling()
    surface.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, localPoint(event))
    velocityX = 0
    velocityY = 0
    lastMove = performance.now()
    if (pointers.size !== 2) return
    const points = [...pointers.values()]
    const a = points[0]
    const b = points[1]
    if (!a || !b) return
    pinchDistance = Math.hypot(b.x - a.x, b.y - a.y)
    pinchZoom = zoom()
  }

  const onPointerMove = (event: PointerEvent) => {
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const point = localPoint(event)
    pointers.set(event.pointerId, point)
    if (pointers.size >= 2) {
      const points = [...pointers.values()]
      const a = points[0]
      const b = points[1]
      if (!a || !b || pinchDistance === 0) return
      const spread = Math.hypot(b.x - a.x, b.y - a.y)
      setZoom(
        Math.min(
          Math.max(pinchZoom + Math.log2(spread / pinchDistance), MapsMetrics.minimumZoom),
          MapsMetrics.maximumZoom
        )
      )
      return
    }
    const dx = point.x - previous.x
    const dy = point.y - previous.y
    const now = performance.now()
    const gap = Math.max(now - lastMove, 1)
    lastMove = now
    velocityX = (dx / gap) * 16
    velocityY = (dy / gap) * 16
    panBy(dx, dy)
  }

  const onPointerUp = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    pointers.delete(event.pointerId)
    if (pointers.size > 0) return
    if (Math.hypot(velocityX, velocityY) >= MapsMetrics.flingCutoff) {
      frame = requestAnimationFrame(fling)
      return
    }
    publish()
  }

  const onSurfaceClick = (event: MouseEvent) => {
    const now = performance.now()
    const box = surface.getBoundingClientRect()
    const focus = { x: event.clientX - box.left, y: event.clientY - box.top }
    if (now - lastTap < MapsMetrics.doubleTapMilliseconds) {
      lastTap = 0
      zoomAbout(1, focus)
      publish()
      return
    }
    lastTap = now
    props.onSelect(undefined)
  }

  const routePath = createMemo(() => {
    const route = props.route
    if (!route) return ''
    return route.path
      .map((point, index) => {
        const screen = screenFor(point)
        return `${index === 0 ? 'M' : 'L'}${screen.x.toFixed(1)} ${screen.y.toFixed(1)}`
      })
      .join(' ')
  })

  const source = createMemo(() => mkTileSourceFor(props.type))

  onCleanup(stopFling)

  return (
    <div
      ref={surface}
      class="relative overflow-hidden"
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        background: MapsPalette.mapCanvas,
        'touch-action': 'none'
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onSurfaceClick}
    >
      <For each={tiles()}>
        {(tile) => (
          <>
            <img
              src={mkTileURL(source().base, tile.wrapped, tile.y, tile.z)}
              alt=""
              crossorigin="anonymous"
              draggable={false}
              style={tileStyle(tile)}
            />
            <Show when={source().overlay}>
              {(overlay) => (
                <img
                  src={mkTileURL(overlay(), tile.wrapped, tile.y, tile.z)}
                  alt=""
                  crossorigin="anonymous"
                  draggable={false}
                  style={tileStyle(tile)}
                />
              )}
            </Show>
          </>
        )}
      </For>

      <Show when={props.route}>
        <svg
          class="pointer-events-none absolute left-0 top-0"
          width={props.width}
          height={props.height}
        >
          <path
            d={routePath()}
            fill="none"
            stroke={MapsPalette.routeStroke}
            stroke-opacity={MapsMetrics.routeStrokeOpacity}
            stroke-width={MapsMetrics.routeStrokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Show>

      <Show when={props.userLocation}>
        {(fix) => <MKUserLocationDot at={screenFor(fix().coordinate)} />}
      </Show>

      <For each={props.annotations}>
        {(annotation) => (
          <MKAnnotationPin
            annotation={annotation}
            at={screenFor(annotation.coordinate)}
            selected={props.selected === annotation.id}
            onSelect={() => props.onSelect(annotation.id)}
          />
        )}
      </For>

      <div
        class="pointer-events-none absolute right-1 bottom-0.5"
        style={{
          'font-size': `${MapsMetrics.attributionFontSize}px`,
          color: 'rgba(0,0,0,0.55)',
          'text-shadow': '0 1px 0 rgba(255,255,255,0.7)'
        }}
      >
        {source().attribution}
      </div>
    </div>
  )
}
