import { BufferAttribute, BufferGeometry, Shape } from 'three'

export interface SCNShellRing {
  readonly depth: number
  readonly inset: number
}

const Quarter = Math.PI / 2

export const scnRoundedShape = (width: number, height: number, corner: number): Shape => {
  const shape = new Shape()
  const cx = width / 2 - corner
  const cy = height / 2 - corner
  shape.moveTo(cx + corner, -cy)
  shape.absarc(cx, cy, corner, 0, Quarter, false)
  shape.absarc(-cx, cy, corner, Quarter, Math.PI, false)
  shape.absarc(-cx, -cy, corner, Math.PI, Math.PI * 1.5, false)
  shape.absarc(cx, -cy, corner, Math.PI * 1.5, Math.PI * 2, false)
  return shape
}

const writeRing = (
  positions: Float32Array,
  uvs: Float32Array,
  base: number,
  halfWidth: number,
  halfHeight: number,
  corner: number,
  segments: number,
  depth: number,
  v: number
): void => {
  const total = segments * 4
  const cx = halfWidth - corner
  const cy = halfHeight - corner
  for (let i = 0; i <= total; i += 1) {
    const step = i % total
    const quadrant = Math.floor(step / segments)
    const angle = (quadrant - 1) * Quarter + ((step % segments) / segments) * Quarter
    const slot = (base + i) * 3
    positions[slot] = (quadrant < 2 ? cx : -cx) + Math.cos(angle) * corner
    positions[slot + 1] = (quadrant === 1 || quadrant === 2 ? cy : -cy) + Math.sin(angle) * corner
    positions[slot + 2] = -depth
    const pair = (base + i) * 2
    uvs[pair] = i / total
    uvs[pair + 1] = v
  }
}

const weldSeam = (normals: Float32Array, around: number, rings: number): void => {
  for (let ring = 0; ring < rings; ring += 1) {
    const first = ring * around * 3
    const last = first + (around - 1) * 3
    for (let axis = 0; axis < 3; axis += 1) {
      const mean = ((normals[first + axis] ?? 0) + (normals[last + axis] ?? 0)) / 2
      normals[first + axis] = mean
      normals[last + axis] = mean
    }
  }
}

export const scnShellGeometry = (
  width: number,
  height: number,
  corner: number,
  segments: number,
  rings: readonly SCNShellRing[]
): BufferGeometry => {
  const around = segments * 4 + 1
  const positions = new Float32Array(around * rings.length * 3)
  const uvs = new Float32Array(around * rings.length * 2)
  const span = rings.length - 1

  rings.forEach((ring, index) => {
    writeRing(
      positions,
      uvs,
      index * around,
      width / 2 - ring.inset,
      height / 2 - ring.inset,
      Math.max(corner - ring.inset, 0.01),
      segments,
      ring.depth,
      span > 0 ? index / span : 0
    )
  })

  const indices: number[] = []
  for (let ring = 1; ring < rings.length; ring += 1) {
    for (let i = 1; i < around; i += 1) {
      const a = (ring - 1) * around + i - 1
      const b = ring * around + i - 1
      const c = ring * around + i
      const d = (ring - 1) * around + i
      indices.push(a, b, d, b, c, d)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  const normals = geometry.getAttribute('normal')
  if (normals instanceof BufferAttribute && normals.array instanceof Float32Array) {
    weldSeam(normals.array, around, rings.length)
    normals.needsUpdate = true
  }
  return geometry
}

export const scnNormaliseUV = (
  geometry: BufferGeometry,
  width: number,
  height: number
): void => {
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < uv.count; i += 1) {
    uv.setXY(i, uv.getX(i) / width + 0.5, uv.getY(i) / height + 0.5)
  }
  uv.needsUpdate = true
}

export const scnCrownRings = (
  depth: number,
  fromInset: number,
  toInset: number,
  steps: number
): SCNShellRing[] => {
  const rings: SCNShellRing[] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Quarter
    rings.push({
      depth: depth * (1 - Math.cos(t)),
      inset: fromInset + (toInset - fromInset) * Math.sin(t)
    })
  }
  return rings
}

export const scnTuckRings = (
  fromDepth: number,
  depth: number,
  inset: number,
  steps: number
): SCNShellRing[] => {
  const rings: SCNShellRing[] = []
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Quarter
    rings.push({
      depth: fromDepth + depth * Math.sin(t),
      inset: inset * (1 - Math.cos(t))
    })
  }
  return rings
}
