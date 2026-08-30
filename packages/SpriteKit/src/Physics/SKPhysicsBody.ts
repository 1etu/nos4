import type { SKNode } from '../Nodes/SKNode'

export type SKPhysicsBody =
  | {
      readonly kind: 'dynamic'
      readonly radius: number
      readonly category: number
      velocityX: number
      velocityY: number
      contacting: SKNode[]
      previous: SKNode[]
    }
  | {
      readonly kind: 'static'
      readonly width: number
      readonly height: number
      readonly category: number
    }

export const skMakeDynamicBody = (radius: number, category: number): SKPhysicsBody => ({
  kind: 'dynamic',
  radius,
  category,
  velocityX: 0,
  velocityY: 0,
  contacting: [],
  previous: []
})

export const skMakeStaticBody = (
  width: number,
  height: number,
  category: number
): SKPhysicsBody => ({ kind: 'static', width, height, category })
