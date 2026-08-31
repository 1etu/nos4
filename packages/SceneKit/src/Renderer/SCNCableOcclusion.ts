export interface SCNOcclusionPoint {
  readonly x: number
  readonly y: number
}

export const scnTerminalOcclusionSplit = (
  points: readonly SCNOcclusionPoint[],
  isOccluded: (point: SCNOcclusionPoint) => boolean,
  overlapPoints = 2
): number | undefined => {
  let firstOccluded: number | undefined
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index]
    if (!point) continue
    if (isOccluded(point)) {
      firstOccluded = index
      continue
    }
    if (firstOccluded === undefined) return undefined
    return Math.max(0, index - Math.max(overlapPoints - 1, 0))
  }
  return firstOccluded === undefined ? undefined : 0
}
