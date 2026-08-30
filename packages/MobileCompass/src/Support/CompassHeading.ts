import { createSignal, onCleanup, onMount, type Accessor } from 'solid-js'

const Dash = '–'
const Sectors = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
const SectorSpan = 45
const SectorOffset = 22.5
const FullTurn = 360
const GeolocationTimeout = 10000

const wrap = (value: number): number => ((value % FullTurn) + FullTurn) % FullTurn

const headingLabel = (degrees: number): string => {
  const whole = Math.round(wrap(degrees))
  const index = Math.floor((whole + SectorOffset) / SectorSpan)
  return `${whole}° ${Sectors[Math.min(Math.max(index, 0), Sectors.length - 1)]}`
}

const degreesMinutesSeconds = (value: number, latitude: boolean): string => {
  const hemisphere = latitude ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  const magnitude = Math.abs(value)
  const degrees = Math.trunc(magnitude)
  const remainder = (magnitude - degrees) * 60
  const minutes = Math.trunc(remainder)
  const seconds = Math.round((remainder - minutes) * 60)
  return `${degrees}°${minutes}'${seconds}" ${hemisphere}`
}

const readHeading = (event: DeviceOrientationEvent): number | undefined => {
  if ('webkitCompassHeading' in event && typeof event.webkitCompassHeading === 'number') {
    return event.webkitCompassHeading
  }
  if (event.absolute && event.alpha !== null) return FullTurn - event.alpha
  return undefined
}

export interface CompassReading {
  readonly heading: Accessor<number>
  readonly headingText: Accessor<string>
  readonly coordinateText: Accessor<string>
}

export const createCompassReading = (): CompassReading => {
  const [heading, setHeading] = createSignal(0)
  const [headingText, setHeadingText] = createSignal(Dash)
  const [coordinateText, setCoordinateText] = createSignal(Dash)

  onMount(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      const reading = readHeading(event)
      if (reading === undefined) return
      const bearing = wrap(reading)
      setHeading(bearing)
      setHeadingText(headingLabel(bearing))
    }
    window.addEventListener('deviceorientationabsolute', onOrientation)
    window.addEventListener('deviceorientation', onOrientation)
    onCleanup(() => {
      window.removeEventListener('deviceorientationabsolute', onOrientation)
      window.removeEventListener('deviceorientation', onOrientation)
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinateText(
          `${degreesMinutesSeconds(position.coords.latitude, true)}, ${degreesMinutesSeconds(position.coords.longitude, false)}`
        )
      },
      () => undefined,
      { timeout: GeolocationTimeout }
    )
  })

  return { heading, headingText, coordinateText }
}
