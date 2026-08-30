import { GSHandPhase, type GSHandPhaseValue } from '../Support/GraphicsServicesTypes'

export interface GSEventRecord {
  readonly phase: GSHandPhaseValue
  readonly pointerId: number
  readonly x: number
  readonly y: number
  readonly timestamp: number
  readonly preventDefault: () => void
}

export interface GSEventTapHandlers {
  readonly onHandDown: (event: GSEventRecord) => void
  readonly onHandDragged: (event: GSEventRecord) => void
  readonly onHandUp: (event: GSEventRecord) => void
}

const claimed = new WeakSet<PointerEvent>()

const claim = (event: PointerEvent): boolean => {
  if (claimed.has(event)) return false
  claimed.add(event)
  return true
}

const recordOf = (event: PointerEvent, phase: GSHandPhaseValue): GSEventRecord => ({
  phase,
  pointerId: event.pointerId,
  x: event.clientX,
  y: event.clientY,
  timestamp: event.timeStamp,
  preventDefault: () => event.preventDefault()
})

export const gsAttachEventTap = (
  host: HTMLElement,
  handlers: GSEventTapHandlers
): (() => void) => {
  let tracking = -1

  const handDragged = (event: PointerEvent) => {
    if (event.pointerId !== tracking) return
    handlers.onHandDragged(recordOf(event, GSHandPhase.dragged))
  }

  const handUp = (event: PointerEvent) => {
    if (event.pointerId !== tracking) return
    stopTracking()
    handlers.onHandUp(recordOf(event, GSHandPhase.up))
  }

  const handCanceled = (event: PointerEvent) => {
    if (event.pointerId !== tracking) return
    stopTracking()
    handlers.onHandUp(recordOf(event, GSHandPhase.canceled))
  }

  function stopTracking() {
    tracking = -1
    window.removeEventListener('pointermove', handDragged)
    window.removeEventListener('pointerup', handUp)
    window.removeEventListener('pointercancel', handCanceled)
  }

  const handDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return
    if (!claim(event)) return
    tracking = event.pointerId
    window.addEventListener('pointermove', handDragged)
    window.addEventListener('pointerup', handUp)
    window.addEventListener('pointercancel', handCanceled)
    handlers.onHandDown(recordOf(event, GSHandPhase.down))
  }

  host.addEventListener('pointerdown', handDown)

  return () => {
    host.removeEventListener('pointerdown', handDown)
    stopTracking()
  }
}
