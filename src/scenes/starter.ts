import { PERSONALITY, SCENE, STAT, TYPE } from '../constants'
import { addCard, addEnemyPreview } from '../gameobjects'
import { runState } from '../state'
import { randomMonsterPool, spawnWave } from '../utils'

scene(SCENE.STARTER, () => {
  const starters = randomMonsterPool(3, 1)

  // generate wave 1 enemies for preview
  runState.enemyTeam = spawnWave(1)

  add([
    text('Choose your starter!', { size: 24 }),
    pos(center().x, 60),
    anchor('center'),
    color(255, 220, 100),
  ])

  addEnemyPreview(runState.enemyTeam, {
    label: 'Upcoming Enemies',
    y: 145,
  })

  starters.forEach((monster, i) => {
    const x = center().x
    const y = 280 + i * 220

    const card = addCard({
      x,
      y,
      width: 480,
      height: 180,
      color: [40, 40, 60],
    })

    // monster sprite
    add([
      sprite(monster.spriteId, { height: STAT.MONSTER_HEIGHT }),
      pos(x - 120, y),
      anchor('center'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // name and type
    add([text(monster.name, { size: 20 }), pos(x + 40, y - 50), color(WHITE)])

    add([
      text(`Type: ${TYPE.TYPE_LABELS[monster.type]}`, { size: 20 }),
      pos(x + 40, y - 25),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(`Nature: ${PERSONALITY.PERSONALITY_LABELS[monster.personality]}`, {
        size: 20,
      }),
      pos(x + 40, y),
      color(200, 200, 200),
    ])

    add([
      text(
        `HP ${String(monster.maxHp)}  ATK ${String(monster.baseStats.attack)}`,
        {
          size: 20,
        },
      ),
      pos(x + 40, y + 25),
      color(180, 180, 180),
    ])

    add([
      text(
        `DEF ${String(monster.baseStats.defense)}  SPD ${String(monster.baseStats.speed)}`,
        {
          size: 20,
        },
      ),
      pos(x + 40, y + 50),
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
