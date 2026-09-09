import { SCENE, SPRITE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  for (const config of SPRITE.SPRITES) {
    loadSprite(config.id, config.file, {
      sliceX: config.sliceX,
      sliceY: config.sliceY,
      anims: config.anims,
    })
  }

  go(applyQuerystringOverrides())
})
