import {
  DataTexture,
  EquirectangularReflectionMapping,
  FloatType,
  PMREMGenerator,
  RGBAFormat,
  type Texture,
  type WebGLRenderer
} from 'three'

interface SCNSoftbox {
  readonly u: number
  readonly v: number
  readonly halfU: number
  readonly halfV: number
  readonly edge: number
  readonly level: number
  readonly warmth: number
}

const EnvironmentWidth = 512
const EnvironmentHeight = 256

const Sky = {
  zenith: 0.82,
  horizon: 0.4,
  ground: 0.08,
  horizonFalloff: 2.6,
  groundFalloff: 1.9
} as const

const Softboxes: readonly SCNSoftbox[] = [
  { u: 0.836, v: 0.705, halfU: 0.09, halfV: 0.08, edge: 0.055, level: 7.4, warmth: 0.035 },
  { u: 0.598, v: 0.566, halfU: 0.055, halfV: 0.12, edge: 0.07, level: 2.4, warmth: -0.05 },
  { u: 0.046, v: 0.548, halfU: 0.048, halfV: 0.1, edge: 0.065, level: 1.7, warmth: -0.07 },
  { u: 0.262, v: 0.638, halfU: 0.16, halfV: 0.11, edge: 0.11, level: 1, warmth: -0.02 }
]

const smoothEdge = (value: number, half: number, edge: number): number => {
  const t = (value - (half - edge)) / (edge * 2)
  if (t <= 0) return 1
  if (t >= 1) return 0
  return 1 - t * t * (3 - 2 * t)
}

const skyLevel = (v: number): number => {
  if (v >= 0.5) {
    const t = (v - 0.5) * 2
    return Sky.horizon + (Sky.zenith - Sky.horizon) * Math.pow(t, 1 / Sky.horizonFalloff)
  }
  const t = 1 - v * 2
  return Sky.horizon + (Sky.ground - Sky.horizon) * Math.pow(t, 1 / Sky.groundFalloff)
}

const scnEnvironmentTexture = (): DataTexture => {
  const data = new Float32Array(EnvironmentWidth * EnvironmentHeight * 4)
  for (let row = 0; row < EnvironmentHeight; row += 1) {
    const v = (row + 0.5) / EnvironmentHeight
    const sky = skyLevel(v)
    for (let column = 0; column < EnvironmentWidth; column += 1) {
      const u = (column + 0.5) / EnvironmentWidth
      let red = sky
      let green = sky
      let blue = sky
      for (const box of Softboxes) {
        const spread = Math.abs(u - box.u)
        const wrapped = Math.min(spread, 1 - spread)
        const mask =
          smoothEdge(wrapped, box.halfU, box.edge) *
          smoothEdge(Math.abs(v - box.v), box.halfV, box.edge)
        if (mask <= 0) continue
        const level = box.level * mask
        red += level * (1 + box.warmth)
        green += level
        blue += level * (1 - box.warmth)
      }
      const slot = (row * EnvironmentWidth + column) * 4
      data[slot] = red
      data[slot + 1] = green
      data[slot + 2] = blue
      data[slot + 3] = 1
    }
  }
  const texture = new DataTexture(data, EnvironmentWidth, EnvironmentHeight, RGBAFormat, FloatType)
  texture.mapping = EquirectangularReflectionMapping
  texture.needsUpdate = true
  return texture
}

export const scnMakeEnvironment = (renderer: WebGLRenderer): Texture => {
  const source = scnEnvironmentTexture()
  const generator = new PMREMGenerator(renderer)
  const environment = generator.fromEquirectangular(source).texture
  source.dispose()
  generator.dispose()
  return environment
}
