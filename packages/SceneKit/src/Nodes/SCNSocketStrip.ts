import { Group, Mesh, Path, ShapeGeometry, type BufferGeometry } from 'three'
import {
  scnCrownRings,
  scnNormaliseUV,
  scnRoundedShape,
  scnShellGeometry,
  scnTuckRings,
  type SCNShellRing
} from '../Support/SCNGeometry'
import { SCNSocketMetrics } from '../Support/SCNHardwareMetrics'
import type { SCNMaterials } from '../Support/SCNMaterials'
import { scnMakeSocketOutlet } from './SCNSocketOutlet'

const Metrics = SCNSocketMetrics
const MouthRadius = Metrics.wellRadius + Metrics.chamferWidth
const FaceWidth = Metrics.bodyWidth - Metrics.crownInset * 2
const FaceLength = Metrics.bodyLength - Metrics.crownInset * 2
const BaseWidth = Metrics.bodyWidth - Metrics.baseTuck * 2
const BaseLength = Metrics.bodyLength - Metrics.baseTuck * 2

const outletY = (index: number): number =>
  Metrics.bodyLength / 2 - Metrics.firstOutletOffset - index * Metrics.outletPitch

const shell = (rings: readonly SCNShellRing[]): BufferGeometry =>
  scnShellGeometry(
    Metrics.bodyWidth,
    Metrics.bodyLength,
    Metrics.bodyCorner,
    Metrics.cornerSegments,
    rings
  )

const upperShell = (): BufferGeometry =>
  shell([
    ...scnCrownRings(Metrics.crownDepth, Metrics.crownInset, Metrics.upperInset, Metrics.crownSteps),
    { depth: Metrics.seamHeight, inset: Metrics.upperInset }
  ])

const lowerShell = (): BufferGeometry =>
  shell([
    { depth: Metrics.seamHeight + Metrics.seamGap, inset: 0 },
    { depth: Metrics.bodyHeight - Metrics.baseDepth, inset: 0 },
    ...scnTuckRings(
      Metrics.bodyHeight - Metrics.baseDepth,
      Metrics.baseDepth,
      Metrics.baseTuck,
      Metrics.baseSteps
    )
  ])

const faceCap = (): BufferGeometry => {
  const shape = scnRoundedShape(FaceWidth, FaceLength, Metrics.bodyCorner - Metrics.crownInset)
  for (let index = 0; index < Metrics.outletCount; index += 1) {
    const mouth = new Path()
    mouth.absarc(0, outletY(index), MouthRadius, 0, Math.PI * 2, true)
    shape.holes.push(mouth)
  }
  const geometry = new ShapeGeometry(shape, Metrics.wellSegments)
  scnNormaliseUV(geometry, FaceWidth, FaceLength)
  return geometry
}

const baseCap = (): BufferGeometry => {
  const shape = scnRoundedShape(BaseWidth, BaseLength, Metrics.bodyCorner - Metrics.baseTuck)
  const geometry = new ShapeGeometry(shape, Metrics.cornerSegments)
  scnNormaliseUV(geometry, BaseWidth, BaseLength)
  geometry.rotateY(Math.PI)
  geometry.translate(0, 0, -Metrics.bodyHeight)
  return geometry
}

export const scnMakeSocketStrip = (materials: SCNMaterials): Group => {
  const group = new Group()

  for (const geometry of [upperShell(), lowerShell(), faceCap(), baseCap()]) {
    const mesh = new Mesh(geometry, materials.socket)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  }

  for (let index = 0; index < Metrics.outletCount; index += 1) {
    const outlet = scnMakeSocketOutlet(materials)
    outlet.position.y = outletY(index)
    group.add(outlet)
  }

  return group
}

export const SCNSocketStripMetrics = {
  bodyWidth: Metrics.bodyWidth,
  bodyLength: Metrics.bodyLength,
  bodyHeight: Metrics.bodyHeight,
  outletPitch: Metrics.outletPitch,
  outletCount: Metrics.outletCount,
  topOutletY: outletY(0),
  wellDepth: Metrics.wellDepth
} as const
