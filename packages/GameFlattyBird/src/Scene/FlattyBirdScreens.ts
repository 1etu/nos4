import { skAddChild, skMakeNode, skMakeSprite, type SKNode } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'
import {
  flattyBirdMakeNumbers,
  flattyBirdSetNumber,
  type FlattyBirdNumbers
} from '../Entities/FlattyBirdNumbers'
import { flattyBirdMakeMenu, type FlattyBirdMenu } from '../Entities/FlattyBirdButtons'

const CentreX = FlattyBirdMetrics.sceneWidth / 2
const CentreY = FlattyBirdMetrics.sceneHeight / 2 + FlattyBirdMetrics.screenOffsetY

export interface FlattyBirdWaitScreen {
  readonly node: SKNode
}

export interface FlattyBirdGameOverScreen {
  readonly node: SKNode
  readonly menu: FlattyBirdMenu
  readonly score: FlattyBirdNumbers
  readonly best: FlattyBirdNumbers
  readonly coins: FlattyBirdNumbers
}

export const flattyBirdMakeWaitScreen = (textures: FlattyBirdTextures): FlattyBirdWaitScreen => {
  const node = skMakeNode(0, 0)

  const tutorial = skMakeSprite(textures.tutorial, CentreX, CentreY, 0.5, 0.5)
  skAddChild(node, tutorial)

  const getReadyBottom = CentreY - FlattyBirdMetrics.tutorialHeight / 2 - FlattyBirdMetrics.overlayGap
  skAddChild(node, skMakeSprite(textures.getReady, CentreX, getReadyBottom, 0.5, 1))

  return { node }
}

export const flattyBirdMakeGameOverScreen = (
  textures: FlattyBirdTextures
): FlattyBirdGameOverScreen => {
  const node = skMakeNode(0, 0)

  const board = skMakeSprite(textures.scoreBoard, CentreX, CentreY, 0.5, 0.5)
  skAddChild(node, board)

  const boardLeft = CentreX - FlattyBirdMetrics.boardWidth / 2
  const boardRight = CentreX + FlattyBirdMetrics.boardWidth / 2
  const boardTop = CentreY - FlattyBirdMetrics.boardHeight / 2
  const boardBottom = CentreY + FlattyBirdMetrics.boardHeight / 2

  const gameOverBottom = boardTop - FlattyBirdMetrics.overlayGap
  skAddChild(node, skMakeSprite(textures.gameOver, CentreX, gameOverBottom, 0.5, 1))

  const numberCentre = boardRight - FlattyBirdMetrics.boardNumberCentreRight

  const score = flattyBirdMakeNumbers(
    textures.white,
    textures.empty,
    numberCentre,
    boardTop + FlattyBirdMetrics.boardScoreTopMargin,
    FlattyBirdMetrics.boardNumberScale
  )
  skAddChild(node, score.node)

  const best = flattyBirdMakeNumbers(
    textures.white,
    textures.empty,
    numberCentre,
    boardTop + FlattyBirdMetrics.boardBestTopMargin,
    FlattyBirdMetrics.boardNumberScale
  )
  skAddChild(node, best.node)

  const coins = flattyBirdMakeNumbers(
    textures.gold,
    textures.empty,
    boardLeft + FlattyBirdMetrics.boardCoinsCentreLeft,
    boardTop + FlattyBirdMetrics.boardCoinsTopMargin,
    1
  )
  skAddChild(node, coins.node)

  const menu = flattyBirdMakeMenu(textures, boardBottom + FlattyBirdMetrics.menuTopMargin)
  skAddChild(node, menu.node)

  return { node, menu, score, best, coins }
}

export const flattyBirdShowResults = (
  screen: FlattyBirdGameOverScreen,
  score: number,
  best: number,
  coins: number
): void => {
  flattyBirdSetNumber(screen.score, score)
  flattyBirdSetNumber(screen.best, best)
  flattyBirdSetNumber(screen.coins, coins)
}
