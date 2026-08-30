import { skStepActions } from '../Actions/SKAction'
import { skMakeNode, type SKNode } from '../Nodes/SKNode'
import { skStepPhysics } from '../Physics/SKPhysicsWorld'

export interface SKScene {
  readonly root: SKNode
  readonly width: number
  readonly height: number
  gravityX: number
  gravityY: number
  readonly update: (scene: SKScene, dt: number) => void
  readonly contact: (scene: SKScene, dynamicNode: SKNode, staticNode: SKNode) => void
  readonly touchBegan: (scene: SKScene, x: number, y: number) => void
}

export interface SKSceneDescriptor {
  readonly width: number
  readonly height: number
  readonly gravityX: number
  readonly gravityY: number
  readonly build: (root: SKNode) => void
  readonly update: (scene: SKScene, dt: number) => void
  readonly contact: (scene: SKScene, dynamicNode: SKNode, staticNode: SKNode) => void
  readonly touchBegan: (scene: SKScene, x: number, y: number) => void
}

export const skMakeScene = (descriptor: SKSceneDescriptor): SKScene => {
  const root = skMakeNode(0, 0)
  descriptor.build(root)
  return {
    root,
    width: descriptor.width,
    height: descriptor.height,
    gravityX: descriptor.gravityX,
    gravityY: descriptor.gravityY,
    update: descriptor.update,
    contact: descriptor.contact,
    touchBegan: descriptor.touchBegan
  }
}

export const skStepScene = (scene: SKScene, dt: number): void => {
  skStepActions(scene.root, dt)
  skStepPhysics(scene, dt)
  scene.update(scene, dt)
}
