import type { SKNode } from '../Nodes/SKNode'

export type SKAxis = 'x' | 'y'
export type SKOscillationCurve = 'sine' | 'cosine'

export type SKAction =
  | { readonly kind: 'wait'; readonly duration: number; elapsed: number }
  | { readonly kind: 'move'; readonly velocityX: number; readonly velocityY: number }
  | {
      readonly kind: 'animate'
      readonly frameCount: number
      readonly frameRate: number
      elapsed: number
    }
  | {
      readonly kind: 'oscillate'
      readonly axis: SKAxis
      readonly amplitude: number
      readonly period: number
      readonly curve: SKOscillationCurve
      readonly origin: number
      elapsed: number
    }
  | { readonly kind: 'sequence'; readonly steps: readonly SKAction[]; index: number }
  | { readonly kind: 'repeat'; readonly action: SKAction }

const Tau = Math.PI * 2

export const skActionWait = (seconds: number): SKAction => ({
  kind: 'wait',
  duration: seconds,
  elapsed: 0
})

export const skActionMove = (velocityX: number, velocityY: number): SKAction => ({
  kind: 'move',
  velocityX,
  velocityY
})

export const skActionAnimate = (frameCount: number, frameRate: number): SKAction => ({
  kind: 'animate',
  frameCount,
  frameRate,
  elapsed: 0
})

export const skActionOscillate = (
  axis: SKAxis,
  amplitude: number,
  period: number,
  curve: SKOscillationCurve,
  origin: number
): SKAction => ({ kind: 'oscillate', axis, amplitude, period, curve, origin, elapsed: 0 })

export const skActionSequence = (steps: readonly SKAction[]): SKAction => ({
  kind: 'sequence',
  steps,
  index: 0
})

export const skActionRepeatForever = (action: SKAction): SKAction => ({ kind: 'repeat', action })

export const skRunAction = (node: SKNode, action: SKAction): void => {
  node.actions.push(action)
}

export const skRemoveAllActions = (node: SKNode): void => {
  node.actions.length = 0
}

const stepAction = (node: SKNode, action: SKAction, dt: number): boolean => {
  if (action.kind === 'wait') {
    action.elapsed += dt
    return action.elapsed >= action.duration
  }

  if (action.kind === 'move') {
    node.x += action.velocityX * dt
    node.y += action.velocityY * dt
    return false
  }

  if (action.kind === 'animate') {
    action.elapsed += dt
    const sprite = node.sprite
    if (sprite) sprite.frame = Math.floor(action.elapsed * action.frameRate) % action.frameCount
    return false
  }

  if (action.kind === 'oscillate') {
    action.elapsed += dt
    const phase = (action.elapsed / action.period) * Tau
    const wave = action.curve === 'sine' ? Math.sin(phase) : Math.cos(phase)
    node[action.axis] = action.origin + action.amplitude * wave
    return false
  }

  if (action.kind === 'sequence') {
    const current = action.steps[action.index]
    if (!current) return true
    if (stepAction(node, current, dt)) action.index += 1
    return action.index >= action.steps.length
  }

  stepAction(node, action.action, dt)
  return false
}

export const skStepActions = (node: SKNode, dt: number): void => {
  for (let index = node.actions.length - 1; index >= 0; index -= 1) {
    const action = node.actions[index]
    if (action && stepAction(node, action, dt)) node.actions.splice(index, 1)
  }
  for (const child of node.children) skStepActions(child, dt)
}
