import { skAddChild, skMakeNode, skMakeStaticBody, type SKNode } from 'SpriteKit'
import { FlattyBirdCategories, FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'
import {
  flattyBirdMakeBackground,
  type FlattyBirdBackground
} from '../Entities/FlattyBirdBackground'
import {
  flattyBirdMakeGround,
  flattyBirdStartGround,
  flattyBirdStopGround
} from '../Entities/FlattyBirdGround'
import {
  flattyBirdMakePipes,
  flattyBirdRecyclePipes,
  flattyBirdStartPipes,
  flattyBirdStopPipes
} from '../Entities/FlattyBirdPipes'

export interface FlattyBirdLevel {
  readonly background: FlattyBirdBackground
  readonly ground: SKNode
  readonly pipes: readonly SKNode[]
}

const PipeDelays = [FlattyBirdMetrics.pipeDelayFirst, FlattyBirdMetrics.pipeDelaySecond]

const makeBorder = (y: number): SKNode => {
  const border = skMakeNode(
    FlattyBirdMetrics.sceneWidth / 2,
    y + FlattyBirdMetrics.borderHeight / 2
  )
  border.body = skMakeStaticBody(
    FlattyBirdMetrics.sceneWidth,
    FlattyBirdMetrics.borderHeight,
    FlattyBirdCategories.obstacle
  )
  return border
}

export const flattyBirdMakeLevel = (
  root: SKNode,
  textures: FlattyBirdTextures
): FlattyBirdLevel => {
  const background = flattyBirdMakeBackground(textures)
  skAddChild(root, background.node)

  const pipes = PipeDelays.map((delay) => flattyBirdMakePipes(textures.pipe, delay))
  for (const pair of pipes) skAddChild(root, pair)

  const ground = flattyBirdMakeGround(textures.ground)
  skAddChild(root, ground)

  skAddChild(root, makeBorder(FlattyBirdMetrics.ceilingOffsetY))
  skAddChild(root, makeBorder(FlattyBirdMetrics.sceneHeight - FlattyBirdMetrics.groundHeight))

  return { background, ground, pipes }
}

export const flattyBirdResetLevel = (level: FlattyBirdLevel): void => {
  level.pipes.forEach((pair, index) => {
    flattyBirdRecyclePipes(pair)
    flattyBirdStartPipes(pair, PipeDelays[index] ?? FlattyBirdMetrics.pipeDelayFirst)
  })
  flattyBirdStartGround(level.ground)
}

export const flattyBirdStopLevel = (level: FlattyBirdLevel): void => {
  for (const pair of level.pipes) flattyBirdStopPipes(pair)
  flattyBirdStopGround(level.ground)
}
