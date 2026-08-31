export const SCNRopeMetrics = {
  minimumPointCount: 48,
  maximumPointCount: 128,
  segmentMillimetres: 5,
  gravityMillimetres: 9810,
  fixedStep: 1 / 120,
  maximumFrame: 1 / 12,
  damping: 0.992,
  solverIterations: 8,
  minimumBendRadiusMillimetres: 12,
  bendStiffness: 0.18,
  selfCollisionSkip: 4,
  collisionStiffness: 0.72,
  terminalStiffness: 0.36,
  terminalSpan: 4,
  restEnergyMillimetres: 0.018,
  dragStiffness: 0.78,
  staticFriction: 0.65,
  dynamicFriction: 0.45,
  contactBandMillimetres: 0.35,
  minimumSeparation: 0.001,
  initialSagFraction: 0.14
} as const

export const SCNPlugBodyMetrics = {
  stiffness: 280,
  damping: 30,
  restOffset: 0.016,
  restRate: 0.1
} as const

export const SCNConnectorMetrics = {
  guideRadiusMillimetres: 12,
  guideAngleDegrees: 25,
  seatRadiusMillimetres: 2.5,
  seatAngleDegrees: 12,
  seatingSeconds: 0.16,
  extractionMillimetres: 7.7,
  releaseMillimetres: 9.2
} as const
