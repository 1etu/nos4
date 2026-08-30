import { BoxGeometry, Group, Mesh } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import {
  SCNCableMetrics,
  SCNLightningMetrics as Metrics
} from '../Support/SCNHardwareMetrics'
import type { SCNMaterials } from '../Support/SCNMaterials'
import { scnMakeStrainRelief } from './SCNStrainRelief'

const HousingCentre = Metrics.tabLength + Metrics.housingLength / 2
const ContactSpan = (Metrics.contactCount - 1) * Metrics.contactPitch

export interface SCNLightningPlug {
  readonly group: Group
  readonly blade: Group
}

const blade = (materials: SCNMaterials): Group => {
  const group = new Group()

  const tab = new Mesh(
    new RoundedBoxGeometry(
      Metrics.tabWidth,
      Metrics.tabLength,
      Metrics.tabThickness,
      Metrics.tabSegments,
      Metrics.tabCorner
    ),
    materials.nickel
  )
  tab.position.y = -Metrics.tabLength / 2
  tab.castShadow = true
  group.add(tab)

  const geometry = new BoxGeometry(
    Metrics.contactWidth,
    Metrics.contactLength,
    Metrics.tabThickness + Metrics.contactRelief * 2
  )
  for (let index = 0; index < Metrics.contactCount; index += 1) {
    const contact = new Mesh(geometry, materials.gold)
    contact.position.set(
      index * Metrics.contactPitch - ContactSpan / 2,
      -Metrics.contactInset - Metrics.contactLength / 2,
      0
    )
    group.add(contact)
  }

  return group
}

export const scnMakeLightningPlug = (materials: SCNMaterials): SCNLightningPlug => {
  const group = new Group()
  const tip = blade(materials)
  group.add(tip)

  const shoulder = new Mesh(
    new RoundedBoxGeometry(
      Metrics.housingWidth - Metrics.shoulderInset * 2,
      Metrics.shoulderLength * 2,
      Metrics.housingThickness - Metrics.shoulderInset * 2,
      Metrics.housingSegments,
      Metrics.shoulderCorner
    ),
    materials.housing
  )
  shoulder.position.y = -Metrics.tabLength
  shoulder.castShadow = true
  group.add(shoulder)

  const housing = new Mesh(
    new RoundedBoxGeometry(
      Metrics.housingWidth,
      Metrics.housingLength,
      Metrics.housingThickness,
      Metrics.housingSegments,
      Metrics.housingCorner
    ),
    materials.housing
  )
  housing.position.y = -HousingCentre
  housing.castShadow = true
  housing.receiveShadow = true
  group.add(housing)

  const relief = scnMakeStrainRelief(
    materials.cable,
    Metrics.reliefLength,
    Metrics.reliefRootRadius,
    SCNCableMetrics.radius,
    SCNCableMetrics.reliefEase,
    Metrics.reliefSegments
  )
  relief.rotation.z = Math.PI
  relief.position.y = -Metrics.tabLength - Metrics.housingLength
  group.add(relief)

  return { group, blade: tip }
}

export const SCNLightningPlugMetrics = {
  tabLength: Metrics.tabLength,
  housingWidth: Metrics.housingWidth,
  housingLength: Metrics.housingLength,
  reliefLength: Metrics.reliefLength,
  totalLength: Metrics.tabLength + Metrics.housingLength + Metrics.reliefLength
} as const
