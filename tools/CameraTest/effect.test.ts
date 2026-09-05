import { describe, expect, test } from 'bun:test'
import { ckApplyPhotoEffect } from '../../packages/CameraKit/src/Processing/CKPhotoEffect'

const solid = (width: number, height: number, value: number) => {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < pixels.length; i += 4) pixels.set([value, value, value, 255], i)
  return pixels
}

describe('CameraKit photo effect', () => {
  test('keeps the source, dimensions, and alpha intact', () => {
    const input = solid(32, 24, 128)
    input[3] = 17
    const original = input.slice()
    const output = ckApplyPhotoEffect(input, 32, 24)
    expect(input).toEqual(original)
    expect(output.length).toBe(input.length)
    for (let i = 3; i < output.length; i += 4) expect(output[i]).toBe(input[i])
  })

  test('uses stable grain for reproducible captures', () => {
    const input = solid(32, 32, 128)
    expect(ckApplyPhotoEffect(input, 32, 32)).toEqual(ckApplyPhotoEffect(input, 32, 32))
  })

  test('lifts midtones slightly and keeps them within a stop of the source', () => {
    const output = ckApplyPhotoEffect(solid(64, 64, 128), 64, 64)
    let sum = 0
    for (let i = 0; i < output.length; i += 4) sum += output[i + 1]!
    const mean = sum / (output.length / 4)
    expect(mean).toBeGreaterThan(128)
    expect(mean).toBeLessThan(160)
  })

  test('retains monotonic grayscale and clips whites like a phone JPEG', () => {
    let previous = -1
    for (let level = 0; level <= 255; level += 1) {
      const output = ckApplyPhotoEffect(solid(1, 1, level), 1, 1)
      expect(output[1]!).toBeGreaterThanOrEqual(previous - 1)
      previous = output[1]!
    }
    expect(ckApplyPhotoEffect(solid(1, 1, 255), 1, 1)[1]!).toBeGreaterThanOrEqual(250)
  })

  test('adds more grain in shadows than in highlights', () => {
    const spread = (level: number) => {
      const output = ckApplyPhotoEffect(solid(64, 64, level), 64, 64)
      let total = 0
      for (let i = 4; i < output.length; i += 4) total += Math.abs(output[i + 1]! - output[i - 3]!)
      return total / (output.length / 4 - 1)
    }
    expect(spread(40)).toBeGreaterThan(spread(200) * 1.5)
  })

  test('keeps a mild warm balance and slight corner falloff', () => {
    const output = ckApplyPhotoEffect(solid(64, 64, 128), 64, 64)
    const center = (32 * 64 + 32) * 4
    expect(output[center]!).toBeGreaterThan(output[center + 2]!)
    expect(output[center + 1]! - output[1]!).toBeGreaterThan(0)
    expect(output[center + 1]! - output[1]!).toBeLessThan(12)
  })

  test('rejects invalid pixel buffers', () => {
    expect(() => ckApplyPhotoEffect(new Uint8ClampedArray(4), 2, 2)).toThrow(RangeError)
    expect(() => ckApplyPhotoEffect(new Uint8ClampedArray(), 0, 1)).toThrow(RangeError)
    expect(() => ckApplyPhotoEffect(new Uint8ClampedArray(4), 1.5, 1)).toThrow(RangeError)
  })
})
