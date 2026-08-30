import { createEffect, on, onCleanup, onMount } from 'solid-js'
import { Group, Vector3 } from 'three'
import { scnMakeCable } from '../Nodes/SCNCable'
import { SCNLightningPlugMetrics, scnMakeLightningPlug } from '../Nodes/SCNLightningPlug'
import { SCNPowerAdapterMetrics, scnMakePowerAdapter } from '../Nodes/SCNPowerAdapter'
import { SCNSocketStripMetrics, scnMakeSocketStrip } from '../Nodes/SCNSocketStrip'
import { SCNRopeMetrics } from '../Physics/SCNPhysicsMetrics'
import { scnMakePlugBody } from '../Physics/SCNPlugBody'
import { scnMakeRope } from '../Physics/SCNRope'
import { SCNCableMetrics } from '../Support/SCNHardwareMetrics'
import { scnLoadSurfaces, scnMakeMaterials } from '../Support/SCNMaterials'
import { SCNRendererMetrics } from './SCNRendererMetrics'
import { scnMakeStage } from './SCNStage'

export interface SCNPort {
  readonly x: number
  readonly y: number
}

const UpAxis = new Vector3(0, 1, 0)

export const SCNView = (props: {
  port: SCNPort
  pixelsPerMillimetre: number
  plugged: boolean
  onPlug: () => void
  onUnplug: () => void
}) => {
  let canvas!: HTMLCanvasElement

  onMount(() => {
    const materials = scnMakeMaterials()
    materials.shadow.opacity = SCNRendererMetrics.shadowOpacity
    const stage = scnMakeStage(canvas, materials.shadow)

    const cable = scnMakeCable(materials.cable, SCNRendererMetrics.tubularSegments)
    stage.scene.add(cable.mesh)

    const receptacle = new Group()
    receptacle.add(scnMakeSocketStrip(materials))
    const adapter = scnMakePowerAdapter(materials)
    adapter.rotation.z = Math.PI / 2
    adapter.position.set(
      0,
      SCNSocketStripMetrics.topOutletY,
      SCNPowerAdapterMetrics.seatClearance -
        SCNSocketStripMetrics.wellDepth +
        SCNPowerAdapterMetrics.cubeDepth / 2
    )
    receptacle.add(adapter)
    stage.scene.add(receptacle)

    const plug = scnMakeLightningPlug(materials)
    const plugPivot = new Group()
    plugPivot.add(plug.group)
    stage.scene.add(plugPivot)

    const body = scnMakePlugBody()
    const anchor = new Vector3()
    const cordAxis = new Vector3()
    const exitAxis = new Vector3()
    const aim = new Vector3()
    const port = new Vector3()
    let rope = scnMakeRope(1, 1)
    let viewWidth = 0
    let viewHeight = 0
    let faceZ = 0
    let floorY = 0
    let dragging = false
    let holdPixels = 0
    let quiet = 0
    let frame = 0
    let last = 0

    const unit = () => props.pixelsPerMillimetre
    const reach = () => SCNLightningPlugMetrics.totalLength * unit()
    const tail = () => rope.points[rope.points.length - 1]

    const tangent = (): Vector3 => {
      const end = tail()
      const spine = rope.points.length - 1 - SCNRendererMetrics.plugSpineSamples
      const back = rope.points[Math.max(0, spine)]
      if (!end || !back) return aim.copy(UpAxis)
      aim.set(end.x - back.x, end.y - back.y, end.z - back.z)
      if (aim.lengthSq() < rope.segmentLength * rope.segmentLength) return aim.copy(body.direction)
      return aim.normalize()
    }

    const heading = (): Vector3 => (props.plugged || dragging ? aim.copy(UpAxis) : tangent())

    const layout = () => {
      viewWidth = window.innerWidth
      viewHeight = window.innerHeight
      const socketUnit = unit() * SCNRendererMetrics.socketScale
      faceZ = -SCNRendererMetrics.socketFaceOffset
      floorY = viewHeight * SCNRendererMetrics.floorInsetFraction
      stage.resize(
        viewWidth,
        viewHeight,
        faceZ - SCNSocketStripMetrics.bodyHeight * socketUnit - SCNRendererMetrics.backPlaneOffset
      )

      receptacle.scale.setScalar(socketUnit)
      receptacle.rotation.set(SCNRendererMetrics.socketTiltX, SCNRendererMetrics.socketTiltY, 0)
      receptacle.position.set(
        viewWidth * SCNRendererMetrics.socketCentreFraction,
        (SCNRendererMetrics.socketVisibleMillimetres - SCNSocketStripMetrics.bodyLength / 2) *
          socketUnit,
        faceZ
      )
      receptacle.updateMatrixWorld(true)
      adapter.localToWorld(anchor.set(0, -SCNPowerAdapterMetrics.cordExit, 0))
      cordAxis.set(0, -1, 0).transformDirection(adapter.matrixWorld)

      plugPivot.scale.setScalar(unit())
      port.set(props.port.x, viewHeight - props.port.y, 0)
    }

    const bindRope = () => {
      rope.setAnchor(anchor.x, anchor.y, anchor.z)
      rope.setAnchorAxis(cordAxis)
      rope.setFloor(floorY)
      rope.setBackPlane(faceZ)
      rope.setThickness(SCNCableMetrics.radius * unit())
    }

    const resetRope = () => {
      const span = Math.max(anchor.distanceTo(port), 1)
      rope = scnMakeRope(span * SCNRendererMetrics.cableSlack, unit())
      bindRope()
      rope.reset(anchor.x, anchor.y, anchor.z)
    }

    const seatPlug = () => {
      const drop =
        (SCNLightningPlugMetrics.totalLength - SCNLightningPlugMetrics.tabLength) * unit()
      rope.setTail(port.x, port.y - drop, 0)
      rope.holdTail(true)
      rope.lockTail(true)
      body.snap(UpAxis)
      plug.blade.visible = false
    }

    const updateScene = () => {
      cable.update(rope, SCNCableMetrics.radius * unit())
      const end = tail()
      if (!end) return
      const stem = reach()
      plugPivot.position.set(
        end.x + body.direction.x * stem,
        end.y + body.direction.y * stem,
        end.z + body.direction.z * stem
      )
      plugPivot.quaternion.setFromUnitVectors(UpAxis, body.direction)
    }

    const step = () => {
      frame = 0
      const now = performance.now()
      const elapsed = last === 0 ? 16 : now - last
      last = now
      rope.setTailAxis(exitAxis.copy(body.direction).negate())
      rope.step(elapsed)
      body.aim(heading(), Math.min(elapsed / 1000, SCNRopeMetrics.maximumFrame))
      updateScene()
      stage.render()
      const settled = rope.energy() < SCNRopeMetrics.restEnergy && body.resting(heading())
      quiet = settled ? quiet + 1 : 0
      if (dragging || quiet < SCNRendererMetrics.settleFrames) {
        frame = requestAnimationFrame(step)
        return
      }
      last = 0
    }

    const wake = () => {
      quiet = 0
      if (frame !== 0) return
      last = 0
      frame = requestAnimationFrame(step)
    }

    const grabPoint = (x: number, y: number): number | undefined => {
      if (props.plugged && y > port.y) return undefined
      const axis = body.direction
      const near = SCNLightningPlugMetrics.tabLength * unit()
      const span = reach() - near
      const px = x - (plugPivot.position.x - axis.x * near)
      const py = y - (plugPivot.position.y - axis.y * near)
      const along = Math.min(Math.max(-(px * axis.x + py * axis.y), 0), span)
      const cx = px + axis.x * along
      const cy = py + axis.y * along
      const girth =
        (SCNLightningPlugMetrics.housingWidth / 2 + SCNRendererMetrics.grabPaddingMillimetres) *
        unit()
      if (cx * cx + cy * cy > girth * girth) return undefined
      return near + along
    }

    const dragTail = (x: number, y: number) => {
      const stem = reach() - holdPixels
      rope.setTail(x - body.direction.x * stem, y - body.direction.y * stem, 0)
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      const hold = grabPoint(event.clientX, viewHeight - event.clientY)
      if (hold === undefined) return
      dragging = true
      holdPixels = hold
      plug.blade.visible = true
      rope.holdTail(true)
      rope.lockTail(false)
      dragTail(event.clientX, viewHeight - event.clientY)
      event.preventDefault()
      event.stopPropagation()
      if (props.plugged) props.onUnplug()
      wake()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      dragTail(event.clientX, viewHeight - event.clientY)
      event.preventDefault()
      wake()
    }

    const onPointerUp = () => {
      if (!dragging) return
      dragging = false
      const snap = SCNRendererMetrics.snapRadiusMillimetres * unit()
      if (plugPivot.position.distanceTo(port) <= snap) {
        seatPlug()
        props.onPlug()
        wake()
        return
      }
      rope.holdTail(false)
      wake()
    }

    const onResize = () => {
      layout()
      resetRope()
      if (props.plugged) seatPlug()
      wake()
    }

    layout()
    resetRope()
    if (props.plugged) seatPlug()
    updateScene()
    stage.render()
    scnLoadSurfaces(stage.renderer, materials, wake)
    wake()

    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerUp, true)
    window.addEventListener('resize', onResize)

    createEffect(
      on(
        () => props.plugged,
        (plugged) => {
          if (plugged) {
            seatPlug()
          } else {
            plug.blade.visible = true
            rope.lockTail(false)
            if (!dragging) rope.holdTail(false)
          }
          wake()
        },
        { defer: true }
      )
    )

    createEffect(
      on(
        () => props.port,
        () => {
          layout()
          bindRope()
          if (props.plugged) seatPlug()
          wake()
        },
        { defer: true }
      )
    )

    onCleanup(() => {
      if (frame !== 0) cancelAnimationFrame(frame)
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('pointermove', onPointerMove, true)
      window.removeEventListener('pointerup', onPointerUp, true)
      window.removeEventListener('pointercancel', onPointerUp, true)
      window.removeEventListener('resize', onResize)
      stage.dispose()
    })
  })

  return (
    <canvas
      ref={canvas}
      style={{
        position: 'fixed',
        inset: '0',
        width: '100%',
        height: '100%',
        'pointer-events': 'none',
        'z-index': '1'
      }}
    />
  )
}
