const PixelsPerMetre = 32
const GravityMetresPerSecond = 9.81 * 3

export const FlattyBirdMetrics = {
  sceneWidth: 320,
  sceneHeight: 480,

  gravityWait: 0,
  gravityPlay: GravityMetresPerSecond * PixelsPerMetre,
  gravityGameOver: GravityMetresPerSecond * 3 * PixelsPerMetre,

  birdResetX: 96,
  birdResetY: 192,
  birdJumpVelocity: -280,
  birdFrameWidth: 34,
  birdFrameHeight: 24,
  birdFrameCount: 3,
  birdFrameRate: 10,
  birdColliderRadius: 12,
  birdRotationRadiansPerVelocity: (0.1 * Math.PI) / 180,
  birdWabbleAmplitudeX: 6.25,
  birdWabbleAmplitudeY: 25,
  birdWabblePeriod: 4,

  pipeWidth: 52,
  pipeHeight: 320,
  pipeGateway: 90,
  pipeVariation: 70,
  pipeVelocityX: -150,
  pipeSpawnMarginFactor: 0.5,
  pipeDespawnMarginFactor: 1.5,
  pipeCentreHeightDivisor: 3,
  pipeDelayFirst: 0,
  pipeDelaySecond: 1.5,
  gateWidth: 10,

  groundWidth: 368,
  groundHeight: 90,
  groundFrameCount: 3,
  groundFrameRate: 4,
  groundBleedHeight: 220,

  skyWidth: 368,
  skyHeight: 576,
  rotorX: 178,
  rotorY: 318,
  rotorSize: 70,
  rotorDegreesPerSecond: 90,

  borderHeight: 20,
  ceilingOffsetY: -20,

  digitWidth: 24,
  digitHeight: 36,
  numberSlots: 4,
  numberOffsetThousands: -12,
  numberOffsetHundreds: -24,
  numberOffsetTens: -36,
  numberOffsetUnits: -48,
  numberMaximum: 9999,
  numberCentreSlots: 1.5,

  screenOffsetY: -30,
  overlayGap: 30,
  tutorialWidth: 114,
  tutorialHeight: 98,
  getReadyHeight: 50,
  gameOverHeight: 42,
  boardWidth: 226,
  boardHeight: 114,
  boardScoreTopMargin: 35,
  boardBestTopMargin: 75,
  boardCoinsTopMargin: 50,
  boardNumberCentreRight: 44,
  boardCoinsCentreLeft: 66,
  boardNumberScale: 0.5,

  buttonWidth: 104,
  buttonHeight: 58,
  buttonSpacing: 18,
  buttonPressedAlpha: 0.5,
  menuTopMargin: 15,

  logoHeight: 100,
  logoTopMargin: 60,

  scoreTopY: 30,

  minimumReportableScore: 1
} as const

export const FlattyBirdCategories = {
  player: 1,
  obstacle: 2,
  gate: 3
} as const
