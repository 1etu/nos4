import { Group, LatheGeometry, Mesh, ShapeGeometry, Vector2, type BufferGeometry } from 'three'
import {
  scnNormaliseUV,
  scnRoundedShape,
  scnShellGeometry,
  type SCNShellRing
} from '../Support/SCNGeometry'
import { SCNAdapterMetrics, SCNUSBPlugMetrics } from '../Support/SCNHardwareMetrics'
import type { SCNMaterials } from '../Support/SCNMaterials'
import { scnMakeUSBPlug } from './SCNUSBPlug'

const Metrics = SCNAdapterMetrics
const TipSamples = 6

const grooveRings = (): SCNShellRing[] => {
  const rings: SCNShellRing[] = []
  for (let i = 0; i <= Metrics.seamSteps * 2; i += 1) {
    const t = i / (Metrics.seamSteps * 2)
    rings.push({
      depth: Metrics.seamOffset + (t - 0.5) * Metrics.seamWidth,
      inset: Metrics.seamDepth * Math.sin(t * Math.PI)
    })
  }
  return rings
}

const cubeShell = (): BufferGeometry => {
  const geometry = scnShellGeometry(
    Metrics.cubeWidth,
    Metrics.cubeDepth,
    Metrics.cubeCorner,
    Metrics.cubeSegments,
    [
      { depth: 0, inset: 0 },
      ...grooveRings(),
      { depth: Metrics.cubeHeight, inset: 0 }
    ]
  )
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, -Metrics.cubeHeight / 2, 0)
  return geometry
}

const portFace = (): BufferGeometry => {
  const shape = scnRoundedShape(Metrics.cubeWidth, Metrics.cubeDepth, Metrics.cubeCorner)
  shape.holes.push(
    scnRoundedShape(Metrics.portWidth, Metrics.portHeight, Metrics.portCorner)
  )
  const geometry = new ShapeGeometry(shape, Metrics.cubeSegments)
  scnNormaliseUV(geometry, Metrics.cubeWidth, Metrics.cubeDepth)
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, -Metrics.cubeHeight / 2, 0)
  return geometry
}

const backFace = (): BufferGeometry => {
  const shape = scnRoundedShape(Metrics.cubeWidth, Metrics.cubeDepth, Metrics.cubeCorner)
  const geometry = new ShapeGeometry(shape, Metrics.cubeSegments)
  scnNormaliseUV(geometry, Metrics.cubeWidth, Metrics.cubeDepth)
  geometry.rotateX(-Math.PI / 2)
  geometry.translate(0, Metrics.cubeHeight / 2, 0)
  return geometry
}

const portCavity = (): BufferGeometry => {
  const geometry = scnShellGeometry(
    Metrics.portWidth,
    Metrics.portHeight,
    Metrics.portCorner,
    Metrics.portSegments,
    [
      { depth: 0, inset: 0 },
      { depth: Metrics.portDepth, inset: 0 }
    ]
  )
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, -Metrics.cubeHeight / 2, 0)
  return geometry
}

const pinProfile = (): Vector2[] => {
  const points = [new Vector2(0, 0), new Vector2(Metrics.pinRadius, 0)]
  for (let i = 0; i <= TipSamples; i += 1) {
    const angle = (i / TipSamples) * (Math.PI / 2)
    points.push(
      new Vector2(
        Metrics.pinRadius - Metrics.pinChamfer + Math.cos(angle) * Metrics.pinChamfer,
        Metrics.pinLength - Metrics.pinChamfer + Math.sin(angle) * Metrics.pinChamfer
      )
    )
  }
  points.push(new Vector2(0, Metrics.pinLength))
  return points
}

export const scnMakePowerAdapter = (materials: SCNMaterials): Group => {
  const group = new Group()

  for (const geometry of [cubeShell(), portFace(), backFace()]) {
    const shell = new Mesh(geometry, materials.housing)
    shell.castShadow = true
    shell.receiveShadow = true
    group.add(shell)
  }
  group.add(new Mesh(portCavity(), materials.cavity))

  const profile = pinProfile()
  for (const side of [-1, 1]) {
    const pin = new Mesh(new LatheGeometry(profile, Metrics.pinSegments), materials.nickel)
    pin.rotation.x = -Math.PI / 2
    pin.position.set((side * Metrics.pinGap) / 2, 0, -Metrics.cubeDepth / 2)
    pin.castShadow = true
    group.add(pin)
  }

  const plug = scnMakeUSBPlug(materials)
  plug.position.y = -Metrics.cubeHeight / 2
  group.add(plug)

  return group
}

export const SCNPowerAdapterMetrics = {
  cubeWidth: Metrics.cubeWidth,
  cubeHeight: Metrics.cubeHeight,
  cubeDepth: Metrics.cubeDepth,
  seatClearance: Metrics.seatClearance,
  cordExit:
    Metrics.cubeHeight / 2 -
    SCNUSBPlugMetrics.overmoldSeat +
    SCNUSBPlugMetrics.overmoldLength +
    SCNUSBPlugMetrics.reliefLength
} as const
