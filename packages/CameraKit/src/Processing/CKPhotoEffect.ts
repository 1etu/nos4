export const CKPhotoProfile = {
  sensorWidth: 3264,
  sensorHeight: 2448,
  upscaleThreshold: 1600,
  jpegQuality: 0.88,
  exposure: 1.04,
  redGain: 1.03,
  greenGain: 1.005,
  blueGain: 0.955,
  toeDepth: 0.16,
  toeWidth: 0.3,
  shoulderStart: 0.8,
  shoulderCurve: 1.4,
  saturation: 1.06,
  chromaBlurRadius: 2,
  sharpenAmount: 0.55,
  sharpenThreshold: 3,
  lumaNoise: 1.6,
  shadowNoise: 3.6,
  highlightNoise: 0.8,
  chromaNoise: 1.6,
  vignette: 0.06,
  grainSeed: 2013
} as const

const NoiseSpread = 2.45

const toneTable = (gain: number): Uint8ClampedArray => {
  const table = new Uint8ClampedArray(256)
  const { exposure, toeDepth, toeWidth, shoulderStart, shoulderCurve } = CKPhotoProfile
  const shoulderScale = Math.tanh(shoulderCurve)
  for (let value = 0; value < 256; value += 1) {
    let x = (value / 255) * gain * exposure
    x *= 1 - toeDepth * (1 - Math.min(1, x / toeWidth))
    if (x > shoulderStart) {
      const span = 1 - shoulderStart
      x = shoulderStart + span * Math.tanh((shoulderCurve * (x - shoulderStart)) / span) / shoulderScale
    }
    table[value] = Math.round(Math.min(1, Math.max(0, x)) * 255)
  }
  return table
}

const tables = {
  red: toneTable(CKPhotoProfile.redGain),
  green: toneTable(CKPhotoProfile.greenGain),
  blue: toneTable(CKPhotoProfile.blueGain)
}

const makeNoise = (seed: number) => {
  let state = seed >>> 0
  const uniform = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
  return () => (uniform() + uniform() - 1) * NoiseSpread
}

const noiseSigma = (luminance: number): number => {
  const { shadowNoise, lumaNoise, highlightNoise } = CKPhotoProfile
  if (luminance < 128) return shadowNoise + (lumaNoise - shadowNoise) * (luminance / 128)
  return lumaNoise + (highlightNoise - lumaNoise) * ((luminance - 128) / 127)
}

const boxBlur = (plane: Int16Array, scratch: Int16Array, width: number, height: number, radius: number) => {
  const taps = radius * 2 + 1
  for (let y = 0; y < height; y += 1) {
    const row = y * width
    for (let x = 0; x < width; x += 1) {
      let sum = 0
      for (let k = -radius; k <= radius; k += 1) {
        sum += plane[row + Math.min(width - 1, Math.max(0, x + k))]!
      }
      scratch[row + x] = Math.round(sum / taps)
    }
  }
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      let sum = 0
      for (let k = -radius; k <= radius; k += 1) {
        sum += scratch[Math.min(height - 1, Math.max(0, y + k)) * width + x]!
      }
      plane[y * width + x] = Math.round(sum / taps)
    }
  }
}

const gaussianBlur3 = (plane: Int16Array, scratch: Int16Array, width: number, height: number) => {
  for (let y = 0; y < height; y += 1) {
    const row = y * width
    for (let x = 0; x < width; x += 1) {
      const left = plane[row + Math.max(0, x - 1)]!
      const right = plane[row + Math.min(width - 1, x + 1)]!
      scratch[row + x] = (left + 2 * plane[row + x]! + right) / 4
    }
  }
  for (let y = 0; y < height; y += 1) {
    const above = Math.max(0, y - 1) * width
    const below = Math.min(height - 1, y + 1) * width
    const row = y * width
    for (let x = 0; x < width; x += 1) {
      plane[row + x] = (scratch[above + x]! + 2 * scratch[row + x]! + scratch[below + x]!) / 4
    }
  }
}

export const ckApplyPhotoEffect = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Uint8ClampedArray => {
  if (width < 1 || height < 1 || !Number.isInteger(width) || !Number.isInteger(height) ||
    pixels.length !== width * height * 4) throw new RangeError('Invalid photo dimensions.')
  const profile = CKPhotoProfile
  const count = width * height
  const luma = new Int16Array(count)
  const cb = new Int16Array(count)
  const cr = new Int16Array(count)
  const scratch = new Int16Array(count)
  const noise = makeNoise(profile.grainSeed)

  for (let i = 0; i < count; i += 1) {
    const offset = i * 4
    const r = tables.red[pixels[offset]!]!
    const g = tables.green[pixels[offset + 1]!]!
    const b = tables.blue[pixels[offset + 2]!]!
    const y = 0.299 * r + 0.587 * g + 0.114 * b
    luma[i] = Math.round(y)
    cb[i] = Math.round((b - y) * 0.564 * profile.saturation + noise() * profile.chromaNoise)
    cr[i] = Math.round((r - y) * 0.713 * profile.saturation + noise() * profile.chromaNoise)
  }

  boxBlur(cb, scratch, width, height, profile.chromaBlurRadius)
  boxBlur(cr, scratch, width, height, profile.chromaBlurRadius)

  const blurred = Int16Array.from(luma)
  gaussianBlur3(blurred, scratch, width, height)
  for (let i = 0; i < count; i += 1) {
    const detail = luma[i]! - blurred[i]!
    if (Math.abs(detail) > profile.sharpenThreshold) {
      luma[i] = Math.round(luma[i]! + detail * profile.sharpenAmount)
    }
  }

  const output = new Uint8ClampedArray(pixels.length)
  for (let y = 0; y < height; y += 1) {
    const vertical = ((y + 0.5) / height) * 2 - 1
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x
      const horizontal = ((x + 0.5) / width) * 2 - 1
      const radius = horizontal * horizontal + vertical * vertical
      const shade = 1 - (profile.vignette * radius) / 2
      const level = Math.min(255, Math.max(0, luma[i]!))
      const bright = (luma[i]! + noise() * noiseSigma(level)) * shade
      const offset = i * 4
      output[offset] = bright + 1.402 * cr[i]!
      output[offset + 1] = bright - 0.344136 * cb[i]! - 0.714136 * cr[i]!
      output[offset + 2] = bright + 1.772 * cb[i]!
      output[offset + 3] = pixels[offset + 3]!
    }
  }
  return output
}
