import { SCENE, TYPE } from '../constants'
import { applyQuerystringOverrides } from '../utils'

scene(SCENE.PRELOAD, () => {
  // collect all unique sprite ids from the type chart
  const spriteIds = new Set<string>()
  for (const sprites of Object.values(TYPE.TYPE_SPRITES)) {
    for (const id of sprites) {
      spriteIds.add(id)
    }
  }

  // load all monster sprites
  for (const id of spriteIds) {
    loadSprite(id, `sprites/${id}.png`)
  }

  go(applyQuerystringOverrides())
})
