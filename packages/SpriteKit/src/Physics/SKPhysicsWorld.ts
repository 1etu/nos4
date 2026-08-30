import { skUpdateWorldPositions, type SKNode } from '../Nodes/SKNode'
import type { SKScene } from '../Scene/SKScene'

const dynamicNodes: SKNode[] = []
const staticNodes: SKNode[] = []

const collect = (node: SKNode): void => {
  const body = node.body
  if (body) {
    if (body.kind === 'dynamic') dynamicNodes.push(node)
    else staticNodes.push(node)
  }
  for (const child of node.children) collect(child)
}

const clamp = (value: number, low: number, high: number): number =>
  value < low ? low : value > high ? high : value

const circleOverlapsRectangle = (dynamicNode: SKNode, staticNode: SKNode): boolean => {
  const circle = dynamicNode.body
  const rectangle = staticNode.body
  if (circle?.kind !== 'dynamic' || rectangle?.kind !== 'static') return false

  const halfWidth = rectangle.width / 2
  const halfHeight = rectangle.height / 2
  const nearestX = clamp(
    dynamicNode.worldX,
    staticNode.worldX - halfWidth,
    staticNode.worldX + halfWidth
  )
  const nearestY = clamp(
    dynamicNode.worldY,
    staticNode.worldY - halfHeight,
    staticNode.worldY + halfHeight
  )
  const offsetX = dynamicNode.worldX - nearestX
  const offsetY = dynamicNode.worldY - nearestY
  return offsetX * offsetX + offsetY * offsetY < circle.radius * circle.radius
}

const integrate = (scene: SKScene, dt: number): void => {
  for (const node of dynamicNodes) {
    const body = node.body
    if (body?.kind !== 'dynamic') continue
    body.velocityX += scene.gravityX * dt
    body.velocityY += scene.gravityY * dt
    node.x += body.velocityX * dt
    node.y += body.velocityY * dt
  }
}

const reportContacts = (scene: SKScene): void => {
  for (const node of dynamicNodes) {
    const body = node.body
    if (body?.kind !== 'dynamic') continue

    body.contacting.length = 0
    for (const other of staticNodes) {
      if (circleOverlapsRectangle(node, other)) body.contacting.push(other)
    }
    for (const other of body.contacting) {
      if (!body.previous.includes(other)) scene.contact(scene, node, other)
    }
    const settled = body.previous
    body.previous = body.contacting
    body.contacting = settled
  }
}

export const skStepPhysics = (scene: SKScene, dt: number): void => {
  dynamicNodes.length = 0
  staticNodes.length = 0
  collect(scene.root)

  integrate(scene, dt)
  skUpdateWorldPositions(scene.root, 0, 0)
  reportContacts(scene)
}
