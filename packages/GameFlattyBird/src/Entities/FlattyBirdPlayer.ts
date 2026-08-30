import {
  skActionAnimate,
  skActionOscillate,
  skActionRepeatForever,
  skMakeDynamicBody,
  skMakeSprite,
  skRemoveAllActions,
  skRunAction,
  type SKAction,
  type SKNode,
  type SKTexture
} from 'SpriteKit'
import { FlattyBirdCategories, FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'

const flapping = (): SKAction =>
  skActionRepeatForever(
    skActionAnimate(FlattyBirdMetrics.birdFrameCount, FlattyBirdMetrics.birdFrameRate)
  )

export const flattyBirdMakePlayer = (texture: SKTexture): SKNode => {
  const bird = skMakeSprite(
    texture,
    FlattyBirdMetrics.birdResetX,
    FlattyBirdMetrics.birdResetY,
    0.5,
    0.5
  )
  bird.body = skMakeDynamicBody(
    FlattyBirdMetrics.birdColliderRadius,
    FlattyBirdCategories.player
  )
  return bird
}

export const flattyBirdStartWabble = (bird: SKNode, x: number, y: number): void => {
  const spread = (amplitude: number) => amplitude * Math.random()
  skRunAction(
    bird,
    skActionRepeatForever(
      skActionOscillate(
        'x',
        spread(FlattyBirdMetrics.birdWabbleAmplitudeX),
        FlattyBirdMetrics.birdWabblePeriod,
        'cosine',
        x
      )
    )
  )
  skRunAction(
    bird,
    skActionRepeatForever(
      skActionOscillate(
        'y',
        spread(FlattyBirdMetrics.birdWabbleAmplitudeY),
        FlattyBirdMetrics.birdWabblePeriod,
        'sine',
        y
      )
    )
  )
  skRunAction(bird, flapping())
}

export const flattyBirdStopWabble = (bird: SKNode): void => {
  skRemoveAllActions(bird)
  skRunAction(bird, flapping())
}

export const flattyBirdResetPlayer = (
  bird: SKNode,
  x: number = FlattyBirdMetrics.birdResetX,
  y: number = FlattyBirdMetrics.birdResetY
): void => {
  bird.x = x
  bird.y = y
  bird.zRotation = 0
  if (bird.body?.kind === 'dynamic') {
    bird.body.velocityX = 0
    bird.body.velocityY = 0
    bird.body.contacting.length = 0
    bird.body.previous.length = 0
  }
  skRemoveAllActions(bird)
  flattyBirdStartWabble(bird, x, y)
}

export const flattyBirdPush = (bird: SKNode): void => {
  if (bird.body?.kind !== 'dynamic') return
  bird.body.velocityY = FlattyBirdMetrics.birdJumpVelocity
}

export const flattyBirdStopFlapping = (bird: SKNode): void => {
  skRemoveAllActions(bird)
}
