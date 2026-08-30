import { skAddChild, skMakeScene, skMakeSprite, type SKNode, type SKScene } from 'SpriteKit'
import { FlattyBirdMetrics } from '../Support/FlattyBirdMetrics'
import type { FlattyBirdTextures } from '../Support/FlattyBirdTextures'
import {
  flattyBirdMakeBackground,
  flattyBirdSpinRotor,
  type FlattyBirdBackground
} from '../Entities/FlattyBirdBackground'
import { flattyBirdMakeGround } from '../Entities/FlattyBirdGround'
import {
  flattyBirdMakePlayer,
  flattyBirdResetPlayer
} from '../Entities/FlattyBirdPlayer'
import {
  flattyBirdMakeMenu,
  flattyBirdMenuHit,
  flattyBirdPressButton,
  flattyBirdReleaseButtons,
  type FlattyBirdMenu
} from '../Entities/FlattyBirdButtons'

const GroundTop = FlattyBirdMetrics.sceneHeight - FlattyBirdMetrics.groundHeight

export const flattyBirdMakeMenuScene = (
  textures: FlattyBirdTextures,
  onPlay: () => void,
  onScores: () => void
): SKScene => {
  let background: FlattyBirdBackground | undefined
  let menu: FlattyBirdMenu | undefined
  let bird: SKNode | undefined

  return skMakeScene({
    width: FlattyBirdMetrics.sceneWidth,
    height: FlattyBirdMetrics.sceneHeight,
    gravityX: 0,
    gravityY: FlattyBirdMetrics.gravityWait,

    build: (root) => {
      background = flattyBirdMakeBackground(textures)
      skAddChild(root, background.node)

      skAddChild(
        root,
        skMakeSprite(
          textures.logo,
          FlattyBirdMetrics.sceneWidth / 2,
          FlattyBirdMetrics.logoTopMargin,
          0.5,
          0
        )
      )

      bird = flattyBirdMakePlayer(textures.bird)
      bird.body = undefined
      skAddChild(root, bird)

      skAddChild(root, flattyBirdMakeGround(textures.ground))

      menu = flattyBirdMakeMenu(textures, GroundTop - FlattyBirdMetrics.buttonHeight)
      skAddChild(root, menu.node)

      flattyBirdResetPlayer(bird, FlattyBirdMetrics.sceneWidth / 2, FlattyBirdMetrics.sceneHeight / 2)
    },

    touchBegan: (_scene, x, y) => {
      if (!menu) return
      const pressed = flattyBirdMenuHit(menu, x, y)
      if (!pressed) return
      flattyBirdPressButton(pressed === 'play' ? menu.play : menu.scores)
      if (pressed === 'play') onPlay()
      else onScores()
      flattyBirdReleaseButtons(menu)
    },

    contact: () => undefined,

    update: (_scene, dt) => {
      if (background) flattyBirdSpinRotor(background, dt)
    }
  })
}
