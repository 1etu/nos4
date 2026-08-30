import type { SKPhysicsBody } from '../Physics/SKPhysicsBody'
import type { SKAction } from '../Actions/SKAction'
import type { SKSprite } from './SKSprite'

export interface SKNode {
  x: number
  y: number
  zRotation: number
  alpha: number
  visible: boolean
  worldX: number
  worldY: number
  sprite: SKSprite | undefined
  body: SKPhysicsBody | undefined
  parent: SKNode | undefined
  readonly children: SKNode[]
  readonly actions: SKAction[]
}

export const skMakeNode = (x: number, y: number): SKNode => ({
  x,
  y,
  zRotation: 0,
  alpha: 1,
  visible: true,
  worldX: x,
  worldY: y,
  sprite: undefined,
  body: undefined,
  parent: undefined,
  children: [],
  actions: []
})

export const skAddChild = (parent: SKNode, child: SKNode): void => {
  child.parent = parent
  parent.children.push(child)
}

export const skRemoveFromParent = (node: SKNode): void => {
  const parent = node.parent
  if (!parent) return
  const index = parent.children.indexOf(node)
  if (index >= 0) parent.children.splice(index, 1)
  node.parent = undefined
}

export const skUpdateWorldPositions = (node: SKNode, parentX: number, parentY: number): void => {
  node.worldX = parentX + node.x
  node.worldY = parentY + node.y
  for (const child of node.children) skUpdateWorldPositions(child, node.worldX, node.worldY)
}
