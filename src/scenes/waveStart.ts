import { SCENE, TYPE } from '../constants'
import { addCard } from '../gameobjects'
import { runState } from '../state'

scene(SCENE.WAVE_START, () => {
  const { playerTeam, wave } = runState

  add([
    text(`Wave ${String(wave)}`, { size: 28 }),
    pos(center().x, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  add([
    text('Select your monster', { size: 20 }),
    pos(center().x, 120),
    anchor('center'),
    color(200, 200, 200),
  ])

  playerTeam.forEach((monster, i) => {
    if (!monster.isAlive) return

    const x = center().x
    const y = 240 + i * 200

    const card = addCard({
      x,
      y,
      width: 480,
      height: 160,
      color: [40, 40, 60],
    })

    add([
      sprite(monster.spriteId),
      pos(x - 110, y),
      anchor('center'),
      scale(3),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(monster.name, { size: 20 }),
      pos(x + 40, y - 40),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(`${TYPE.TYPE_LABELS[monster.type]} Lv${String(monster.level)}`, {
        size: 20,
      }),
      pos(x + 40, y - 15),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(
        `HP: ${String(Math.ceil(monster.currentHp))}/${String(monster.maxHp)}`,
        {
          size: 20,
        },
      ),
      pos(x + 40, y + 10),
      color(100, 255, 100),
    ])

    card.onClick(() => {
      runState.activePlayerIndex = i
      go(SCENE.ARENA)
    })
  })
})
