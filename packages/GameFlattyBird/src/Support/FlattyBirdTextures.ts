import { assetURL, type AssetName } from 'CoreGraphics'
import { skLoadTexture, skLoadTextures, type SKTexture } from 'SpriteKit'
import { FlattyBirdMetrics } from './FlattyBirdMetrics'

const WhiteDigits: readonly AssetName[] = [
  'FlattyBirdDigit0',
  'FlattyBirdDigit1',
  'FlattyBirdDigit2',
  'FlattyBirdDigit3',
  'FlattyBirdDigit4',
  'FlattyBirdDigit5',
  'FlattyBirdDigit6',
  'FlattyBirdDigit7',
  'FlattyBirdDigit8',
  'FlattyBirdDigit9'
]

const GoldDigits: readonly AssetName[] = [
  'FlattyBirdGold0',
  'FlattyBirdGold1',
  'FlattyBirdGold2',
  'FlattyBirdGold3',
  'FlattyBirdGold4',
  'FlattyBirdGold5',
  'FlattyBirdGold6',
  'FlattyBirdGold7',
  'FlattyBirdGold8',
  'FlattyBirdGold9'
]

export interface FlattyBirdTextures {
  readonly bird: SKTexture
  readonly pipe: SKTexture
  readonly ground: SKTexture
  readonly sky: SKTexture
  readonly rotor: SKTexture
  readonly logo: SKTexture
  readonly tutorial: SKTexture
  readonly getReady: SKTexture
  readonly gameOver: SKTexture
  readonly scoreBoard: SKTexture
  readonly playAgain: SKTexture
  readonly scores: SKTexture
  readonly empty: SKTexture
  readonly white: readonly SKTexture[]
  readonly gold: readonly SKTexture[]
}

const loadRow = (names: readonly AssetName[]): Promise<SKTexture[]> =>
  Promise.all(names.map((name) => skLoadTexture({ url: assetURL(name) })))

export const flattyBirdLoadTextures = async (): Promise<FlattyBirdTextures> => {
  const [sheets, white, gold] = await Promise.all([
    skLoadTextures({
      bird: {
        url: assetURL('FlattyBirdBird'),
        frameWidth: FlattyBirdMetrics.birdFrameWidth,
        frameHeight: FlattyBirdMetrics.birdFrameHeight
      },
      pipe: { url: assetURL('FlattyBirdPipe') },
      ground: {
        url: assetURL('FlattyBirdGround'),
        frameWidth: FlattyBirdMetrics.groundWidth,
        frameHeight: FlattyBirdMetrics.groundHeight
      },
      sky: { url: assetURL('FlattyBirdSky') },
      rotor: { url: assetURL('FlattyBirdRotor') },
      logo: { url: assetURL('FlattyBirdLogo') },
      tutorial: { url: assetURL('FlattyBirdTutorial') },
      getReady: { url: assetURL('FlattyBirdGetReady') },
      gameOver: { url: assetURL('FlattyBirdGameOver') },
      scoreBoard: { url: assetURL('FlattyBirdScoreBoard') },
      playAgain: { url: assetURL('FlattyBirdPlayAgain') },
      scores: { url: assetURL('FlattyBirdScores') },
      empty: { url: assetURL('FlattyBirdEmpty') }
    }),
    loadRow(WhiteDigits),
    loadRow(GoldDigits)
  ])

  return { ...sheets, white, gold }
}
