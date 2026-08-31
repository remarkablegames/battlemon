import { PERSONALITY, SCENE, TYPE } from '../constants'
import { randomMonsterPool } from '../gameobjects/monster'
import { runState } from '../state'

scene(SCENE.STARTER, () => {
  const starters = randomMonsterPool(3, 1)

  add([
    text('Choose your starter!', { size: 24 }),
    pos(center().x, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  starters.forEach((monster, i) => {
    const x = center().x
    const y = 180 + i * 220

    const card = add([
      rect(360, 180),
      pos(x, y),
      color(40, 40, 60),
      area(),
      anchor('center'),
    ])

    // monster sprite
    add([
      sprite(monster.spriteId),
      pos(x - 120, y),
      anchor('center'),
      scale(3),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // name and type
    add([text(monster.name, { size: 16 }), pos(x + 40, y - 50), color(WHITE)])

    add([
      text(`Type: ${TYPE.TYPE_LABELS[monster.type]}`, { size: 14 }),
      pos(x + 40, y - 25),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(`Nature: ${PERSONALITY.PERSONALITY_LABELS[monster.personality]}`, {
        size: 14,
      }),
      pos(x + 40, y),
      color(200, 200, 200),
    ])

    add([
      text(
        `HP ${String(monster.maxHp)}  ATK ${String(monster.baseStats.attack)}  DEF ${String(monster.baseStats.defense)}  SPD ${String(monster.baseStats.speed)}`,
        { size: 12 },
      ),
      pos(x + 40, y + 25),
      color(180, 180, 180),
    ])

    card.onClick(() => {
      runState.playerTeam = [monster]
      runState.wave = 1
      runState.activePlayerIndex = 0
      go(SCENE.WAVE_START)
    })
  })
})
