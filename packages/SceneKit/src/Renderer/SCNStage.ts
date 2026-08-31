import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  NeutralToneMapping,
  OrthographicCamera,
  PCFSoftShadowMap,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material
} from 'three'
import { scnMakeEnvironment } from '../Support/SCNEnvironment'
import { SCNRendererMetrics } from './SCNRendererMetrics'

export interface SCNStage {
  readonly renderer: WebGLRenderer
  readonly scene: Scene
  readonly camera: OrthographicCamera
  resize: (width: number, height: number, backPlane: number) => void
  projectToPlane: (x: number, y: number, z: number, target: Vector3) => Vector3
  render: () => void
  dispose: () => void
}

export const scnMakeStage = (
  canvas: HTMLCanvasElement,
  shadow: Material,
  catchesShadows = true
): SCNStage => {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearAlpha(0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = SCNRendererMetrics.toneExposure
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  scene.environment = scnMakeEnvironment(renderer)
  scene.environmentIntensity = SCNRendererMetrics.environmentIntensity

  const camera = new OrthographicCamera()
  const key = new DirectionalLight(0xffffff, SCNRendererMetrics.keyLight.intensity)
  key.castShadow = true
  key.shadow.mapSize.setScalar(SCNRendererMetrics.shadowMapSize)
  key.shadow.radius = SCNRendererMetrics.shadowRadius
  key.shadow.bias = SCNRendererMetrics.shadowBias
  key.shadow.normalBias = SCNRendererMetrics.shadowNormalBias

  const fill = new DirectionalLight(0xffffff, SCNRendererMetrics.fillLight.intensity)
  const rim = new DirectionalLight(0xffffff, SCNRendererMetrics.rimLight.intensity)
  scene.add(key, key.target, fill, fill.target, rim, rim.target)
  scene.add(new AmbientLight(0xffffff, SCNRendererMetrics.ambientIntensity))

  const catcher = new Mesh(new PlaneGeometry(1, 1), shadow)
  catcher.receiveShadow = true
  if (catchesShadows) scene.add(catcher)

  const focus = new Vector3()
  const pointer = new Vector2()
  const raycaster = new Raycaster()
  let viewportWidth = 1
  let viewportHeight = 1

  const frameCamera = (width: number, height: number) => {
    const distance = height * SCNRendererMetrics.cameraReach
    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.near = distance * SCNRendererMetrics.cameraNearFactor
    camera.far = distance * SCNRendererMetrics.cameraFarFactor
    camera.position.set(width / 2, height / 2, distance)
    camera.updateProjectionMatrix()
  }

  const throwLight = (
    light: DirectionalLight,
    source: { x: number; y: number; z: number },
    reach: number
  ) => {
    light.target.position.copy(focus)
    light.position.set(
      focus.x + source.x * reach,
      focus.y + source.y * reach,
      focus.z + source.z * reach
    )
  }

  const castLight = (width: number, height: number, backPlane: number) => {
    const span = Math.max(width, height)
    const reach = span * SCNRendererMetrics.shadowReach
    const half = (span * SCNRendererMetrics.shadowMargin) / 2
    focus.set(width / 2, height / 2, backPlane * SCNRendererMetrics.lightFocusDepth)

    throwLight(key, SCNRendererMetrics.keyLight, reach)
    throwLight(fill, SCNRendererMetrics.fillLight, reach)
    throwLight(rim, SCNRendererMetrics.rimLight, reach)

    key.shadow.camera.left = -half
    key.shadow.camera.right = half
    key.shadow.camera.top = half
    key.shadow.camera.bottom = -half
    key.shadow.camera.near = reach * SCNRendererMetrics.shadowNearFactor
    key.shadow.camera.far = reach * SCNRendererMetrics.shadowFarFactor
    key.shadow.camera.updateProjectionMatrix()
  }

  return {
    renderer,
    scene,
    camera,
    resize: (width, height, backPlane) => {
      const ratio = Math.min(window.devicePixelRatio, SCNRendererMetrics.maximumPixelRatio)
      viewportWidth = width
      viewportHeight = height
      renderer.setPixelRatio(ratio)
      renderer.setSize(width, height, false)
      frameCamera(width, height)
      castLight(width, height, backPlane)
      if (catchesShadows) {
        catcher.scale.set(
          width * SCNRendererMetrics.shadowMargin,
          height * SCNRendererMetrics.shadowMargin,
          1
        )
        catcher.position.set(width / 2, height / 2, backPlane)
      }
    },
    projectToPlane: (x, y, z, target) => {
      pointer.set((x / viewportWidth) * 2 - 1, 1 - (y / viewportHeight) * 2)
      raycaster.setFromCamera(pointer, camera)
      const reach = (z - raycaster.ray.origin.z) / raycaster.ray.direction.z
      return target.copy(raycaster.ray.direction).multiplyScalar(reach).add(raycaster.ray.origin)
    },
    render: () => renderer.render(scene, camera),
    dispose: () => renderer.dispose()
  }
}
