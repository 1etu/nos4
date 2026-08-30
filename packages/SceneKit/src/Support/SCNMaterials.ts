import {
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShadowMaterial,
  TextureLoader,
  type Texture,
  type WebGLRenderer
} from 'three'
import { scnMakeSocketLegend, scnMakeUSBMark } from './SCNMarkings'

export const SCNPalette = {
  cableWhite: 0xeeece7,
  housingWhite: 0xf1f0ec,
  socketWhite: 0xe9e6dd,
  socketWell: 0xcfcabd,
  nickel: 0xd2d4d8,
  gold: 0xcaa246,
  brass: 0xa88f56,
  cavity: 0x1d1d1f,
  shadow: 0x1a1a20
} as const

const SceneAsset = {
  plasticNormal: 'scene/plastic-normal.jpg',
  plasticRoughness: 'scene/plastic-roughness.jpg',
  socketNormal: 'scene/socket-normal.jpg',
  socketRoughness: 'scene/socket-roughness.jpg',
  metalNormal: 'scene/metal-normal.jpg',
  metalRoughness: 'scene/metal-roughness.jpg'
} as const

const PlasticTileMillimetres = 45
const SocketTileMillimetres = 130
const MetalTileMillimetres = 20
const PlasticNormalScale = 1.1
const SocketNormalScale = 2.2
const MetalNormalScale = 0.9

const SurfaceSpanMillimetres = {
  cable: 44,
  housing: 26,
  socket: 190,
  socketWell: 52,
  socketFloor: 52,
  nickel: 20,
  gold: 6,
  brass: 12
} as const

const sceneURL = (path: string): string => `${import.meta.env.BASE_URL}${path}`

export const scnMakeMaterials = () => ({
  cable: new MeshPhysicalMaterial({
    color: SCNPalette.cableWhite,
    roughness: 0.44,
    metalness: 0,
    clearcoat: 0.28,
    clearcoatRoughness: 0.34,
    envMapIntensity: 0.9
  }),
  housing: new MeshPhysicalMaterial({
    color: SCNPalette.housingWhite,
    roughness: 0.3,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.17,
    envMapIntensity: 1
  }),
  socket: new MeshPhysicalMaterial({
    color: SCNPalette.socketWhite,
    roughness: 0.47,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.28,
    envMapIntensity: 0.92,
    side: DoubleSide
  }),
  socketWell: new MeshPhysicalMaterial({
    color: SCNPalette.socketWell,
    roughness: 0.63,
    metalness: 0,
    clearcoat: 0.16,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.72,
    side: DoubleSide
  }),
  socketFloor: new MeshPhysicalMaterial({
    color: SCNPalette.socketWell,
    map: scnMakeSocketLegend(),
    roughness: 0.66,
    metalness: 0,
    clearcoat: 0.14,
    clearcoatRoughness: 0.42,
    envMapIntensity: 0.7
  }),
  nickel: new MeshStandardMaterial({
    color: SCNPalette.nickel,
    roughness: 0.26,
    metalness: 1,
    envMapIntensity: 1.1
  }),
  gold: new MeshStandardMaterial({
    color: SCNPalette.gold,
    roughness: 0.29,
    metalness: 1,
    envMapIntensity: 1.05
  }),
  brass: new MeshStandardMaterial({
    color: SCNPalette.brass,
    roughness: 0.44,
    metalness: 1,
    envMapIntensity: 0.85,
    side: DoubleSide
  }),
  cavity: new MeshStandardMaterial({
    color: SCNPalette.cavity,
    roughness: 0.94,
    metalness: 0.1,
    envMapIntensity: 0.35,
    side: DoubleSide
  }),
  mark: new MeshStandardMaterial({
    map: scnMakeUSBMark(),
    transparent: true,
    roughness: 0.44,
    metalness: 0,
    envMapIntensity: 0.6,
    polygonOffset: true,
    polygonOffsetFactor: -2
  }),
  shadow: new ShadowMaterial({ color: SCNPalette.shadow, transparent: true })
})

export type SCNMaterials = ReturnType<typeof scnMakeMaterials>

type SCNSurfaceMaterial = MeshStandardMaterial | MeshPhysicalMaterial

const applySurface = (
  material: SCNSurfaceMaterial,
  normal: Texture,
  roughness: Texture,
  tiles: number,
  normalScale: number
): void => {
  const grain = normal.clone()
  grain.repeat.setScalar(tiles)
  grain.needsUpdate = true
  const sheen = roughness.clone()
  sheen.repeat.setScalar(tiles)
  sheen.needsUpdate = true
  material.normalMap = grain
  material.normalScale.setScalar(normalScale)
  material.roughnessMap = sheen
  material.needsUpdate = true
}

export const scnLoadSurfaces = (
  renderer: WebGLRenderer,
  materials: SCNMaterials,
  onReady: () => void
): void => {
  const loader = new TextureLoader()
  const anisotropy = renderer.capabilities.getMaxAnisotropy()

  const load = (path: string): Promise<Texture> =>
    new Promise((resolve) => {
      loader.load(sceneURL(path), (texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.anisotropy = anisotropy
        resolve(texture)
      })
    })

  Promise.all([
    load(SceneAsset.plasticNormal),
    load(SceneAsset.plasticRoughness),
    load(SceneAsset.socketNormal),
    load(SceneAsset.socketRoughness),
    load(SceneAsset.metalNormal),
    load(SceneAsset.metalRoughness)
  ]).then(
    ([
      plasticNormal,
      plasticRoughness,
      socketNormal,
      socketRoughness,
      metalNormal,
      metalRoughness
    ]) => {
      const polished = (material: SCNSurfaceMaterial, span: number) =>
        applySurface(
          material,
          plasticNormal,
          plasticRoughness,
          span / PlasticTileMillimetres,
          PlasticNormalScale
        )
      const moulded = (material: SCNSurfaceMaterial, span: number) =>
        applySurface(
          material,
          socketNormal,
          socketRoughness,
          span / SocketTileMillimetres,
          SocketNormalScale
        )
      const machined = (material: SCNSurfaceMaterial, span: number) =>
        applySurface(
          material,
          metalNormal,
          metalRoughness,
          span / MetalTileMillimetres,
          MetalNormalScale
        )

      polished(materials.cable, SurfaceSpanMillimetres.cable)
      polished(materials.housing, SurfaceSpanMillimetres.housing)
      moulded(materials.socket, SurfaceSpanMillimetres.socket)
      moulded(materials.socketWell, SurfaceSpanMillimetres.socketWell)
      moulded(materials.socketFloor, SurfaceSpanMillimetres.socketFloor)
      machined(materials.nickel, SurfaceSpanMillimetres.nickel)
      machined(materials.gold, SurfaceSpanMillimetres.gold)
      machined(materials.brass, SurfaceSpanMillimetres.brass)
      onReady()
    }
  )
}
