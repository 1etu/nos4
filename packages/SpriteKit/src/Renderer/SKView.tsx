import { onCleanup, onMount } from 'solid-js'
import { gsAttachEventTap } from 'GraphicsServices'
import { skStepScene, type SKScene } from '../Scene/SKScene'
import { SKLoopMetrics, SKRendererMetrics } from '../Support/SKMetrics'
import { skRenderScene } from './SKRenderer'

export const SKView = (props: { width: number; height: number; scene: SKScene }) => {
  let canvas!: HTMLCanvasElement

  onMount(() => {
    const context = canvas.getContext('2d')
    if (!context) return

    const ratio = Math.min(window.devicePixelRatio, SKRendererMetrics.maximumPixelRatio)
    canvas.width = Math.round(props.width * ratio)
    canvas.height = Math.round(props.height * ratio)

    let fit = 1
    let offsetX = 0
    let offsetY = 0

    const layout = (scene: SKScene) => {
      fit = Math.min(props.width / scene.width, props.height / scene.height)
      offsetX = (props.width - scene.width * fit) / 2
      offsetY = (props.height - scene.height * fit) / 2
      context.setTransform(ratio * fit, 0, 0, ratio * fit, ratio * offsetX, ratio * offsetY)
      context.imageSmoothingEnabled = false
    }

    layout(props.scene)

    const detach = gsAttachEventTap(canvas, {
      onHandDown: (event) => {
        const bounds = canvas.getBoundingClientRect()
        const stageX = bounds.width / props.width
        const stageY = bounds.height / props.height
        const scene = props.scene
        scene.touchBegan(
          scene,
          ((event.x - bounds.left) / stageX - offsetX) / fit,
          ((event.y - bounds.top) / stageY - offsetY) / fit
        )
      },
      onHandDragged: () => undefined,
      onHandUp: () => undefined
    })

    let frame = 0
    let last = performance.now()
    let accumulator = 0
    let presented = props.scene

    const step = (now: number) => {
      const scene = props.scene
      if (scene !== presented) {
        presented = scene
        layout(scene)
        accumulator = 0
      }

      const elapsed = Math.min((now - last) / 1000, SKLoopMetrics.maximumFrameSeconds)
      last = now
      accumulator += elapsed
      while (accumulator >= SKLoopMetrics.fixedTimestep) {
        skStepScene(scene, SKLoopMetrics.fixedTimestep)
        accumulator -= SKLoopMetrics.fixedTimestep
      }

      context.save()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.restore()
      skRenderScene(context, scene)
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)

    onCleanup(() => {
      cancelAnimationFrame(frame)
      detach()
    })
  })

  return (
    <canvas
      ref={canvas}
      style={{ width: `${props.width}px`, height: `${props.height}px`, display: 'block' }}
    />
  )
}
