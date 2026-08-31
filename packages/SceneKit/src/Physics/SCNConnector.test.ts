import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { scnMeasureConnector, scnSeatingProgress } from './SCNConnector.ts'

const sample = (
  tip: { x: number; y: number },
  direction: { x: number; y: number }
) =>
  scnMeasureConnector({
    tip,
    direction,
    target: { x: 100, y: 100 },
    insertionAxis: { x: 0, y: 1 },
    pixelsPerMillimetre: 2
  })

describe('Lightning connector guidance', () => {
  test('accepts a centred and aligned connector', () => {
    const alignment = sample({ x: 100, y: 100 }, { x: 0, y: 1 })
    assert.equal(alignment.guided, true)
    assert.equal(alignment.seatable, true)
    assert.equal(alignment.angleDegrees, 0)
  })

  test('guides a nearby connector without seating it early', () => {
    const alignment = sample({ x: 112, y: 100 }, { x: 0, y: 1 })
    assert.equal(alignment.guided, true)
    assert.equal(alignment.seatable, false)
    assert.equal(alignment.lateralMillimetres, 6)
  })

  test('rejects a connector that points across the port', () => {
    const alignment = sample({ x: 100, y: 100 }, { x: 1, y: 0 })
    assert.equal(alignment.guided, false)
    assert.equal(alignment.seatable, false)
  })

  test('uses a monotonic eased seating motion', () => {
    const progress = [0, 0.04, 0.08, 0.12, 0.16].map(scnSeatingProgress)
    assert.equal(progress[0], 0)
    assert.equal(progress.at(-1), 1)
    for (let index = 1; index < progress.length; index += 1) {
      assert.ok(progress[index]! > progress[index - 1]!)
    }
  })
})
