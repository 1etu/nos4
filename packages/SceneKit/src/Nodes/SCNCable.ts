import {
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Mesh,
  Vector3,
  type Material
} from 'three'
import type { SCNRopePoint } from '../Physics/SCNRope'
import { SCNCableMetrics } from '../Support/SCNHardwareMetrics'

const RadialSegments = SCNCableMetrics.radialSegments

export interface SCNCable {
  readonly mesh: Mesh
  update: (points: readonly SCNRopePoint[], radius: number) => void
}

const ring = (count: number): { sin: Float32Array; cos: Float32Array } => {
  const sin = new Float32Array(count + 1)
  const cos = new Float32Array(count + 1)
  for (let i = 0; i <= count; i += 1) {
    const angle = (i / count) * Math.PI * 2
    sin[i] = Math.sin(angle)
    cos[i] = -Math.cos(angle)
  }
  return { sin, cos }
}

export const scnMakeCable = (material: Material, tubularSegments: number): SCNCable => {
  const geometry = new BufferGeometry()
  const vertexCount = (tubularSegments + 1) * (RadialSegments + 1)
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)
  const wheel = ring(RadialSegments)

  for (let j = 0; j <= tubularSegments; j += 1) {
    for (let i = 0; i <= RadialSegments; i += 1) {
      const slot = ((RadialSegments + 1) * j + i) * 2
      uvs[slot] = i / RadialSegments
      uvs[slot + 1] = j / tubularSegments
    }
  }

  const indices: number[] = []
  for (let j = 1; j <= tubularSegments; j += 1) {
    for (let i = 1; i <= RadialSegments; i += 1) {
      const a = (RadialSegments + 1) * (j - 1) + (i - 1)
      const b = (RadialSegments + 1) * j + (i - 1)
      const c = (RadialSegments + 1) * j + i
      const d = (RadialSegments + 1) * (j - 1) + i
      indices.push(a, b, d, b, c, d)
    }
  }

  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new BufferAttribute(normals, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))

  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.castShadow = true
  mesh.receiveShadow = true

  const spine: Vector3[] = []
  const curve = new CatmullRomCurve3(spine, false, 'centripetal', 0.5)
  const centre = new Vector3()
  const fallback = new Vector3(0, 0, 1)

  return {
    mesh,
    update: (points, radius) => {
      while (spine.length < points.length) spine.push(new Vector3())
      spine.length = points.length
      points.forEach((point, index) => {
        spine[index]?.set(point.x, point.y, point.z)
      })
      curve.updateArcLengths()
      const frames = curve.computeFrenetFrames(tubularSegments, false)

      for (let j = 0; j <= tubularSegments; j += 1) {
        curve.getPointAt(j / tubularSegments, centre)
        const normal = frames.normals[j] ?? fallback
        const binormal = frames.binormals[j] ?? fallback
        for (let i = 0; i <= RadialSegments; i += 1) {
          const sin = wheel.sin[i] ?? 0
          const cos = wheel.cos[i] ?? 0
          const nx = cos * normal.x + sin * binormal.x
          const ny = cos * normal.y + sin * binormal.y
          const nz = cos * normal.z + sin * binormal.z
          const slot = ((RadialSegments + 1) * j + i) * 3
          normals[slot] = nx
          normals[slot + 1] = ny
          normals[slot + 2] = nz
          positions[slot] = centre.x + radius * nx
          positions[slot + 1] = centre.y + radius * ny
          positions[slot + 2] = centre.z + radius * nz
        }
      }

      geometry.getAttribute('position').needsUpdate = true
      geometry.getAttribute('normal').needsUpdate = true
      geometry.computeBoundingSphere()
    }
  }
}
