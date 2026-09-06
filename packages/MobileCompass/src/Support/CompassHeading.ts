import { createMemo, createSignal, onCleanup, onMount, type Accessor } from 'solid-js'
import {
  CLAuthorizationStatus,
  clCoordinateText,
  clHeading,
  clHeadingAuthorizationStatus,
  clHeadingAvailable,
  clHeadingRequiresAuthorization,
  clHeadingSectorName,
  clLocation,
  clRequestHeadingAuthorization,
  clRequestWhenInUseAuthorization,
  clStartUpdatingHeading,
  clStartUpdatingLocation,
  clStopUpdatingHeading,
  clStopUpdatingLocation
} from 'CoreLocation'
import { CompassMetrics } from './CompassMetrics'

const Dash = '–'

export const CompassHeadingState = {
  needsPermission: 'needsPermission',
  denied: 'denied',
  unavailable: 'unavailable',
  waiting: 'waiting',
  reading: 'reading'
} as const

export type CompassHeadingStateValue =
  (typeof CompassHeadingState)[keyof typeof CompassHeadingState]

export interface CompassReading {
  readonly heading: Accessor<number>
  readonly headingText: Accessor<string>
  readonly coordinateText: Accessor<string>
  readonly state: Accessor<CompassHeadingStateValue>
  readonly requestAccess: () => void
}

export const createCompassReading = (): CompassReading => {
  const [settled, setSettled] = createSignal(false)

  const heading = () => clHeading()?.trueHeading ?? 0

  const state = createMemo<CompassHeadingStateValue>(() => {
    if (clHeading() !== undefined) return CompassHeadingState.reading
    if (!clHeadingAvailable()) return CompassHeadingState.unavailable
    if (clHeadingAuthorizationStatus() === CLAuthorizationStatus.denied) {
      return CompassHeadingState.denied
    }
    if (!settled()) return CompassHeadingState.waiting
    return clHeadingRequiresAuthorization()
      ? CompassHeadingState.needsPermission
      : CompassHeadingState.unavailable
  })

  const headingText = () => {
    if (clHeading() === undefined) return Dash
    const degrees = Math.round(heading())
    return `${degrees}° ${clHeadingSectorName(degrees)}`
  }

  const coordinateText = () => {
    const fix = clLocation()
    if (!fix) return Dash
    return `${clCoordinateText(fix.coordinate.latitude, true)}, ${clCoordinateText(fix.coordinate.longitude, false)}`
  }

  onMount(() => {
    clStartUpdatingHeading()
    clStartUpdatingLocation()
    const grace = setTimeout(() => setSettled(true), CompassMetrics.headingGraceMilliseconds)
    onCleanup(() => {
      clearTimeout(grace)
      clStopUpdatingHeading()
      clStopUpdatingLocation()
    })
  })

  return {
    heading,
    headingText,
    coordinateText,
    state,
    requestAccess: () => {
      void clRequestHeadingAuthorization()
      clRequestWhenInUseAuthorization()
      clStartUpdatingLocation()
    }
  }
}
