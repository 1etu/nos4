import {
  skActionMove,
  skActionRepeatForever,
  skActionSequence,
  skActionWait,
  skAddChild,
  skMakeNode,
  skMakeSprite,
  skMakeStaticBody,
  skRemoveAllActions,
  skRunAction,
  type SKNode,
  type SKTexture
} from 'SpriteKit'
import { FlattyBirdCategories, FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'

const HalfPipeWidth = FlattyBirdMetrics.pipeWidth / 2
const HalfPipeHeight = FlattyBirdMetrics.pipeHeight / 2
const LowerPipeTop = FlattyBirdMetrics.pipeHeight + FlattyBirdMetrics.pipeGateway

export const flattyBirdMakePipes = (texture: SKTexture, delay: number): SKNode => {
  const pipes = skMakeNode(0, 0)

  const upper = skMakeSprite(texture, HalfPipeWidth, HalfPipeHeight, 0.5, 0.5)
  upper.zRotation = Math.PI
  skAddChild(pipes, upper)

  const lower = skMakeSprite(texture, HalfPipeWidth, LowerPipeTop + HalfPipeHeight, 0.5, 0.5)
  skAddChild(pipes, lower)

  const upperBody = skMakeNode(HalfPipeWidth, HalfPipeHeight)
  upperBody.body = skMakeStaticBody(
    FlattyBirdMetrics.pipeWidth,
    FlattyBirdMetrics.pipeHeight,
    FlattyBirdCategories.obstacle
  )
  skAddChild(pipes, upperBody)

  const lowerBody = skMakeNode(HalfPipeWidth, LowerPipeTop + HalfPipeHeight)
  lowerBody.body = skMakeStaticBody(
    FlattyBirdMetrics.pipeWidth,
    FlattyBirdMetrics.pipeHeight,
    FlattyBirdCategories.obstacle
  )
  skAddChild(pipes, lowerBody)

  const gate = skMakeNode(
    HalfPipeWidth + FlattyBirdMetrics.gateWidth / 2,
    FlattyBirdMetrics.pipeHeight + FlattyBirdMetrics.pipeGateway / 2
  )
  gate.body = skMakeStaticBody(
    FlattyBirdMetrics.gateWidth,
    FlattyBirdMetrics.pipeGateway,
    FlattyBirdCategories.gate
  )
  skAddChild(pipes, gate)

  flattyBirdRecyclePipes(pipes)
  flattyBirdStartPipes(pipes, delay)
  return pipes
}

export const flattyBirdRecyclePipes = (pipes: SKNode): void => {
  pipes.x =
    FlattyBirdMetrics.sceneWidth + FlattyBirdMetrics.pipeWidth * FlattyBirdMetrics.pipeSpawnMarginFactor
  pipes.y =
    (Math.random() * 2 - 1) * FlattyBirdMetrics.pipeVariation -
    FlattyBirdMetrics.sceneHeight / FlattyBirdMetrics.pipeCentreHeightDivisor
}

export const flattyBirdPipesEscaped = (pipes: SKNode): boolean =>
  pipes.x < -FlattyBirdMetrics.pipeWidth * FlattyBirdMetrics.pipeDespawnMarginFactor

export const flattyBirdStopPipes = (pipes: SKNode): void => {
  skRemoveAllActions(pipes)
}

export const flattyBirdStartPipes = (pipes: SKNode, delay: number): void => {
  skRemoveAllActions(pipes)
  skRunAction(
    pipes,
    skActionSequence([
      skActionWait(delay),
      skActionRepeatForever(skActionMove(FlattyBirdMetrics.pipeVelocityX, 0))
    ])
  )
}
