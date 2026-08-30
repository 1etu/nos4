export const SCNRopeMetrics = {
  pointCount: 56,
  gravityMillimetres: 9810,
  fixedStep: 1 / 180,
  maximumFrame: 1 / 15,
  damping: 0.994,
  relaxIterations: 10,
  bendStiffness: 0.32,
  creaseSlack: 0.05,
  minimumCreaseFactor: 0.62,
  collisionSkip: 3,
  collisionStiffness: 0.28,
  collisionTolerance: 0.4,
  terminalStiffness: 0.22,
  terminalSpan: 3,
  restEnergy: 0.1,
  dragStiffness: 0.62,
  floorFriction: 0.42,
  floorRestitution: 0,
  contactBand: 3,
  minimumSeparation: 0.001
} as const

export const SCNPlugBodyMetrics = {
  stiffness: 240,
  damping: 26,
  restOffset: 0.022,
  restRate: 0.14
} as const
