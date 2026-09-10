import { AUDIO, FONT, SCENE, SPRITE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  for (const config of SPRITE.SPRITES) {
    loadSprite(config.id, config.file, {
      sliceX: config.sliceX,
      sliceY: config.sliceY,
      anims: config.anims,
    })
  }

  const soundAssets = Object.values(AUDIO.SOUND).map((file) =>
    loadSound(file, file),
  )

  for (const [name, file] of Object.entries(AUDIO.MUSIC)) {
    loadMusic(name, file)
  }

  loadSprite(SPRITE.SOUND_ICONS.ON.id, SPRITE.SOUND_ICONS.ON.file)
  loadSprite(SPRITE.SOUND_ICONS.MUTED.id, SPRITE.SOUND_ICONS.MUTED.file)

  const fonts = [
    loadFont(FONT.SECONDARY, `fonts/${FONT.SECONDARY}.ttf`),
    loadFont(FONT.PRIMARY, `fonts/${FONT.PRIMARY}.ttf`),
  ]

  void Promise.all([...fonts, ...soundAssets]).then(() => {
    go(applyQuerystringOverrides())
  })
})
