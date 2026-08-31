import { createEffect, on, onCleanup, onMount } from 'solid-js'
import { Group, Vector3 } from 'three'
import { scnMakeCable } from '../Nodes/SCNCable'
import { SCNLightningPlugMetrics, scnMakeLightningPlug } from '../Nodes/SCNLightningPlug'
import { SCNPowerAdapterMetrics, scnMakePowerAdapter } from '../Nodes/SCNPowerAdapter'
import { SCNSocketStripMetrics, scnMakeSocketStrip } from '../Nodes/SCNSocketStrip'
import {
  scnMeasureConnector,
  scnSeatingProgress,
  type SCNConnectorPhase
} from '../Physics/SCNConnector'
import { SCNConnectorMetrics, SCNRopeMetrics } from '../Physics/SCNPhysicsMetrics'
import { scnMakePlugBody } from '../Physics/SCNPlugBody'
import {
  scnMakeRope,
  type SCNRope,
  type SCNRopeCollider,
  type SCNRopePoint
} from '../Physics/SCNRope'
import { SCNCableMetrics, SCNLightningMetrics } from '../Support/SCNHardwareMetrics'
import { scnLoadSurfaces, scnMakeMaterials } from '../Support/SCNMaterials'
import { SCNRendererMetrics } from './SCNRendererMetrics'
import { scnMakeStage } from './SCNStage'

export interface SCNPhoneBody {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
  readonly cornerRadius: number
  readonly portWidth: number
}

export interface SCNPortPose {
  readonly x: number
  readonly y: number
  readonly outwardX: number
  readonly outwardY: number
  readonly body: SCNPhoneBody
}

const UpAxis = new Vector3(0, 1, 0)

const mix = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.max(minimum, Math.min(maximum, value))

const samplePoint = (points: readonly SCNRopePoint[], progress: number, target: Vector3) => {
  const slot = progress * Math.max(points.length - 1, 0)
  const lower = Math.floor(slot)
  const upper = Math.min(Math.ceil(slot), points.length - 1)
  const a = points[lower]
  const b = points[upper]
  if (!a || !b) return target.set(0, 0, 0)
  const t = slot - lower
  return target.set(mix(a.x, b.x, t), mix(a.y, b.y, t), mix(a.z, b.z, t))
}

export const SCNView = (props: {
  port: SCNPortPose
  pixelsPerMillimetre: number
  opacity: number
  transition: string
  plugged: boolean
  onPlug: () => void
  onUnplug: () => void
}) => {
  let rearCanvas!: HTMLCanvasElement
  let frontCanvas!: HTMLCanvasElement

  onMount(() => {
    const materials = scnMakeMaterials()
    materials.shadow.opacity = SCNRendererMetrics.shadowOpacity
    const stage = scnMakeStage(rearCanvas, materials.shadow)
    const connectorStage = scnMakeStage(frontCanvas, materials.shadow, false)

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
    connectorStage.scene.add(plugPivot)

    const body = scnMakePlugBody()
    const anchor = new Vector3()
    const oldAnchor = new Vector3()
    const oldTail = new Vector3()
    const cordAxis = new Vector3()
    const exitAxis = new Vector3()
    const aim = new Vector3()
    const port = new Vector3()
    const outward = new Vector3()
    const insertionAxis = new Vector3()
    const seatTarget = new Vector3()
    const looseTarget = new Vector3()
    const desiredTip = new Vector3()
    const desiredTail = new Vector3()
    const seatFrom = new Vector3()
    const sample = new Vector3()
    const stripCentre = new Vector3()
    const adapterCentre = new Vector3()
    let rope: SCNRope = scnMakeRope(1, 1)
    let viewWidth = 0
    let viewHeight = 0
    let socketUnit = 1
    let faceZ = 0
    let tableZ = 0
    let phase: SCNConnectorPhase = props.plugged ? 'seated' : 'free'
    let insertionProgress = props.plugged ? 1 : 0
    let seatingStarted = 0
    let dragging = false
    let pointerOwner: Element | undefined
    let holdPixels = 0
    let quiet = 0
    let frame = 0
    let last = 0
    let contextLost = false

    const unit = () => props.pixelsPerMillimetre
    const reach = () => SCNLightningPlugMetrics.totalLength * unit()
    const tail = () => rope.points[rope.points.length - 1]

    const setBladeInsertion = (progress: number) => {
      insertionProgress = Math.max(0, Math.min(1, progress))
      plug.blade.visible = insertionProgress < 0.999
      plug.blade.scale.y = 1 - insertionProgress
      plug.blade.position.y = -SCNLightningPlugMetrics.tabLength * insertionProgress
    }

    const tangent = (): Vector3 => {
      const end = tail()
      const spine = rope.points.length - 1 - SCNRendererMetrics.plugSpineSamples
      const back = rope.points[Math.max(0, spine)]
      if (!end || !back) return aim.copy(insertionAxis)
      aim.set(end.x - back.x, end.y - back.y, end.z - back.z)
      if (aim.lengthSq() < rope.segmentLength * rope.segmentLength * 0.25) {
        return aim.copy(body.direction)
      }
      return aim.normalize()
    }

    const heading = (): Vector3 =>
      phase === 'guided' ||
      phase === 'seating' ||
      phase === 'seated' ||
      phase === 'extracting'
        ? aim.copy(insertionAxis)
        : tangent()

    const colliders = (): SCNRopeCollider[] => {
      const stripHalfWidth = (SCNSocketStripMetrics.bodyWidth * socketUnit) / 2
      const stripHalfLength = (SCNSocketStripMetrics.bodyLength * socketUnit) / 2
      receptacle.getWorldPosition(stripCentre)
      adapter.getWorldPosition(adapterCentre)
      const adapterHalf = (SCNPowerAdapterMetrics.cubeWidth * socketUnit) / 2
      const phone = props.port.body
      return [
        {
          left: stripCentre.x - stripHalfWidth,
          right: stripCentre.x + stripHalfWidth,
          bottom: stripCentre.y - stripHalfLength,
          top: stripCentre.y + stripHalfLength,
          back: tableZ,
          front: faceZ,
          radius: SCNSocketStripMetrics.bodyWidth * socketUnit * 0.2
        },
        {
          left: adapterCentre.x - adapterHalf,
          right: adapterCentre.x + adapterHalf,
          bottom: adapterCentre.y - adapterHalf,
          top: adapterCentre.y + adapterHalf,
          back: faceZ,
          front: faceZ + SCNPowerAdapterMetrics.cubeDepth * socketUnit,
          radius: SCNPowerAdapterMetrics.cubeWidth * socketUnit * 0.14
        },
        {
          left: phone.left,
          right: phone.right,
          bottom: viewHeight - phone.bottom,
          top: viewHeight - phone.top,
          back: tableZ,
          front: 0,
          radius: phone.cornerRadius
        }
      ]
    }

    const layout = () => {
      viewWidth = window.innerWidth
      viewHeight = window.innerHeight
      socketUnit = unit() * SCNRendererMetrics.socketScale
      faceZ = -SCNRendererMetrics.socketFaceOffsetMillimetres * unit()
      tableZ = faceZ - SCNSocketStripMetrics.bodyHeight * socketUnit
      stage.resize(viewWidth, viewHeight, tableZ)
      connectorStage.resize(viewWidth, viewHeight, tableZ)

      receptacle.scale.setScalar(socketUnit)
      receptacle.rotation.set(0, 0, SCNRendererMetrics.socketRotationZ)
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
      outward.set(props.port.outwardX, -props.port.outwardY, 0).normalize()
      insertionAxis.copy(outward).negate()
      port.set(props.port.x, viewHeight - props.port.y, 0)
      seatTarget.copy(port).addScaledVector(insertionAxis, SCNLightningPlugMetrics.tabLength * unit())
      const readyMargin = SCNRendererMetrics.loosePlugViewportMarginMillimetres * unit()
      const readyX = clamp(
        props.port.body.left -
          SCNRendererMetrics.loosePlugSideClearanceMillimetres * unit(),
        readyMargin,
        viewWidth - readyMargin
      )
      const readyScreenY = clamp(
        props.port.y + SCNRendererMetrics.loosePlugOffsetYMillimetres * unit(),
        readyMargin,
        viewHeight - reach() - readyMargin
      )
      looseTarget.set(readyX, viewHeight - readyScreenY, 0)
      looseTarget.z = tableZ + (SCNLightningMetrics.housingThickness / 2) * unit()
    }

    const bindRope = (target: SCNRope) => {
      target.setAnchor(anchor.x, anchor.y, anchor.z)
      target.setAnchorAxis(cordAxis)
      target.setTable(tableZ)
      target.setThickness(SCNCableMetrics.radius * unit())
      target.setColliders(colliders())
    }

    const tailForTip = (tip: Vector3, direction: Vector3, target: Vector3): Vector3 =>
      target.copy(tip).addScaledVector(direction, -reach())

    const rebuildRope = (preserve: boolean) => {
      const previous = rope
      const previousPoints = [...previous.points]
      const previousHead = previousPoints[0]
      const previousTail = previousPoints[previousPoints.length - 1]
      const tip = phase === 'seated' || phase === 'seating' ? seatTarget : looseTarget
      const direction = phase === 'seated' || phase === 'seating' ? insertionAxis : body.direction
      tailForTip(tip, direction, desiredTail)
      const span = Math.max(anchor.distanceTo(desiredTail), unit())
      rope = scnMakeRope(span * SCNRendererMetrics.cableSlack, unit())
      bindRope(rope)
      rope.reset(anchor.x, anchor.y, anchor.z, desiredTail.x, desiredTail.y, desiredTail.z)
      if (preserve && previousHead && previousTail && previousPoints.length > 1) {
        oldAnchor.set(previousHead.x, previousHead.y, previousHead.z)
        oldTail.set(previousTail.x, previousTail.y, previousTail.z)
        rope.points.forEach((point, index) => {
          const progress = index / (rope.points.length - 1)
          samplePoint(previousPoints, progress, sample)
          point.x = sample.x + mix(anchor.x - oldAnchor.x, desiredTail.x - oldTail.x, progress)
          point.y = sample.y + mix(anchor.y - oldAnchor.y, desiredTail.y - oldTail.y, progress)
          point.z = sample.z + mix(anchor.z - oldAnchor.z, desiredTail.z - oldTail.z, progress)
          point.px = point.x
          point.py = point.y
          point.pz = point.z
        })
      }
    }

    const lockTip = (tip: Vector3, locked: boolean) => {
      tailForTip(tip, body.direction, desiredTail)
      rope.setTail(desiredTail.x, desiredTail.y, desiredTail.z)
      rope.holdTail(true)
      rope.lockTail(locked)
    }

    const parkPlug = () => {
      phase = 'free'
      body.snap(insertionAxis)
      setBladeInsertion(0)
      lockTip(looseTarget, true)
    }

    const seatPlug = (notify: boolean) => {
      phase = 'seated'
      body.snap(insertionAxis)
      setBladeInsertion(1)
      lockTip(seatTarget, true)
      if (notify && !props.plugged) props.onPlug()
    }

    const startSeating = () => {
      phase = 'seating'
      seatingStarted = performance.now()
      seatFrom.copy(plugPivot.position)
      body.snap(insertionAxis)
      rope.holdTail(true)
      rope.lockTail(true)
    }

    const updateScene = () => {
      cable.update(rope, SCNCableMetrics.radius * unit())
      const end = tail()
      if (!end) return
      plugPivot.position.set(
        end.x + body.direction.x * reach(),
        end.y + body.direction.y * reach(),
        end.z + body.direction.z * reach()
      )
      plugPivot.quaternion.setFromUnitVectors(UpAxis, body.direction)
    }

    const alignment = () =>
      scnMeasureConnector({
        tip: plugPivot.position,
        direction: body.direction,
        target: seatTarget,
        insertionAxis,
        pixelsPerMillimetre: unit()
      })

    const advanceConnector = (now: number) => {
      if (phase !== 'seating') return
      const progress = scnSeatingProgress((now - seatingStarted) / 1000)
      desiredTip.set(
        mix(seatFrom.x, seatTarget.x, progress),
        mix(seatFrom.y, seatTarget.y, progress),
        mix(seatFrom.z, seatTarget.z, progress)
      )
      body.snap(insertionAxis)
      setBladeInsertion(progress)
      lockTip(desiredTip, true)
      if (progress >= 1) seatPlug(true)
    }

    const refreshGuidance = () => {
      if (!dragging || (phase !== 'free' && phase !== 'guided')) return
      phase = alignment().guided ? 'guided' : 'free'
    }

    const step = () => {
      frame = 0
      if (contextLost) return
      const now = performance.now()
      const elapsed = last === 0 ? 16 : now - last
      last = now
      advanceConnector(now)
      exitAxis.copy(body.direction).negate()
      rope.setTailAxis(exitAxis)
      rope.step(elapsed)
      body.aim(heading(), Math.min(elapsed / 1000, SCNRopeMetrics.maximumFrame))
      updateScene()
      refreshGuidance()
      stage.render()
      connectorStage.render()
      const movingConnector = phase === 'seating' || phase === 'extracting'
      const settled =
        rope.energy() < SCNRopeMetrics.restEnergyMillimetres && body.resting(heading())
      quiet = settled && !movingConnector ? quiet + 1 : 0
      if (dragging || quiet < SCNRendererMetrics.settleFrames || movingConnector) {
        frame = requestAnimationFrame(step)
        return
      }
      last = 0
    }

    const wake = () => {
      quiet = 0
      if (frame !== 0 || contextLost) return
      last = 0
      frame = requestAnimationFrame(step)
    }

    const grabPoint = (x: number, y: number): number | undefined => {
      const axis = body.direction
      const near = SCNLightningPlugMetrics.tabLength * unit()
      const span = reach() - near
      const px = x - (plugPivot.position.x - axis.x * near)
      const py = y - (plugPivot.position.y - axis.y * near)
      const along = Math.min(Math.max(-(px * axis.x + py * axis.y), 0), span)
      const cx = px + axis.x * along
      const cy = py + axis.y * along
      const girth =
        (SCNLightningMetrics.housingWidth / 2 +
          SCNRendererMetrics.grabPaddingMillimetres) *
        unit()
      if (cx * cx + cy * cy > girth * girth) return undefined
      return near + along
    }

    const holdPointer = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      if (!('setPointerCapture' in event.target)) return
      pointerOwner = event.target
      try {
        event.target.setPointerCapture(event.pointerId)
      } catch {
        pointerOwner = undefined
      }
    }

    const releasePointer = (event: PointerEvent) => {
      if (!pointerOwner || !('releasePointerCapture' in pointerOwner)) return
      try {
        pointerOwner.releasePointerCapture(event.pointerId)
      } catch {
        pointerOwner = undefined
      }
      pointerOwner = undefined
    }

    const dragFreeTip = (x: number, y: number) => {
      const distance = Math.hypot(x - seatTarget.x, y - seatTarget.y)
      const guide = SCNConnectorMetrics.guideRadiusMillimetres * unit() * 2
      const lift = 1 - Math.min(distance / guide, 1)
      const assist = lift * lift * 0.58
      desiredTip.set(
        mix(x, seatTarget.x, assist),
        mix(y, seatTarget.y, assist),
        mix(tableZ + (SCNLightningMetrics.housingThickness / 2) * unit(), 0, lift)
      )
      const stem = reach() - holdPixels
      rope.setTail(
        desiredTip.x - body.direction.x * stem,
        desiredTip.y - body.direction.y * stem,
        desiredTip.z - body.direction.z * stem
      )
    }

    const dragExtractingTip = (x: number, y: number) => {
      const distancePixels = Math.max(
        0,
        (x - seatTarget.x) * outward.x + (y - seatTarget.y) * outward.y
      )
      desiredTip.copy(seatTarget).addScaledVector(outward, distancePixels)
      body.snap(insertionAxis)
      const extraction = distancePixels / unit()
      setBladeInsertion(1 - extraction / SCNConnectorMetrics.extractionMillimetres)
      lockTip(desiredTip, false)
      if (extraction < SCNConnectorMetrics.releaseMillimetres) return
      phase = 'free'
      setBladeInsertion(0)
      rope.lockTail(false)
      if (props.plugged) props.onUnplug()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return
      const hold = grabPoint(event.clientX, viewHeight - event.clientY)
      if (hold === undefined) return
      dragging = true
      holdPixels = hold
      rope.holdTail(true)
      rope.lockTail(false)
      if (phase === 'seated') phase = 'extracting'
      holdPointer(event)
      event.preventDefault()
      event.stopPropagation()
      wake()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const x = event.clientX
      const y = viewHeight - event.clientY
      if (phase === 'extracting') {
        dragExtractingTip(x, y)
      } else {
        dragFreeTip(x, y)
      }
      event.preventDefault()
      wake()
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      releasePointer(event)
      if (phase === 'extracting') {
        startSeating()
        wake()
        return
      }
      const releaseDistance = Math.hypot(
        desiredTip.x - seatTarget.x,
        desiredTip.y - seatTarget.y
      ) / unit()
      if (phase === 'guided' || releaseDistance <= SCNConnectorMetrics.guideRadiusMillimetres) {
        startSeating()
        wake()
        return
      }
      phase = 'free'
      const end = tail()
      if (end) {
        rope.setTail(end.x, end.y, end.z)
        rope.holdTail(true)
        rope.lockTail(true)
      }
      wake()
    }

    const onResize = () => {
      layout()
      rebuildRope(true)
      if (props.plugged) seatPlug(false)
      else if (!dragging) parkPlug()
      wake()
    }

    const lostContexts = new Set<EventTarget>()

    const onContextLost = (event: Event) => {
      event.preventDefault()
      if (event.currentTarget) lostContexts.add(event.currentTarget)
      contextLost = true
      if (frame !== 0) cancelAnimationFrame(frame)
      frame = 0
    }

    const onContextRestored = (event: Event) => {
      if (event.currentTarget) lostContexts.delete(event.currentTarget)
      if (lostContexts.size > 0) return
      contextLost = false
      layout()
      rebuildRope(true)
      if (props.plugged) seatPlug(false)
      else if (!dragging) parkPlug()
      wake()
    }

    layout()
    body.snap(insertionAxis)
    rebuildRope(false)
    if (props.plugged) seatPlug(false)
    else parkPlug()
    updateScene()
    stage.render()
    connectorStage.render()
    scnLoadSurfaces(stage.renderer, materials, wake)
    wake()

    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('pointermove', onPointerMove, true)
    window.addEventListener('pointerup', onPointerUp, true)
    window.addEventListener('pointercancel', onPointerUp, true)
    window.addEventListener('resize', onResize)
    rearCanvas.addEventListener('webglcontextlost', onContextLost)
    rearCanvas.addEventListener('webglcontextrestored', onContextRestored)
    frontCanvas.addEventListener('webglcontextlost', onContextLost)
    frontCanvas.addEventListener('webglcontextrestored', onContextRestored)

    createEffect(
      on(
        () => props.plugged,
        (plugged) => {
          if (plugged) {
            if (phase !== 'seating' && phase !== 'seated' && phase !== 'extracting') {
              seatPlug(false)
            }
          } else if (phase === 'seated') {
            parkPlug()
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
          rebuildRope(true)
          if (props.plugged) seatPlug(false)
          else if (!dragging) parkPlug()
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
      rearCanvas.removeEventListener('webglcontextlost', onContextLost)
      rearCanvas.removeEventListener('webglcontextrestored', onContextRestored)
      frontCanvas.removeEventListener('webglcontextlost', onContextLost)
      frontCanvas.removeEventListener('webglcontextrestored', onContextRestored)
      stage.dispose()
      connectorStage.dispose()
    })
  })

  const canvasStyle = (zIndex: number) => ({
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    'z-index': `${zIndex}`,
    opacity: `${props.opacity}`,
    transition: props.transition,
    'pointer-events': 'none'
  } as const)

  return (
    <>
      <canvas ref={rearCanvas} style={canvasStyle(1)} />
      <canvas ref={frontCanvas} style={canvasStyle(3)} />
    </>
  )
}
