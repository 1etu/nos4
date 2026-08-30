import {
  skActionAnimate,
  skActionRepeatForever,
  skMakeSprite,
  skRemoveAllActions,
  skRunAction,
  type SKNode,
  type SKTexture
} from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'

const GroundTop = FlattyBirdMetrics.sceneHeight - FlattyBirdMetrics.groundHeight

export const flattyBirdMakeGround = (texture: SKTexture): SKNode => {
  const ground = skMakeSprite(texture, FlattyBirdMetrics.sceneWidth / 2, GroundTop, 0.5, 0)
  if (ground.sprite) ground.sprite.height = FlattyBirdMetrics.groundBleedHeight
  flattyBirdStartGround(ground)
  return ground
}

export const flattyBirdStartGround = (ground: SKNode): void => {
  skRemoveAllActions(ground)
  skRunAction(
    ground,
    skActionRepeatForever(
      skActionAnimate(FlattyBirdMetrics.groundFrameCount, FlattyBirdMetrics.groundFrameRate)
    )
  )
}

export const flattyBirdStopGround = (ground: SKNode): void => {
  skRemoveAllActions(ground)
}

export const flattyBirdMakeSky = (texture: SKTexture): SKNode =>
  skMakeSprite(
    texture,
    FlattyBirdMetrics.sceneWidth / 2,
    FlattyBirdMetrics.sceneHeight,
    0.5,
    1
  )
