import { SCENE, SPRITESHEET } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  for (const config of SPRITESHEET.SPRITESHEETS) {
    loadSprite(config.id, config.file, {
      sliceX: config.sliceX,
      sliceY: config.sliceY,
      anims: config.anims,
    })
  }

  go(applyQuerystringOverrides())
})
