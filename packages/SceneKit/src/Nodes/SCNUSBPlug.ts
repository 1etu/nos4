import { Group, Mesh, PlaneGeometry, ShapeGeometry, type BufferGeometry } from 'three'
import {
  scnNormaliseUV,
  scnRoundedShape,
  scnShellGeometry,
  scnTuckRings
} from '../Support/SCNGeometry'
import { SCNCableMetrics, SCNUSBPlugMetrics as Metrics } from '../Support/SCNHardwareMetrics'
import type { SCNMaterials } from '../Support/SCNMaterials'
import { scnMakeStrainRelief } from './SCNStrainRelief'

const overmoldShell = (): BufferGeometry => {
  const geometry = scnShellGeometry(
    Metrics.overmoldWidth,
    Metrics.overmoldHeight,
    Metrics.overmoldCorner,
    Metrics.overmoldSegments,
    [
      { depth: 0, inset: 0 },
      ...scnTuckRings(
        Metrics.overmoldLength - Metrics.overmoldRelief,
        Metrics.overmoldRelief,
        Metrics.overmoldRelief,
        Metrics.overmoldSegments
      )
    ]
  )
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

const overmoldFace = (): BufferGeometry => {
  const shape = scnRoundedShape(
    Metrics.overmoldWidth,
    Metrics.overmoldHeight,
    Metrics.overmoldCorner
  )
  const geometry = new ShapeGeometry(shape, Metrics.overmoldSegments)
  scnNormaliseUV(geometry, Metrics.overmoldWidth, Metrics.overmoldHeight)
  geometry.rotateX(-Math.PI / 2)
  return geometry
}

const overmoldBack = (): BufferGeometry => {
  const inset = Metrics.overmoldRelief
  const shape = scnRoundedShape(
    Metrics.overmoldWidth - inset * 2,
    Metrics.overmoldHeight - inset * 2,
    Metrics.overmoldCorner - inset
  )
  const geometry = new ShapeGeometry(shape, Metrics.overmoldSegments)
  scnNormaliseUV(geometry, Metrics.overmoldWidth, Metrics.overmoldHeight)
  geometry.rotateX(Math.PI / 2)
  geometry.translate(0, -Metrics.overmoldLength, 0)
  return geometry
}

const contactShell = (): BufferGeometry => {
  const geometry = scnShellGeometry(
    Metrics.shellWidth,
    Metrics.shellHeight,
    Metrics.shellCorner,
    Metrics.shellSegments,
    [
      { depth: 0, inset: 0 },
      { depth: Metrics.shellLength, inset: 0 }
    ]
  )
  geometry.rotateX(Math.PI / 2)
  return geometry
}

export const scnMakeUSBPlug = (materials: SCNMaterials): Group => {
  const group = new Group()
  group.position.y = Metrics.overmoldSeat

  const shell = new Mesh(contactShell(), materials.nickel)
  shell.castShadow = true
  group.add(shell)

  for (const geometry of [overmoldShell(), overmoldFace(), overmoldBack()]) {
    const part = new Mesh(geometry, materials.housing)
    part.castShadow = true
    part.receiveShadow = true
    group.add(part)
  }

  const mark = new Mesh(new PlaneGeometry(Metrics.markWidth, Metrics.markWidth), materials.mark)
  mark.position.set(0, -Metrics.markInset, Metrics.overmoldHeight / 2 + Metrics.markLift)
  group.add(mark)

  const relief = scnMakeStrainRelief(
    materials.cable,
    Metrics.reliefLength,
    Metrics.reliefRootRadius,
    SCNCableMetrics.radius,
    SCNCableMetrics.reliefEase,
    Metrics.reliefSegments
  )
  relief.rotation.z = Math.PI
  relief.position.y = -Metrics.overmoldLength
  group.add(relief)

  return group
}
