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

export interface SCNRopeCollider {
  readonly left: number
  readonly right: number
  readonly bottom: number
  readonly top: number
  readonly back: number
  readonly front: number
  readonly radius: number
}

export interface SCNRope {
  readonly points: readonly SCNRopePoint[]
  readonly segmentLength: number
  setAnchor: (x: number, y: number, z: number) => void
  setAnchorAxis: (axis: SCNRopeAxis) => void
  setTailAxis: (axis: SCNRopeAxis) => void
  setTail: (x: number, y: number, z: number) => void
  setTable: (z: number) => void
  setThickness: (radius: number) => void
  setColliders: (colliders: readonly SCNRopeCollider[]) => void
  holdTail: (held: boolean) => void
  lockTail: (locked: boolean) => void
  reset: (x: number, y: number, z: number, tailX: number, tailY: number, tailZ: number) => void
  step: (elapsed: number) => void
  energy: () => number
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

const pointCount = (length: number, pixelsPerMillimetre: number): number =>
  clamp(
    Math.ceil(length / (SCNRopeMetrics.segmentMillimetres * pixelsPerMillimetre)) + 1,
    SCNRopeMetrics.minimumPointCount,
    SCNRopeMetrics.maximumPointCount
  )

const bezier = (start: number, control: number, end: number, t: number): number => {
  const a = 1 - t
  return a * a * start + 2 * a * t * control + t * t * end
}

export const scnMakeRope = (length: number, pixelsPerMillimetre: number): SCNRope => {
  const count = pointCount(length, pixelsPerMillimetre)
  const segmentLength = length / (count - 1)
  const gravity = SCNRopeMetrics.gravityMillimetres * pixelsPerMillimetre
  const contactBand = SCNRopeMetrics.contactBandMillimetres * pixelsPerMillimetre
  const minimumBendRadius =
    SCNRopeMetrics.minimumBendRadiusMillimetres * pixelsPerMillimetre
  const maximumTurn = Math.min(segmentLength / minimumBendRadius, Math.PI * 0.46)
  const minimumOuterSpan = segmentLength * 2 * Math.cos(maximumTurn / 2)
  const points: SCNRopePoint[] = []
  let anchorX = 0
  let anchorY = 0
  let anchorZ = 0
  let tailX = 0
  let tailY = 0
  let tailZ = 0
  let tailHeld = false
  let tailLocked = false
  let tableZ = Number.NEGATIVE_INFINITY
  let thickness = 0
  let pending = 0
  let colliders: readonly SCNRopeCollider[] = []
  let anchorAxis: SCNRopeAxis = { x: 0, y: -1, z: 0 }
  let tailAxis: SCNRopeAxis = { x: 0, y: -1, z: 0 }

  const reset = (x: number, y: number, z: number, tx: number, ty: number, tz: number) => {
    anchorX = x
    anchorY = y
    anchorZ = z
    tailX = tx
    tailY = ty
    tailZ = tz
    points.length = 0
    const controlX = (x + tx) / 2
    const controlY = Math.min(y, ty) - length * SCNRopeMetrics.initialSagFraction
    const controlZ = Math.max(tableZ + thickness, Math.min(z, tz))
    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1)
      const px = bezier(x, controlX, tx, t)
      const py = bezier(y, controlY, ty, t)
      const pz = bezier(z, controlZ, tz, t)
      points.push({ x: px, y: py, z: pz, px, py, pz })
    }
    pending = 0
  }

  reset(0, 0, 0, length, 0, 0)

  const isPinned = (index: number): boolean =>
    index === 0 || (index === count - 1 && (tailHeld || tailLocked))

  const integrate = (seconds: number) => {
    const fall = gravity * seconds * seconds
    for (let index = 1; index < count; index += 1) {
      const point = points[index]
      if (!point || isPinned(index)) continue
      let vx = (point.x - point.px) * SCNRopeMetrics.damping
      let vy = (point.y - point.py) * SCNRopeMetrics.damping
      const vz = (point.z - point.pz) * SCNRopeMetrics.damping
      const onTable = point.z <= tableZ + thickness + contactBand
      if (onTable) {
        const planar = Math.hypot(vx, vy)
        const friction =
          planar < thickness * SCNRopeMetrics.staticFriction
            ? 0
            : 1 - SCNRopeMetrics.dynamicFriction
        vx *= friction
        vy *= friction
      }
      point.px = point.x
      point.py = point.y
      point.pz = point.z
      point.x += vx
      point.y += vy
      point.z += vz - fall
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

  const solveDistance = () => {
    for (let index = 1; index < count; index += 1) {
      const a = points[index - 1]
      const b = points[index]
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const distance = Math.max(Math.hypot(dx, dy, dz), SCNRopeMetrics.minimumSeparation)
      const correction = (distance - segmentLength) / distance
      const aPinned = isPinned(index - 1)
      const bPinned = isPinned(index)
      const aShare = aPinned ? 0 : bPinned ? 1 : 0.5
      const bShare = bPinned ? 0 : aPinned ? 1 : 0.5
      a.x += dx * correction * aShare
      a.y += dy * correction * aShare
      a.z += dz * correction * aShare
      b.x -= dx * correction * bShare
      b.y -= dy * correction * bShare
      b.z -= dz * correction * bShare
    }
  }

  const solveBend = () => {
    for (let index = 1; index < count - 1; index += 1) {
      const a = points[index - 1]
      const b = points[index + 1]
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dz = b.z - a.z
      const distance = Math.max(Math.hypot(dx, dy, dz), SCNRopeMetrics.minimumSeparation)
      if (distance >= minimumOuterSpan) continue
      const correction =
        ((minimumOuterSpan - distance) / distance) * SCNRopeMetrics.bendStiffness
      const aPinned = isPinned(index - 1)
      const bPinned = isPinned(index + 1)
      const aShare = aPinned ? 0 : bPinned ? 1 : 0.5
      const bShare = bPinned ? 0 : aPinned ? 1 : 0.5
      a.x -= dx * correction * aShare
      a.y -= dy * correction * aShare
      a.z -= dz * correction * aShare
      b.x += dx * correction * bShare
      b.y += dy * correction * bShare
      b.z += dz * correction * bShare
    }
  }

  const align = (root: SCNRopePoint, limb: SCNRopePoint, axis: SCNRopeAxis, span: number) => {
    limb.x += (root.x + axis.x * span - limb.x) * SCNRopeMetrics.terminalStiffness
    limb.y += (root.y + axis.y * span - limb.y) * SCNRopeMetrics.terminalStiffness
    limb.z += (root.z + axis.z * span - limb.z) * SCNRopeMetrics.terminalStiffness
  }

  const solveTerminals = () => {
    const head = points[0]
    const tail = points[count - 1]
    for (let step = 1; step <= SCNRopeMetrics.terminalSpan; step += 1) {
      const lead = points[step]
      if (head && lead) align(head, lead, anchorAxis, segmentLength * step)
      const trail = points[count - 1 - step]
      if (tail && trail) align(tail, trail, tailAxis, segmentLength * step)
    }
  }

  const solveSelfCollision = () => {
    const reach = thickness * 2
    const reachSquared = reach * reach
    if (reach <= 0) return
    for (let aIndex = 1; aIndex < count; aIndex += 1) {
      const a = points[aIndex]
      if (!a) continue
      for (
        let bIndex = aIndex + SCNRopeMetrics.selfCollisionSkip;
        bIndex < count;
        bIndex += 1
      ) {
        const b = points[bIndex]
        if (!b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const gapSquared = dx * dx + dy * dy + dz * dz
        if (gapSquared >= reachSquared || gapSquared <= 0) continue
        const distance = Math.sqrt(gapSquared)
        const correction =
          ((reach - distance) / distance) * SCNRopeMetrics.collisionStiffness * 0.5
        if (!isPinned(aIndex)) {
          a.x -= dx * correction
          a.y -= dy * correction
          a.z -= dz * correction
        }
        if (!isPinned(bIndex)) {
          b.x += dx * correction
          b.y += dy * correction
          b.z += dz * correction
        }
      }
    }
  }

  const solveTable = () => {
    const surface = tableZ + thickness
    for (let index = 1; index < count; index += 1) {
      const point = points[index]
      if (!point || point.z >= surface) continue
      point.z = surface
      point.pz = Math.min(point.pz, surface)
    }
  }

  const solveCollider = (point: SCNRopePoint, collider: SCNRopeCollider) => {
    const left = collider.left - thickness
    const right = collider.right + thickness
    const bottom = collider.bottom - thickness
    const top = collider.top + thickness
    const front = collider.front + thickness
    const back = collider.back - thickness
    if (
      point.x <= left ||
      point.x >= right ||
      point.y <= bottom ||
      point.y >= top ||
      point.z <= back ||
      point.z >= front
    ) {
      return
    }
    const distances = [
      { value: point.x - left, axis: 'x', target: left },
      { value: right - point.x, axis: 'x', target: right },
      { value: point.y - bottom, axis: 'y', target: bottom },
      { value: top - point.y, axis: 'y', target: top },
      { value: front - point.z, axis: 'z', target: front }
    ] as const
    let nearest: (typeof distances)[number] | undefined = distances[0]
    for (const distance of distances) {
      if (nearest && distance.value < nearest.value) nearest = distance
    }
    if (!nearest) return
    point[nearest.axis] +=
      (nearest.target - point[nearest.axis]) * SCNRopeMetrics.collisionStiffness
  }

  const solveColliders = () => {
    for (let index = 1; index < count - SCNRopeMetrics.terminalSpan; index += 1) {
      const point = points[index]
      if (!point) continue
      for (const collider of colliders) solveCollider(point, collider)
    }
  }

  const substep = (seconds: number) => {
    integrate(seconds)
    for (let pass = 0; pass < SCNRopeMetrics.solverIterations; pass += 1) {
      pin()
      solveTerminals()
      solveDistance()
      solveBend()
      solveColliders()
      solveTable()
    }
    solveSelfCollision()
    solveTable()
    pin()
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
    setTable: (z) => {
      tableZ = z
    },
    setThickness: (radius) => {
      thickness = radius
    },
    setColliders: (next) => {
      colliders = next
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
      return total / count / pixelsPerMillimetre
    }
  }
}
