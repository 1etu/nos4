import { skAddChild, skMakeNode, skMakeSprite, type SKNode } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'

export interface FlattyBirdBackground {
  readonly node: SKNode
  readonly rotor: SKNode
}

const SkyLeft = FlattyBirdMetrics.sceneWidth / 2 - FlattyBirdMetrics.skyWidth / 2
const SkyTop = FlattyBirdMetrics.sceneHeight - FlattyBirdMetrics.skyHeight

export const flattyBirdMakeBackground = (textures: FlattyBirdTextures): FlattyBirdBackground => {
  const node = skMakeNode(SkyLeft, SkyTop)

  const sky = skMakeSprite(textures.sky, 0, 0, 0, 0)
  skAddChild(node, sky)

  const rotor = skMakeSprite(
    textures.rotor,
    FlattyBirdMetrics.rotorX + FlattyBirdMetrics.rotorSize / 2,
    FlattyBirdMetrics.rotorY + FlattyBirdMetrics.rotorSize / 2,
    0.5,
    0.5
  )
  skAddChild(node, rotor)

  return { node, rotor }
}

export const flattyBirdSpinRotor = (background: FlattyBirdBackground, dt: number): void => {
  background.rotor.zRotation +=
    ((FlattyBirdMetrics.rotorDegreesPerSecond * Math.PI) / 180) * dt
}
