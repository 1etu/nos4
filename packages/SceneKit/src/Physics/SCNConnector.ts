import { SCNConnectorMetrics } from './SCNPhysicsMetrics'

export type SCNConnectorPhase = 'free' | 'guided' | 'seating' | 'seated' | 'extracting'

export interface SCNConnectorVector {
  readonly x: number
  readonly y: number
}

export interface SCNConnectorSample {
  readonly tip: SCNConnectorVector
  readonly direction: SCNConnectorVector
  readonly target: SCNConnectorVector
  readonly insertionAxis: SCNConnectorVector
  readonly pixelsPerMillimetre: number
}

export interface SCNConnectorAlignment {
  readonly distanceMillimetres: number
  readonly lateralMillimetres: number
  readonly axialMillimetres: number
  readonly angleDegrees: number
  readonly guided: boolean
  readonly seatable: boolean
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

const normalise = (vector: SCNConnectorVector): SCNConnectorVector => {
  const length = Math.max(Math.hypot(vector.x, vector.y), Number.EPSILON)
  return { x: vector.x / length, y: vector.y / length }
}

export const scnMeasureConnector = (sample: SCNConnectorSample): SCNConnectorAlignment => {
  const axis = normalise(sample.insertionAxis)
  const direction = normalise(sample.direction)
  const dx = sample.tip.x - sample.target.x
  const dy = sample.tip.y - sample.target.y
  const axialPixels = dx * axis.x + dy * axis.y
  const lateralPixels = Math.abs(dx * -axis.y + dy * axis.x)
  const dot = clamp(direction.x * axis.x + direction.y * axis.y, -1, 1)
  const angleDegrees = (Math.acos(dot) * 180) / Math.PI
  const distanceMillimetres = Math.hypot(dx, dy) / sample.pixelsPerMillimetre
  const lateralMillimetres = lateralPixels / sample.pixelsPerMillimetre
  const axialMillimetres = axialPixels / sample.pixelsPerMillimetre
  return {
    distanceMillimetres,
    lateralMillimetres,
    axialMillimetres,
    angleDegrees,
    guided:
      distanceMillimetres <= SCNConnectorMetrics.guideRadiusMillimetres &&
      angleDegrees <= SCNConnectorMetrics.guideAngleDegrees,
    seatable:
      lateralMillimetres <= SCNConnectorMetrics.seatRadiusMillimetres &&
      Math.abs(axialMillimetres) <= SCNConnectorMetrics.seatRadiusMillimetres &&
      angleDegrees <= SCNConnectorMetrics.seatAngleDegrees
  }
}

export const scnSeatingProgress = (elapsedSeconds: number): number => {
  const t = clamp(elapsedSeconds / SCNConnectorMetrics.seatingSeconds, 0, 1)
  return t * t * (3 - 2 * t)
}
