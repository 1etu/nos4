import { createSignal } from 'solid-js'
import { NSUserDefaults } from 'NSUserDefaults'

export const FlattyBirdPhase = {
  wait: 'wait',
  play: 'play',
  gameOver: 'gameOver'
} as const

export type FlattyBirdPhaseValue = (typeof FlattyBirdPhase)[keyof typeof FlattyBirdPhase]

export const FlattyBirdFlow = {
  menu: 'menu',
  game: 'game'
} as const

export type FlattyBirdFlowValue = (typeof FlattyBirdFlow)[keyof typeof FlattyBirdFlow]

const BestKey = 'flattybird_best'
const CoinsKey = 'flattybird_coins'

const stored = (key: string): number => Number(NSUserDefaults.string(key) ?? '0')

const [phase, setPhase] = createSignal<FlattyBirdPhaseValue>(FlattyBirdPhase.wait)
const [score, setScore] = createSignal(0)
const [best, setBest] = createSignal(stored(BestKey))
const [coins, setCoins] = createSignal(stored(CoinsKey))

export const flattyBirdPhase = phase
export const flattyBirdScore = score
export const flattyBirdBest = best
export const flattyBirdCoins = coins

const [frames, setFrames] = createSignal(0)
const [inputs, setInputs] = createSignal(0)
const [startedAt, setStartedAt] = createSignal(0)

export const flattyBirdFrames = frames
export const flattyBirdInputs = inputs

export const flattyBirdCountFrame = (): void => {
  setFrames(frames() + 1)
}

export const flattyBirdCountInput = (): void => {
  setInputs(inputs() + 1)
}

export const flattyBirdRunDuration = (): number =>
  startedAt() === 0 ? 0 : Date.now() - startedAt()

export const flattyBirdReset = (): void => {
  setFrames(0)
  setInputs(0)
  setStartedAt(0)
  setScore(0)
  setPhase(FlattyBirdPhase.wait)
}

export const flattyBirdBegin = (): void => {
  setStartedAt(Date.now())
  setPhase(FlattyBirdPhase.play)
}

export const flattyBirdAddPoint = (): void => {
  setScore(score() + 1)
}

export const flattyBirdFinish = (): void => {
  if (phase() === FlattyBirdPhase.gameOver) return
  setPhase(FlattyBirdPhase.gameOver)

  setCoins(coins() + score())
  NSUserDefaults.setString(CoinsKey, String(coins()))

  if (score() <= best()) return
  setBest(score())
  NSUserDefaults.setString(BestKey, String(score()))
}
