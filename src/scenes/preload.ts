import { AUDIO, FONT, ICON, SCENE, SPRITE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  for (const sprite of SPRITE.SPRITES) {
    loadSprite(sprite.id, sprite.file, {
      sliceX: sprite.sliceX,
      sliceY: sprite.sliceY,
      anims: sprite.anims,
    })
  }

  for (const file of Object.values(AUDIO.SOUND)) {
    loadSound(file, file)
  }

  for (const [name, file] of Object.entries(AUDIO.MUSIC)) {
    loadMusic(name, file)
  }

  for (const icon of Object.values(ICON)) {
    for (const id of Object.values(icon)) {
      loadSprite(id, `icons/${id}.png`)
    }
  }

  const fonts = [
    loadFont(FONT.SECONDARY, `fonts/${FONT.SECONDARY}.ttf`),
    loadFont(FONT.PRIMARY, `fonts/${FONT.PRIMARY}.ttf`),
  ]

  void Promise.all(fonts).then(() => {
    go(applyQuerystringOverrides())
  })
})
