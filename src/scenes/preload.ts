import { AUDIO, FONT, ICON, SCENE, SPRITE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  const fonts = Object.values(FONT).map((font) =>
    loadFont(font, `fonts/${FONT.SECONDARY}.ttf`),
  )

  for (const sprite of SPRITE.SPRITES) {
    loadSprite(sprite.id, sprite.file, {
      sliceX: sprite.sliceX,
      sliceY: sprite.sliceY,
      anims: sprite.anims,
    })
  }

  for (const icon of Object.values(ICON)) {
    loadSprite(icon, `icons/${icon}.png`)
  }

  for (const sound of Object.values(AUDIO.SOUND)) {
    loadSound(sound, sound)
  }

  for (const [name, file] of Object.entries(AUDIO.MUSIC)) {
    loadMusic(name, file)
  }

  void Promise.all(fonts).then(() => {
    go(applyQuerystringOverrides())
  })
})
