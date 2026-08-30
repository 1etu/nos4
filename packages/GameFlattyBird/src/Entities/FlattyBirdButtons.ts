import { skAddChild, skMakeNode, skMakeSprite, type SKNode } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'

export interface FlattyBirdMenu {
  readonly node: SKNode
  readonly play: SKNode
  readonly scores: SKNode
}

const RowWidth = FlattyBirdMetrics.buttonWidth * 2 + FlattyBirdMetrics.buttonSpacing

export const flattyBirdMakeMenu = (textures: FlattyBirdTextures, top: number): FlattyBirdMenu => {
  const node = skMakeNode(FlattyBirdMetrics.sceneWidth / 2 - RowWidth / 2, top)

  const play = skMakeSprite(textures.playAgain, 0, 0, 0, 0)
  skAddChild(node, play)

  const scores = skMakeSprite(
    textures.scores,
    FlattyBirdMetrics.buttonWidth + FlattyBirdMetrics.buttonSpacing,
    0,
    0,
    0
  )
  skAddChild(node, scores)

  return { node, play, scores }
}

const hits = (button: SKNode, x: number, y: number): boolean =>
  x >= button.worldX &&
  x <= button.worldX + FlattyBirdMetrics.buttonWidth &&
  y >= button.worldY &&
  y <= button.worldY + FlattyBirdMetrics.buttonHeight

export const flattyBirdMenuHit = (
  menu: FlattyBirdMenu,
  x: number,
  y: number
): 'play' | 'scores' | undefined => {
  if (!menu.node.visible) return undefined
  if (hits(menu.play, x, y)) return 'play'
  if (hits(menu.scores, x, y)) return 'scores'
  return undefined
}

export const flattyBirdPressButton = (button: SKNode): void => {
  button.alpha = FlattyBirdMetrics.buttonPressedAlpha
}

export const flattyBirdReleaseButtons = (menu: FlattyBirdMenu): void => {
  menu.play.alpha = 1
  menu.scores.alpha = 1
}
