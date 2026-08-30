import {
  CatmullRomCurve3,
  CircleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  Path,
  Shape,
  ShapeGeometry,
  Vector3
} from 'three'
import { scnNormaliseUV, scnRoundedShape } from '../Support/SCNGeometry'
import { SCNSocketMetrics } from '../Support/SCNHardwareMetrics'
import type { SCNMaterials } from '../Support/SCNMaterials'

const Metrics = SCNSocketMetrics
const ArcSamples = 12
const WellSpan = Metrics.wellDepth - Metrics.chamferDepth

const chamfer = (materials: SCNMaterials): Mesh => {
  const mesh = new Mesh(
    new CylinderGeometry(
      Metrics.wellRadius + Metrics.chamferWidth,
      Metrics.wellRadius,
      Metrics.chamferDepth,
      Metrics.wellSegments,
      1,
      true
    ),
    materials.socket
  )
  mesh.rotation.x = Math.PI / 2
  mesh.position.z = -Metrics.chamferDepth / 2
  return mesh
}

const wall = (materials: SCNMaterials): Mesh => {
  const mesh = new Mesh(
    new CylinderGeometry(
      Metrics.wellRadius,
      Metrics.wellRadius,
      WellSpan,
      Metrics.wellSegments,
      1,
      true
    ),
    materials.socketWell
  )
  mesh.rotation.x = Math.PI / 2
  mesh.position.z = -Metrics.chamferDepth - WellSpan / 2
  return mesh
}

const floor = (materials: SCNMaterials): Mesh => {
  const disc = new Shape()
  disc.absarc(0, 0, Metrics.wellRadius, 0, Math.PI * 2, false)
  for (const side of [-1, 1]) {
    const bore = new Path()
    bore.absarc(
      (side * Metrics.pinHoleGap) / 2,
      0,
      Metrics.pinHoleRadius,
      0,
      Math.PI * 2,
      true
    )
    disc.holes.push(bore)
  }
  const geometry = new ShapeGeometry(disc, Metrics.wellSegments)
  scnNormaliseUV(geometry, Metrics.wellRadius * 2, Metrics.wellRadius * 2)
  const mesh = new Mesh(geometry, materials.socketFloor)
  mesh.position.z = -Metrics.wellDepth
  mesh.receiveShadow = true
  return mesh
}

const pinHole = (materials: SCNMaterials, side: number): Group => {
  const group = new Group()
  group.position.set((side * Metrics.pinHoleGap) / 2, 0, -Metrics.wellDepth)

  const bore = new Mesh(
    new CylinderGeometry(
      Metrics.pinHoleRadius,
      Metrics.pinHoleRadius,
      Metrics.pinHoleDepth,
      Metrics.pinHoleSegments,
      1,
      true
    ),
    materials.cavity
  )
  bore.rotation.x = Math.PI / 2
  bore.position.z = -Metrics.pinHoleDepth / 2
  group.add(bore)

  const base = new Mesh(
    new CircleGeometry(Metrics.pinHoleRadius, Metrics.pinHoleSegments),
    materials.cavity
  )
  base.position.z = -Metrics.pinHoleDepth
  group.add(base)

  const sleeve = new Mesh(
    new CylinderGeometry(
      Metrics.sleeveRadius,
      Metrics.sleeveRadius,
      Metrics.sleeveLength,
      Metrics.pinHoleSegments,
      1,
      true
    ),
    materials.brass
  )
  sleeve.rotation.x = Math.PI / 2
  sleeve.position.z = -Metrics.sleeveInset - Metrics.sleeveLength / 2
  group.add(sleeve)

  return group
}

const earthClip = (materials: SCNMaterials, centre: number): Mesh => {
  const radius = Metrics.wellRadius - Metrics.earthThickness / 2
  const path: Vector3[] = []
  for (let i = 0; i <= ArcSamples; i += 1) {
    const angle = centre + (i / ArcSamples - 0.5) * Metrics.earthArc
    path.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -Metrics.earthDepth))
  }
  const profile = scnRoundedShape(
    Metrics.earthThickness,
    Metrics.earthHeight,
    Metrics.earthThickness / 2
  )
  return new Mesh(
    new ExtrudeGeometry(profile, {
      extrudePath: new CatmullRomCurve3(path, false, 'centripetal', 0),
      steps: Metrics.earthSegments,
      bevelEnabled: false
    }),
    materials.nickel
  )
}

export const scnMakeSocketOutlet = (materials: SCNMaterials): Group => {
  const group = new Group()
  group.add(chamfer(materials), wall(materials), floor(materials))
  for (const side of [-1, 1]) group.add(pinHole(materials, side))
  for (const centre of [Math.PI / 2, -Math.PI / 2]) group.add(earthClip(materials, centre))
  return group
}
