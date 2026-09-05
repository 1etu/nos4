export const CKPhotoProfile = {
  maximumDimension: 2560,
  jpegQuality: 0.92,
  saturation: 1.055,
  contrast: 1.045,
  blackLevel: 2,
  highlightCeiling: 250,
  redGain: 1.015,
  blueGain: 0.985,
  sharpening: 0.14,
  vignette: 0.055,
  grain: 0.8,
  shadowGrain: 1.1
} as const

const clamp = (value: number) => Math.min(255, Math.max(0, value))

export const ckApplyPhotoEffect = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray => {
  if (width < 1 || height < 1 || !Number.isInteger(width) || !Number.isInteger(height) ||
    pixels.length !== width * height * 4) throw new RangeError('Invalid photo dimensions.')
  const output = new Uint8ClampedArray(pixels.length)
  const profile = CKPhotoProfile
  let random = 2010
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4
      const r = pixels[offset]!
      const g = pixels[offset + 1]!
      const b = pixels[offset + 2]!
      const luminance = r * 0.299 + g * 0.587 + b * 0.114
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0
      const noise = (random / 4294967296 - 0.5) *
        (profile.grain + profile.shadowGrain * (1 - luminance / 255))
      const radius = ((x + 0.5) / width * 2 - 1) ** 2 + ((y + 0.5) / height * 2 - 1) ** 2
      const shade = 1 - profile.vignette * radius / 2
      const left = (y * width + Math.max(0, x - 1)) * 4
      const right = (y * width + Math.min(width - 1, x + 1)) * 4
      const top = (Math.max(0, y - 1) * width + x) * 4
      const bottom = (Math.min(height - 1, y + 1) * width + x) * 4
      for (let channel = 0; channel < 3; channel += 1) {
        const value = pixels[offset + channel]!
        const average = (pixels[left + channel]! + pixels[right + channel]! +
          pixels[top + channel]! + pixels[bottom + channel]!) / 4
        const detail = (value - average) * profile.sharpening
        const gain = channel === 0 ? profile.redGain : channel === 2 ? profile.blueGain : 1
        const color = (luminance + (value - luminance) * profile.saturation + detail) * gain
        const contrasted = clamp((color - 127.5) * profile.contrast + 127.5)
        const tone = profile.blackLevel + contrasted / 255 *
          (profile.highlightCeiling - profile.blackLevel)
        output[offset + channel] = clamp(tone * shade + noise)
      }
      output[offset + 3] = pixels[offset + 3]!
    }
  }
  return output
}
