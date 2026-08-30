import { Vector3 } from 'three'
import { SCNPlugBodyMetrics } from './SCNPhysicsMetrics'

export interface SCNPlugBody {
  readonly direction: Vector3
  aim: (target: Vector3, seconds: number) => void
  snap: (target: Vector3) => void
  resting: (target: Vector3) => boolean
}

export const scnMakePlugBody = (): SCNPlugBody => {
  const direction = new Vector3(0, 1, 0)
  const velocity = new Vector3()
  const pull = new Vector3()

  return {
    direction,
    aim: (target, seconds) => {
      pull.copy(target).sub(direction).multiplyScalar(SCNPlugBodyMetrics.stiffness * seconds)
      velocity.multiplyScalar(Math.exp(-SCNPlugBodyMetrics.damping * seconds)).add(pull)
      direction.addScaledVector(velocity, seconds).normalize()
    },
    snap: (target) => {
      direction.copy(target).normalize()
      velocity.set(0, 0, 0)
    },
    resting: (target) =>
      direction.distanceToSquared(target) < SCNPlugBodyMetrics.restOffset ** 2 &&
      velocity.lengthSq() < SCNPlugBodyMetrics.restRate ** 2
  }
}
