import {
  DoubleSide,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  ShadowMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
  type WebGLRenderer
} from 'three'
import { scnMakeSocketLegend, scnMakeUSBMark } from './SCNMarkings'

export const SCNPalette = {
  cableWhite: 0xffffff,
  housingWhite: 0xffffff,
  socketWhite: 0xffffff,
  socketWell: 0xcfcabd,
  nickel: 0xd2d4d8,
  gold: 0xcaa246,
  brass: 0xa88f56,
  cavity: 0x1d1d1f,
  shadow: 0x1a1a20
} as const

const SceneAsset = {
  cableAlbedo: 'scene/cable-albedo.jpg',
  cableNormal: 'scene/cable-normal.jpg',
  cableRoughness: 'scene/cable-roughness.jpg',
  plasticAlbedo: 'scene/plastic-albedo.jpg',
  plasticNormal: 'scene/plastic-normal.jpg',
  plasticRoughness: 'scene/plastic-roughness.jpg',
  socketAlbedo: 'scene/socket-albedo.jpg',
  socketNormal: 'scene/socket-normal.jpg',
  socketRoughness: 'scene/socket-roughness.jpg',
  metalAlbedo: 'scene/metal-albedo.jpg',
  metalNormal: 'scene/metal-normal.jpg',
  metalRoughness: 'scene/metal-roughness.jpg'
} as const

const CableTileMillimetres = 28
const PlasticTileMillimetres = 38
const SocketTileMillimetres = 86
const MetalTileMillimetres = 16
const CableNormalScale = 0.44
const PlasticNormalScale = 0.32
const SocketNormalScale = 0.6
const MetalNormalScale = 0.42

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
    clearcoat: 0.08,
    clearcoatRoughness: 0.48,
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
    color: 0xffffff,
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
  albedo: Texture | null,
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
  if (albedo) {
    const color = albedo.clone()
    color.repeat.setScalar(tiles)
    color.colorSpace = SRGBColorSpace
    color.needsUpdate = true
    material.map = color
  }
  material.needsUpdate = true
}

export const scnLoadSurfaces = (
  renderer: WebGLRenderer,
  materials: SCNMaterials,
  onReady: () => void
): void => {
  const loader = new TextureLoader()
  const anisotropy = renderer.capabilities.getMaxAnisotropy()

  const load = (path: string, color = false): Promise<Texture> =>
    new Promise((resolve) => {
      loader.load(sceneURL(path), (texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.anisotropy = anisotropy
        if (color) texture.colorSpace = SRGBColorSpace
        resolve(texture)
      })
    })

  Promise.all([
    load(SceneAsset.cableAlbedo, true),
    load(SceneAsset.cableNormal),
    load(SceneAsset.cableRoughness),
    load(SceneAsset.plasticAlbedo, true),
    load(SceneAsset.plasticNormal),
    load(SceneAsset.plasticRoughness),
    load(SceneAsset.socketAlbedo, true),
    load(SceneAsset.socketNormal),
    load(SceneAsset.socketRoughness),
    load(SceneAsset.metalAlbedo, true),
    load(SceneAsset.metalNormal),
    load(SceneAsset.metalRoughness)
  ]).then(
    ([
      cableAlbedo,
      cableNormal,
      cableRoughness,
      plasticAlbedo,
      plasticNormal,
      plasticRoughness,
      socketAlbedo,
      socketNormal,
      socketRoughness,
      metalAlbedo,
      metalNormal,
      metalRoughness
    ]) => {
      const rubber = (material: SCNSurfaceMaterial, span: number) =>
        applySurface(
          material,
          cableAlbedo,
          cableNormal,
          cableRoughness,
          span / CableTileMillimetres,
          CableNormalScale
        )
      const polished = (material: SCNSurfaceMaterial, span: number) =>
        applySurface(
          material,
          plasticAlbedo,
          plasticNormal,
          plasticRoughness,
          span / PlasticTileMillimetres,
          PlasticNormalScale
        )
      const moulded = (
        material: SCNSurfaceMaterial,
        span: number,
        color: Texture | null = socketAlbedo
      ) =>
        applySurface(
          material,
          color,
          socketNormal,
          socketRoughness,
          span / SocketTileMillimetres,
          SocketNormalScale
        )
      const machined = (
        material: SCNSurfaceMaterial,
        span: number,
        color: Texture | null = null
      ) =>
        applySurface(
          material,
          color,
          metalNormal,
          metalRoughness,
          span / MetalTileMillimetres,
          MetalNormalScale
        )

      rubber(materials.cable, SurfaceSpanMillimetres.cable)
      polished(materials.housing, SurfaceSpanMillimetres.housing)
      moulded(materials.socket, SurfaceSpanMillimetres.socket)
      moulded(materials.socketWell, SurfaceSpanMillimetres.socketWell)
      moulded(materials.socketFloor, SurfaceSpanMillimetres.socketFloor, null)
      machined(materials.nickel, SurfaceSpanMillimetres.nickel, metalAlbedo)
      machined(materials.gold, SurfaceSpanMillimetres.gold)
      machined(materials.brass, SurfaceSpanMillimetres.brass)
      onReady()
    }
  )
}
