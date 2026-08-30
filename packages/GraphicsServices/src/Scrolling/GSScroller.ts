import { createSignal, type Accessor } from 'solid-js'
import { gsAttachEventTap, type GSEventRecord } from '../Events/GSEventTap'
import {
  GSHandPhase,
  GSScrollPhase,
  type GSScrollPhaseValue
} from '../Support/GraphicsServicesTypes'
import { GSScrollMetrics } from './GSScrollMetrics'

interface GSVelocitySample {
  readonly y: number
  readonly timestamp: number
}

export interface GSScroller {
  readonly phase: Accessor<GSScrollPhaseValue>
  readonly detach: () => void
}

const rubberBand = (distance: number, extent: number): number => {
  if (extent <= 0) return 0
  const coefficient = GSScrollMetrics.rubberBandCoefficient
  return (1 - 1 / ((distance * coefficient) / extent + 1)) * extent
}

const easeOut = (progress: number): number => 1 - (1 - progress) ** 3

export const gsAttachScroller = (host: HTMLElement): GSScroller => {
  const [phase, setPhase] = createSignal<GSScrollPhaseValue>(GSScrollPhase.idle)
  const samples: GSVelocitySample[] = []
  const basePaddingTop = Number.parseFloat(getComputedStyle(host).paddingTop) || 0
  const basePaddingBottom = Number.parseFloat(getComputedStyle(host).paddingBottom) || 0
  let engaged = false
  let pannedAt = 0
  let scale = 1
  let extent = 0
  let limit = 0
  let startY = 0
  let startTop = 0
  let momentum = 0
  let band = 0
  let bandFrom = 0
  let bandStarted = 0
  let frame = 0
  let lastTime = 0
  let wheelSettle = 0

  const cancelWheelSettle = () => {
    if (wheelSettle === 0) return
    clearTimeout(wheelSettle)
    wheelSettle = 0
  }

  const cancelFrame = () => {
    if (frame === 0) return
    cancelAnimationFrame(frame)
    frame = 0
  }

  const measure = () => {
    extent = host.clientHeight
    limit = Math.max(host.scrollHeight - extent, 0)
    scale = host.offsetHeight > 0 ? host.getBoundingClientRect().height / host.offsetHeight : 1
  }

  const applyBand = (next: number) => {
    band = next
    host.style.paddingTop = `${basePaddingTop + Math.max(next, 0)}px`
    host.style.paddingBottom = `${basePaddingBottom + Math.max(-next, 0)}px`
    if (next > 0) {
      host.scrollTop = 0
      return
    }
    if (next < 0) host.scrollTop = limit - next
  }

  const settle = () => {
    cancelFrame()
    momentum = 0
    engaged = false
    if (band !== 0) applyBand(0)
    host.style.userSelect = ''
    setPhase(GSScrollPhase.idle)
  }

  const snapBack = () => {
    frame = 0
    const progress = (performance.now() - bandStarted) / GSScrollMetrics.snapBackMilliseconds
    if (progress >= 1) {
      settle()
      return
    }
    applyBand(bandFrom * (1 - easeOut(progress)))
    frame = requestAnimationFrame(snapBack)
  }

  const beginSnapBack = () => {
    cancelFrame()
    momentum = 0
    engaged = false
    host.style.userSelect = ''
    bandFrom = band
    bandStarted = performance.now()
    setPhase(GSScrollPhase.bouncing)
    frame = requestAnimationFrame(snapBack)
  }

  const step = () => {
    frame = 0
    const now = performance.now()
    const elapsed = Math.min(now - lastTime, GSScrollMetrics.maximumFrameMilliseconds)
    lastTime = now
    const next = host.scrollTop + momentum * elapsed
    momentum *= GSScrollMetrics.decelerationRate ** elapsed
    if (next <= 0 || next >= limit) {
      host.scrollTop = next <= 0 ? 0 : limit
      const overshoot = Math.abs(momentum) * GSScrollMetrics.snapBackMilliseconds
      const reach = rubberBand(overshoot, extent)
      applyBand(next <= 0 ? reach : -reach)
      beginSnapBack()
      return
    }
    host.scrollTop = next
    if (Math.abs(momentum) < GSScrollMetrics.minimumVelocityPerMillisecond) {
      settle()
      return
    }
    frame = requestAnimationFrame(step)
  }

  const collect = (event: GSEventRecord) => {
    samples.push({ y: event.y, timestamp: event.timestamp })
    let oldest = samples[0]
    while (
      oldest &&
      event.timestamp - oldest.timestamp > GSScrollMetrics.velocityWindowMilliseconds
    ) {
      samples.shift()
      oldest = samples[0]
    }
  }

  const releaseMomentum = (event: GSEventRecord): number => {
    const oldest = samples[0]
    if (!oldest) return 0
    const elapsed = event.timestamp - oldest.timestamp
    if (elapsed <= 0) return 0
    const cursor = (oldest.y - event.y) / elapsed
    const ceiling = GSScrollMetrics.maximumVelocityPerMillisecond
    return Math.max(-ceiling, Math.min(ceiling, cursor)) / scale
  }

  const onHandDown = (event: GSEventRecord) => {
    cancelFrame()
    momentum = 0
    engaged = false
    if (band !== 0) applyBand(0)
    measure()
    startY = event.y
    startTop = host.scrollTop
    samples.length = 0
    collect(event)
    setPhase(GSScrollPhase.tracking)
  }

  const onHandDragged = (event: GSEventRecord) => {
    if (phase() === GSScrollPhase.idle) return
    collect(event)
    if (!engaged) {
      if (Math.abs(event.y - startY) < GSScrollMetrics.panSlopPixels) return
      engaged = true
      startY = event.y
      startTop = host.scrollTop
      host.style.userSelect = 'none'
      getSelection()?.removeAllRanges()
      setPhase(GSScrollPhase.dragging)
    }
    event.preventDefault()
    pannedAt = event.timestamp
    if (band !== 0) applyBand(0)
    const target = startTop - (event.y - startY) / scale
    if (target < 0) {
      applyBand(rubberBand(-target, extent))
      return
    }
    if (target > limit) {
      applyBand(-rubberBand(target - limit, extent))
      return
    }
    host.scrollTop = target
  }

  const onHandUp = (event: GSEventRecord) => {
    if (phase() === GSScrollPhase.idle) return
    if (!engaged || event.phase === GSHandPhase.canceled || band !== 0) {
      if (band !== 0) {
        beginSnapBack()
        return
      }
      settle()
      return
    }
    engaged = false
    momentum = releaseMomentum(event)
    if (Math.abs(momentum) < GSScrollMetrics.minimumVelocityPerMillisecond) {
      settle()
      return
    }
    setPhase(GSScrollPhase.decelerating)
    lastTime = performance.now()
    frame = requestAnimationFrame(step)
  }

  const wheelDelta = (event: WheelEvent): number => {
    if (event.deltaMode === 1) return event.deltaY * GSScrollMetrics.wheelLinePixels
    if (event.deltaMode === 2) return event.deltaY * extent
    return event.deltaY
  }

  const onWheel = (event: WheelEvent) => {
    measure()
    if (limit <= 0) return
    cancelFrame()
    momentum = 0
    if (band !== 0) applyBand(0)
    const target = host.scrollTop + wheelDelta(event) / scale
    host.scrollTop = Math.max(0, Math.min(target, limit))
    event.preventDefault()
    setPhase(GSScrollPhase.dragging)
    cancelWheelSettle()
    wheelSettle = window.setTimeout(() => {
      wheelSettle = 0
      setPhase(GSScrollPhase.idle)
    }, GSScrollMetrics.wheelSettleMilliseconds)
  }

  const swallowPan = (event: MouseEvent) => {
    if (event.timeStamp - pannedAt > GSScrollMetrics.panClickGraceMilliseconds) return
    pannedAt = 0
    event.stopPropagation()
    event.preventDefault()
  }

  const refusePickUp = (event: DragEvent) => event.preventDefault()

  const releaseTap = gsAttachEventTap(host, { onHandDown, onHandDragged, onHandUp })
  host.addEventListener('wheel', onWheel, { passive: false })
  host.addEventListener('click', swallowPan, true)
  host.addEventListener('dragstart', refusePickUp)

  return {
    phase,
    detach: () => {
      cancelFrame()
      cancelWheelSettle()
      host.removeEventListener('wheel', onWheel)
      host.removeEventListener('click', swallowPan, true)
      host.removeEventListener('dragstart', refusePickUp)
      releaseTap()
    }
  }
}
