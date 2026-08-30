import { LatheGeometry, Mesh, Vector2, type Material } from 'three'

const ProfileSamples = 18

export const scnMakeStrainRelief = (
  material: Material,
  length: number,
  rootRadius: number,
  tipRadius: number,
  ease: number,
  segments: number
): Mesh => {
  const profile = [new Vector2(0, 0)]
  for (let i = 0; i <= ProfileSamples; i += 1) {
    const t = i / ProfileSamples
    profile.push(
      new Vector2(tipRadius + (rootRadius - tipRadius) * Math.pow(1 - t, ease), length * t)
    )
  }
  profile.push(new Vector2(0, length))
  const mesh = new Mesh(new LatheGeometry(profile, segments), material)
  mesh.castShadow = true
  return mesh
}
