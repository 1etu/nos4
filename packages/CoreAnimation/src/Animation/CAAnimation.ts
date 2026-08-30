import type { CATimingFunction } from '../Timing/CAMediaTimingFunction'

export interface CAAnimation {
  readonly duration: number
  readonly timing: CATimingFunction
}

export const caAnimation = (duration: number, timing: CATimingFunction): CAAnimation => ({
  duration,
  timing
})

export const caTransition = (properties: readonly string[], animation: CAAnimation): string =>  properties.map((name) => `${name} ${animation.duration}s ${animation.timing}`).join(', ')
