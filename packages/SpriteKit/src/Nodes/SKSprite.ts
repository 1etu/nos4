import { skMakeNode, type SKNode } from './SKNode'
import type { SKTexture } from './SKTexture'

export interface SKSprite {
  texture: SKTexture
  width: number
  height: number
  anchorX: number
  anchorY: number
  frame: number
}

export const skMakeSprite = (
  texture: SKTexture,
  x: number,
  y: number,
  anchorX: number,
  anchorY: number
): SKNode => {
  const node = skMakeNode(x, y)
  node.sprite = {
    texture,
    width: texture.frameWidth,
    height: texture.frameHeight,
    anchorX,
    anchorY,
    frame: 0
  }
  return node
}
