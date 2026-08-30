import { skAddChild, skMakeScene, type SKNode, type SKScene } from 'SpriteKit'

import { FlattyBirdCategories, FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'
import { FlattyBirdSound, flattyBirdPlaySound } from '../Support/FlattyBirdAudio'
import {
  FlattyBirdPhase,
  flattyBirdAddPoint,
  flattyBirdBegin,
  flattyBirdBest,
  flattyBirdCoins,
  flattyBirdFinish,
  flattyBirdPhase,
  flattyBirdCountFrame,
  flattyBirdCountInput,
  flattyBirdFrames,
  flattyBirdInputs,
  flattyBirdReset,
  flattyBirdRunDuration,
  flattyBirdScore
} from '../Support/FlattyBirdGame'
import { flattyBirdSpinRotor } from '../Entities/FlattyBirdBackground'
import {
  flattyBirdMakePlayer,
  flattyBirdPush,
  flattyBirdResetPlayer,
  flattyBirdStopFlapping,
  flattyBirdStopWabble
} from '../Entities/FlattyBirdPlayer'
import { flattyBirdPipesEscaped, flattyBirdRecyclePipes } from '../Entities/FlattyBirdPipes'
import {
  flattyBirdMakeNumbers,
  flattyBirdSetNumber,
  type FlattyBirdNumbers
} from '../Entities/FlattyBirdNumbers'
import {
  flattyBirdMenuHit,
  flattyBirdPressButton,
  flattyBirdReleaseButtons
} from '../Entities/FlattyBirdButtons'
import {
  flattyBirdMakeLevel,
  flattyBirdResetLevel,
  flattyBirdStopLevel,
  type FlattyBirdLevel
} from './FlattyBirdLevel'
import {
  flattyBirdMakeGameOverScreen,
  flattyBirdMakeWaitScreen,
  flattyBirdShowResults,
  type FlattyBirdGameOverScreen,
  type FlattyBirdWaitScreen
} from './FlattyBirdScreens'

export interface FlattyBirdRunResult {
  readonly score: number
  readonly durationMilliseconds: number
  readonly frameCount: number
  readonly inputCount: number
}


export const flattyBirdMakeGameScene = (
  textures: FlattyBirdTextures,
  onRunBegan: () => void,
  onRunEnded: (run: FlattyBirdRunResult) => void,
  onScores: () => void
): SKScene => {
  let level: FlattyBirdLevel | undefined
  let waitScreen: FlattyBirdWaitScreen | undefined
  let overScreen: FlattyBirdGameOverScreen | undefined
  let counter: FlattyBirdNumbers | undefined
  let bird: SKNode | undefined
  let shown = -1

  const enterWaiting = (scene: SKScene) => {
    if (!level || !bird || !waitScreen || !overScreen) return
    flattyBirdReset()
    flattyBirdResetLevel(level)
    flattyBirdResetPlayer(bird)
    scene.gravityY = FlattyBirdMetrics.gravityWait
    waitScreen.node.visible = true
    overScreen.node.visible = false
  }

  return skMakeScene({
    width: FlattyBirdMetrics.sceneWidth,
    height: FlattyBirdMetrics.sceneHeight,
    gravityX: 0,
    gravityY: FlattyBirdMetrics.gravityWait,

    build: (root) => {
      level = flattyBirdMakeLevel(root, textures)

      bird = flattyBirdMakePlayer(textures.bird)
      root.children.splice(root.children.indexOf(level.ground), 0, bird)
      bird.parent = root

      counter = flattyBirdMakeNumbers(
        textures.white,
        textures.empty,
        FlattyBirdMetrics.sceneWidth / 2,
        FlattyBirdMetrics.scoreTopY,
        1
      )
      skAddChild(root, counter.node)

      waitScreen = flattyBirdMakeWaitScreen(textures)
      skAddChild(root, waitScreen.node)

      overScreen = flattyBirdMakeGameOverScreen(textures)
      overScreen.node.visible = false
      skAddChild(root, overScreen.node)

      flattyBirdResetPlayer(bird)
    },

    touchBegan: (scene, x, y) => {
      if (!bird || !waitScreen || !overScreen) return
      const phase = flattyBirdPhase()

      if (phase === FlattyBirdPhase.wait) {
        flattyBirdStopWabble(bird)
        flattyBirdBegin()
        onRunBegan()
        waitScreen.node.visible = false
        scene.gravityY = FlattyBirdMetrics.gravityPlay
        flattyBirdPush(bird)
        flattyBirdCountInput()
        flattyBirdPlaySound(FlattyBirdSound.wing)
        return
      }

      if (phase === FlattyBirdPhase.play) {
        flattyBirdPush(bird)
        flattyBirdCountInput()
        flattyBirdPlaySound(FlattyBirdSound.wing)
        return
      }

      const pressed = flattyBirdMenuHit(overScreen.menu, x, y)
      if (!pressed) return
      flattyBirdPressButton(pressed === 'play' ? overScreen.menu.play : overScreen.menu.scores)
      if (pressed === 'scores') {
        flattyBirdReleaseButtons(overScreen.menu)
        onScores()
        return
      }
      flattyBirdReleaseButtons(overScreen.menu)
      enterWaiting(scene)
    },

    contact: (scene, _dynamicNode, staticNode) => {
      if (!level || !bird || !overScreen) return
      if (flattyBirdPhase() !== FlattyBirdPhase.play) return

      if (staticNode.body?.category === FlattyBirdCategories.gate) {
        flattyBirdAddPoint()
        flattyBirdPlaySound(FlattyBirdSound.point)
        return
      }

      const finalScore = flattyBirdScore()
      const result = {
        score: finalScore,
        durationMilliseconds: flattyBirdRunDuration(),
        frameCount: flattyBirdFrames(),
        inputCount: flattyBirdInputs()
      }
      flattyBirdFinish()
      flattyBirdStopLevel(level)
      flattyBirdStopFlapping(bird)
      flattyBirdPlaySound(FlattyBirdSound.die)
      flattyBirdPlaySound(FlattyBirdSound.hit)
      scene.gravityY = FlattyBirdMetrics.gravityGameOver
      flattyBirdShowResults(overScreen, finalScore, flattyBirdBest(), flattyBirdCoins())
      overScreen.node.visible = true
      onRunEnded(result)
    },

    update: (_scene, dt) => {
      if (!level || !bird || !counter) return
      if (flattyBirdPhase() === FlattyBirdPhase.play) flattyBirdCountFrame()

      flattyBirdSpinRotor(level.background, dt)

      if (bird.body?.kind === 'dynamic') {
        bird.zRotation =
          flattyBirdPhase() === FlattyBirdPhase.wait
            ? 0
            : bird.body.velocityY * FlattyBirdMetrics.birdRotationRadiansPerVelocity
      }

      for (const pair of level.pipes) {
        if (flattyBirdPipesEscaped(pair)) flattyBirdRecyclePipes(pair)
      }

      const score = flattyBirdScore()
      if (score !== shown) {
        shown = score
        flattyBirdSetNumber(counter, score)
      }
      counter.node.visible = flattyBirdPhase() !== FlattyBirdPhase.gameOver
    }
  })
}
