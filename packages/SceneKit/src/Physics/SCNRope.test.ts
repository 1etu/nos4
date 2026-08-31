import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { SCNRopeMetrics } from './SCNPhysicsMetrics.ts'
import { scnMakeRope } from './SCNRope.ts'

const settle = (steps = 360) => {
  const pixelsPerMillimetre = 2
  const length = 640
  const rope = scnMakeRope(length, pixelsPerMillimetre)
  rope.setTable(-12)
  rope.setThickness(2)
  rope.setAnchor(0, 0, 8)
  rope.setAnchorAxis({ x: 1, y: 0, z: 0 })
  rope.setTail(500, 0, 8)
  rope.setTailAxis({ x: -1, y: 0, z: 0 })
  rope.holdTail(true)
  rope.lockTail(true)
  rope.reset(0, 0, 8, 500, 0, 8)
  for (let index = 0; index < steps; index += 1) rope.step(1000 / 120)
  return rope
}

describe('tabletop cable physics', () => {
  test('keeps both terminals fixed and all cable points above the table', () => {
    const rope = settle()
    const head = rope.points[0]!
    const tail = rope.points.at(-1)!
    assert.deepEqual({ x: head.x, y: head.y, z: head.z }, { x: 0, y: 0, z: 8 })
    assert.deepEqual({ x: tail.x, y: tail.y, z: tail.z }, { x: 500, y: 0, z: 8 })
    assert.ok(rope.points.every((point) => point.z >= -10 - 1e-6))
  })

  test('preserves segment length without sharp solver folds', () => {
    const rope = settle()
    let maximumStretch = 0
    let minimumOuterSpan = Number.POSITIVE_INFINITY
    for (let index = 1; index < rope.points.length; index += 1) {
      const a = rope.points[index - 1]!
      const b = rope.points[index]!
      maximumStretch = Math.max(
        maximumStretch,
        Math.abs(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) - rope.segmentLength) /
          rope.segmentLength
      )
      const outer = rope.points[index + 1]
      if (outer) {
        minimumOuterSpan = Math.min(
          minimumOuterSpan,
          Math.hypot(outer.x - a.x, outer.y - a.y, outer.z - a.z)
        )
      }
    }
    const maximumTurn = Math.min(
      rope.segmentLength / (SCNRopeMetrics.minimumBendRadiusMillimetres * 2),
      Math.PI * 0.46
    )
    const requiredOuterSpan = rope.segmentLength * 2 * Math.cos(maximumTurn / 2)
    assert.ok(maximumStretch < 0.08, `segment stretch was ${maximumStretch}`)
    assert.ok(
      minimumOuterSpan > requiredOuterSpan * 0.84,
      `outer span was ${minimumOuterSpan}, expected at least ${requiredOuterSpan * 0.84}`
    )
  })
})
