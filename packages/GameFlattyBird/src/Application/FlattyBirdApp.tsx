import { createSignal, onMount, Show } from 'solid-js'
import { GKHighScoreLeaderboard, gkIsAuthenticated, gkOpenRun, gkSubmitScore } from 'GameKit'
import type { GKGameRun } from 'GameKit'
import { SKView, type SKScene } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import { FlattyBirdFlow, type FlattyBirdFlowValue } from '../Support/FlattyBirdGame'
import { flattyBirdLoadTextures } from '../Support/FlattyBirdTextures'
import {
  FlattyBirdSound,
  flattyBirdLoadSounds,
  flattyBirdPlaySound
} from '../Support/FlattyBirdAudio'
import { flattyBirdMakeMenuScene } from '../Scene/FlattyBirdMenuScene'
import {
  flattyBirdMakeGameScene,
  type FlattyBirdRunResult
} from '../Scene/FlattyBirdGameScene'

interface FlattyBirdScenes {
  readonly menu: SKScene
  readonly game: SKScene
}

export const FlattyBirdApp = (props: {
  width: number
  height: number
  onScores?: () => void
}) => {
  const [scenes, setScenes] = createSignal<FlattyBirdScenes | undefined>()
  const [flow, setFlow] = createSignal<FlattyBirdFlowValue>(FlattyBirdFlow.menu)

  let openRun: GKGameRun | undefined

  const beginRun = () => {
    if (!gkIsAuthenticated()) return
    void gkOpenRun(GKHighScoreLeaderboard).then((run) => {
      openRun = run
    })
  }

  const finishRun = (result: FlattyBirdRunResult) => {
    const run = openRun
    openRun = undefined
    if (!run || result.score < FlattyBirdMetrics.minimumReportableScore) return
    void gkSubmitScore(
      run,
      GKHighScoreLeaderboard,
      result.score,
      result.durationMilliseconds,
      result.frameCount,
      result.inputCount
    )
  }

  const show = (next: FlattyBirdFlowValue) => {
    setFlow(next)
    flattyBirdPlaySound(FlattyBirdSound.swooshing)
  }

  onMount(() => {
    void flattyBirdLoadTextures().then((textures) => {
      setScenes({
        menu: flattyBirdMakeMenuScene(
          textures,
          () => show(FlattyBirdFlow.game),
          () => props.onScores?.()
        ),
        game: flattyBirdMakeGameScene(textures, beginRun, finishRun, () => props.onScores?.())
      })
    })
    void flattyBirdLoadSounds()
  })

  const current = (): SKScene | undefined => {
    const ready = scenes()
    if (!ready) return undefined
    if (flow() === FlattyBirdFlow.game) return ready.game
    return ready.menu
  }

  return (
    <div
      class="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: 'black' }}
    >
      <Show when={current()}>
        {(ready) => <SKView width={props.width} height={props.height} scene={ready()} />}
      </Show>
    </div>
  )
}
