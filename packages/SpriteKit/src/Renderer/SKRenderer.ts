import type { SKNode } from '../Nodes/SKNode'
import type { SKScene } from '../Scene/SKScene'

const drawNode = (context: CanvasRenderingContext2D, node: SKNode): void => {
  if (!node.visible) return

  context.save()
  if (node.alpha !== 1) context.globalAlpha *= node.alpha
  context.translate(node.x, node.y)
  if (node.zRotation !== 0) context.rotate(node.zRotation)

  const sprite = node.sprite
  if (sprite) {
    const texture = sprite.texture
    context.drawImage(
      texture.image,
      sprite.frame * texture.frameWidth,
      0,
      texture.frameWidth,
      texture.frameHeight,
      -sprite.width * sprite.anchorX,
      -sprite.height * sprite.anchorY,
      sprite.width,
      sprite.height
    )
  }

  for (const child of node.children) drawNode(context, child)
  context.restore()
}

export const skRenderScene = (context: CanvasRenderingContext2D, scene: SKScene): void => {
  drawNode(context, scene.root)
}
