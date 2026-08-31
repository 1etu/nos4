import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { scnTerminalOcclusionSplit } from './SCNCableOcclusion.ts'

const points = Array.from({ length: 10 }, (_, x) => ({ x, y: 0 }))

describe('terminal cable occlusion split', () => {
  test('starts the foreground span before the arm boundary', () => {
    const split = scnTerminalOcclusionSplit(points, (point) => point.x >= 6, 2)
    assert.equal(split, 4)
    assert.deepEqual(points.slice(split)[0], points[split!])
  })

  test('keeps the whole cable in the rear layer when the terminal is clear', () => {
    assert.equal(scnTerminalOcclusionSplit(points, (point) => point.x === 4), undefined)
  })

  test('foregrounds the full cable when the whole terminal run is occluded', () => {
    assert.equal(scnTerminalOcclusionSplit(points, () => true), 0)
  })
})
