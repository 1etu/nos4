import { SCNRopeMetrics } from './SCNPhysicsMetrics'

export interface SCNRopePoint {
  x: number
  y: number
  z: number
  px: number
  py: number
  pz: number
}

export interface SCNRopeAxis {
  readonly x: number
  readonly y: number
  readonly z: number
}

export interface SCNRope {
  readonly points: readonly SCNRopePoint[]
  readonly segmentLength: number
  setAnchor: (x: number, y: number, z: number) => void
  setAnchorAxis: (axis: SCNRopeAxis) => void
  setTailAxis: (axis: SCNRopeAxis) => void
  setTail: (x: number, y: number, z: number) => void
  setFloor: (y: number) => void
  setBackPlane: (z: number) => void
  setThickness: (radius: number) => void
  holdTail: (held: boolean) => void
  lockTail: (locked: boolean) => void
  reset: (x: number, y: number, z: number) => void
  step: (elapsed: number) => void
  energy: () => number
}

export const scnMakeRope = (length: number, pixelsPerMillimetre: number): SCNRope => {
  const count = SCNRopeMetrics.pointCount
  const segmentLength = length / (count - 1)
  const gravity = -SCNRopeMetrics.gravityMillimetres * pixelsPerMillimetre
  const points: SCNRopePoint[] = []
  const creases: number[] = []
  let anchorX = 0
  let anchorY = 0
  let anchorZ = 0
  let tailX = 0
  let tailY = 0
  let tailZ = 0
  let tailHeld = false
  let tailLocked = false
  let anchorAxis: SCNRopeAxis = { x: 0, y: -1, z: 0 }
  let tailAxis: SCNRopeAxis = { x: 0, y: -1, z: 0 }
  let floorY = Number.NEGATIVE_INFINITY
  let backZ = Number.NEGATIVE_INFINITY
  let thickness = 0
  let pending = 0

  const reset = (x: number, y: number, z: number) => {
    anchorX = x
    anchorY = y
    anchorZ = z
    points.length = 0
    creases.length = 0
    let layX = x
    let layY = y
    for (let i = 0; i < count; i += 1) {
      points.push({ x: layX, y: layY, z, px: layX, py: layY, pz: z })
      creases.push(segmentLength * 2)
      if (layY - segmentLength >= floorY) {
        layY -= segmentLength
        continue
      }
      layY = Math.max(layY, floorY)
      layX += segmentLength
    }
    tailX = layX
    tailY = layY
    tailZ = z
    pending = 0
  }

  reset(0, 0, 0)

  const integrate = (seconds: number) => {
    const fall = gravity * seconds * seconds
    let index = 0
    for (const point of points) {
      index += 1
      if (index === 1) continue
      const height = point.y - floorY
      const lift =
        height >= SCNRopeMetrics.contactBand ? 1 : Math.max(height, 0) / SCNRopeMetrics.contactBand
      const drag = SCNRopeMetrics.floorFriction + (1 - SCNRopeMetrics.floorFriction) * lift
      const vx = (point.x - point.px) * SCNRopeMetrics.damping * drag
      const vy = (point.y - point.py) * SCNRopeMetrics.damping
      const vz = (point.z - point.pz) * SCNRopeMetrics.damping * drag
      point.px = point.x
      point.py = point.y
      point.pz = point.z
      point.x += vx
      point.y += vy + fall * lift
      point.z += vz
      if (point.y >= floorY) continue
      point.y = floorY
      point.py = floorY - vy * SCNRopeMetrics.floorRestitution
    }
  }

  const link = () => {
    let previous: SCNRopePoint | undefined
    let index = 0
    for (const point of points) {
      index += 1
      if (!previous) {
        previous = point
        continue
      }
      const dx = point.x - previous.x
      const dy = point.y - previous.y
      const dz = point.z - previous.z
      const gap = Math.max(Math.hypot(dx, dy, dz), SCNRopeMetrics.minimumSeparation)
      const share = (gap - segmentLength) / gap / 2
      const cx = dx * share
      const cy = dy * share
      const cz = dz * share
      if (index > 2) {
        previous.x += cx
        previous.y += cy
        previous.z += cz
      }
      point.x -= cx
      point.y -= cy
      point.z -= cz
      previous = point
    }
  }

  const bend = () => {
    let back: SCNRopePoint | undefined
    let middle: SCNRopePoint | undefined
    let index = 0
    for (const point of points) {
      index += 1
      if (back && middle) {
        const slot = index - 2
        const dx = point.x - back.x
        const dy = point.y - back.y
        const dz = point.z - back.z
        const spread = Math.max(Math.hypot(dx, dy, dz), SCNRopeMetrics.minimumSeparation)
        const rest = creases[slot] ?? segmentLength * 2
        if (spread < rest * (1 - SCNRopeMetrics.creaseSlack)) {
          creases[slot] = Math.max(
            spread / (1 - SCNRopeMetrics.creaseSlack),
            segmentLength * 2 * SCNRopeMetrics.minimumCreaseFactor
          )
        }
        const target = Math.min(creases[slot] ?? rest, segmentLength * 2)
        const share = ((spread - target) / spread) * SCNRopeMetrics.bendStiffness
        if (slot > 1) {
          back.x += dx * share
          back.y += dy * share
          back.z += dz * share
        }
        point.x -= dx * share
        point.y -= dy * share
        point.z -= dz * share
      }
      back = middle
      middle = point
    }
  }

  const collide = () => {
    const reach = thickness * 2
    if (reach <= 0) return
    for (let i = 1; i < count; i += 1) {
      const a = points[i]
      if (!a) continue
      for (let j = i + SCNRopeMetrics.collisionSkip; j < count; j += 1) {
        const b = points[j]
        if (!b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const gap = dx * dx + dy * dy + dz * dz
        if (gap >= reach * reach || gap <= 0) continue
        const distance = Math.sqrt(gap)
        const overlap = reach - distance
        if (overlap < SCNRopeMetrics.collisionTolerance) continue
        const share = (overlap / distance / 2) * SCNRopeMetrics.collisionStiffness
        a.x -= dx * share
        a.y -= dy * share
        a.z -= dz * share
        b.x += dx * share
        b.y += dy * share
        b.z += dz * share
      }
    }
  }

  const pin = () => {
    const head = points[0]
    if (head) {
      head.x = anchorX
      head.y = anchorY
      head.z = anchorZ
    }
    const tail = points[count - 1]
    if (!tail) return
    if (tailLocked) {
      tail.x = tailX
      tail.y = tailY
      tail.z = tailZ
      return
    }
    if (!tailHeld) return
    tail.x += (tailX - tail.x) * SCNRopeMetrics.dragStiffness
    tail.y += (tailY - tail.y) * SCNRopeMetrics.dragStiffness
    tail.z += (tailZ - tail.z) * SCNRopeMetrics.dragStiffness
  }

  const stub = () => {
    if (!tailLocked) return
    for (let step = 1; step <= SCNRopeMetrics.terminalSpan; step += 1) {
      const trail = points[count - 1 - step]
      if (!trail) return
      trail.x = tailX + tailAxis.x * segmentLength * step
      trail.y = tailY + tailAxis.y * segmentLength * step
      trail.z = tailZ + tailAxis.z * segmentLength * step
    }
  }

  const align = (root: SCNRopePoint, limb: SCNRopePoint, axis: SCNRopeAxis, span: number) => {
    const stiffness = SCNRopeMetrics.terminalStiffness
    limb.x += (root.x + axis.x * span - limb.x) * stiffness
    limb.y += (root.y + axis.y * span - limb.y) * stiffness
    limb.z += (root.z + axis.z * span - limb.z) * stiffness
  }

  const stiffen = () => {
    const head = points[0]
    const tail = points[count - 1]
    for (let step = 1; step <= SCNRopeMetrics.terminalSpan; step += 1) {
      const lead = points[step]
      if (head && lead) align(head, lead, anchorAxis, segmentLength * step)
      const trail = points[count - 1 - step]
      if (tail && trail) align(tail, trail, tailAxis, segmentLength * step)
    }
  }

  const contain = () => {
    let index = 0
    for (const point of points) {
      index += 1
      if (index === 1) continue
      if (point.y < floorY) {
        point.y = floorY
        point.py = floorY
      }
      if (point.z < backZ) {
        point.z = backZ
        point.pz = backZ
      }
    }
  }

  const substep = (seconds: number) => {
    integrate(seconds)
    stiffen()
    for (let pass = 0; pass < SCNRopeMetrics.relaxIterations; pass += 1) {
      pin()
      stub()
      link()
      bend()
    }
    pin()
    stub()
    collide()
    contain()
  }

  return {
    points,
    segmentLength,
    setAnchor: (x, y, z) => {
      anchorX = x
      anchorY = y
      anchorZ = z
    },
    setAnchorAxis: (axis) => {
      anchorAxis = axis
    },
    setTailAxis: (axis) => {
      tailAxis = axis
    },
    setTail: (x, y, z) => {
      tailX = x
      tailY = y
      tailZ = z
    },
    setFloor: (y) => {
      floorY = y
    },
    setBackPlane: (z) => {
      backZ = z
    },
    setThickness: (radius) => {
      thickness = radius
    },
    holdTail: (held) => {
      tailHeld = held
    },
    lockTail: (locked) => {
      tailLocked = locked
    },
    reset,
    step: (elapsed) => {
      pending = Math.min(pending + elapsed / 1000, SCNRopeMetrics.maximumFrame)
      while (pending >= SCNRopeMetrics.fixedStep) {
        substep(SCNRopeMetrics.fixedStep)
        pending -= SCNRopeMetrics.fixedStep
      }
    },
    energy: () => {
      let total = 0
      for (const point of points) {
        total += Math.hypot(point.x - point.px, point.y - point.py, point.z - point.pz)
      }
      return total / count
    }
  }
}
