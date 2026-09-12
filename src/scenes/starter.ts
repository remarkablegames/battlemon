import { MOVE, SCENE, STAT, TYPE } from '../constants'
import { addCard, addEnemyPreview, addSoundToggle } from '../gameobjects'
import { runState } from '../state'
import {
  initHoverGate,
  monsterHeight,
  playMusic,
  randomMonsterPool,
  spawnWave,
} from '../utils'

const CARD_MONSTER_OFFSET_X = -140
const CARD_TEXT_OFFSET_X = -30

scene(SCENE.STARTER, () => {
  initHoverGate()
  const starters = randomMonsterPool(3, 1)
  playMusic('journey')
  addSoundToggle()

  // generate wave 1 enemies for preview
  runState.enemyTeam = spawnWave(1)

  add([
    text('Choose your starter!', { size: 28 }),
    pos(center().x, 60),
    anchor('center'),
    color(255, 220, 100),
  ])

  addEnemyPreview(runState.enemyTeam, {
    label: 'Upcoming Enemies',
    y: 145,
  })

  starters.forEach((monster, index) => {
    const x = center().x
    const y = 290 + index * 190

    const card = addCard({
      x,
      y,
      width: 480,
      height: 180,
      color: [40, 40, 60],
    })

    const monsterSprite = add([
      sprite(monster.spriteId, {
        height: monsterHeight(monster.spriteId),
        animSpeed: STAT.ANIM_SPEED,
      }),
      pos(x + CARD_MONSTER_OFFSET_X, y),
      anchor('center'),
    ])
    monsterSprite.play('idle')

    // monster name
    add([
      text(monster.name, { size: 26 }),
      pos(x + CARD_TEXT_OFFSET_X, y - 50),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // monster stats
    add([
      text(
        `HP ${String(monster.maxHp)} | ATK ${String(monster.baseStats.attack)}`,
        { size: 22 },
      ),
      pos(x + CARD_TEXT_OFFSET_X, y - 20),
      color(180, 180, 180),
    ])

    add([
      text(
        `DEF ${String(monster.baseStats.defense)} | SPD ${String(monster.baseStats.speed)}`,
        { size: 22 },
      ),
      pos(x + CARD_TEXT_OFFSET_X, y + 5),
      color(180, 180, 180),
    ])

    add([
      text(`Special: ${MOVE.SPECIAL_MOVES[monster.type].name}`, { size: 22 }),
      pos(x + CARD_TEXT_OFFSET_X, y + 30),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    card.onClick(() => {
      runState.playerTeam = [monster]
      runState.wave = 1
      runState.activePlayerIndex = 0
      runState.battleRoster = [0]
      go(SCENE.BATTLE)
    })
  })
})
