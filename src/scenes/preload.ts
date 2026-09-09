import { FONT, SCENE, SPRITE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  for (const config of SPRITE.SPRITES) {
    loadSprite(config.id, config.file, {
      sliceX: config.sliceX,
      sliceY: config.sliceY,
      anims: config.anims,
    })
  }

  const fonts = [
    loadFont(FONT.HP, `fonts/${FONT.HP}.ttf`),
    loadFont(FONT.DEFAULT, `fonts/${FONT.DEFAULT}.ttf`),
  ]

  void Promise.all(fonts).then(() => {
    go(applyQuerystringOverrides())
  })
})
