import { readFile, writeFile } from 'node:fs/promises'
import { ckApplyPhotoEffect } from '../../packages/CameraKit/src/Processing/CKPhotoEffect'

const path = process.argv[2]
if (!path) throw new Error('Supply a BMP fixture.')
const source = await readFile(path)
const offset = source.readUInt32LE(10)
const width = source.readInt32LE(18)
const height = source.readInt32LE(22)
if (source.toString('ascii', 0, 2) !== 'BM' || source.readUInt16LE(28) !== 32 ||
  source.readUInt32LE(30) !== 0 || width <= 0 || height <= 0) throw new Error('Use a 32-bit BMP fixture.')
const pixels = new Uint8ClampedArray(width * height * 4)
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const src = offset + ((height - 1 - y) * width + x) * 4
    const dst = (y * width + x) * 4
    pixels.set([source[src + 2]!, source[src + 1]!, source[src]!, 255], dst)
  }
}
const started = performance.now()
const processed = ckApplyPhotoEffect(pixels, width, height)
const milliseconds = performance.now() - started
const output = Buffer.from(source)
let difference = 0
let maximumDifference = 0
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const src = (y * width + x) * 4
    const dst = offset + ((height - 1 - y) * width + x) * 4
    output.set([processed[src + 2]!, processed[src + 1]!, processed[src]!, 255], dst)
    for (let c = 0; c < 3; c += 1) {
      const change = Math.abs(processed[src + c]! - pixels[src + c]!)
      difference += change
      maximumDifference = Math.max(maximumDifference, change)
    }
  }
}
await writeFile(path.replace('.bmp', '-effect.bmp'), output)
await writeFile(path.replace('.bmp', '-metrics.json'), JSON.stringify({
  width, height, milliseconds, meanAbsoluteChange: difference / (width * height * 3), maximumDifference
}, null, 2))
