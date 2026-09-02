import { SCENE, TYPE } from '../constants'
import { addButton, addCard } from '../gameobjects'
import { runState } from '../state'
import type { Monster } from '../types'

scene(SCENE.TAME, () => {
  const { defeatedEnemies, playerTeam } = runState

  add([
    text('Tame or Sell', { size: 28 }),
    pos(center().x, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  add([
    text('Select 1 defeated enemy', { size: 20 }),
    pos(center().x, 120),
    anchor('center'),
    color(200, 200, 200),
  ])

  let selected: Monster | null = null

  const cardBorders: ReturnType<typeof createCardBorder>[] = []

  function createCardBorder(x: number, y: number) {
    return add([
      rect(488, 148, { radius: 14 }),
      pos(x, y),
      anchor('center'),
      color(100, 100, 140),
      opacity(0),
    ])
  }

  const cards: ReturnType<typeof addCard>[] = []

  defeatedEnemies.forEach((monster, i) => {
    const x = center().x
    const y = 220 + i * 180

    const border = createCardBorder(x, y)
    cardBorders.push(border)

    const card = addCard({
      x,
      y,
      width: 480,
      height: 140,
      color: [40, 40, 60],
    })
    cards.push(card)

    add([
      sprite(monster.spriteId),
      pos(x - 120, y),
      anchor('center'),
      scale(3),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([text(monster.name, { size: 20 }), pos(x + 40, y - 40), color(WHITE)])

    add([
      text(`${TYPE.TYPE_LABELS[monster.type]} Lv${String(monster.level)}`, {
        size: 20,
      }),
      pos(x + 40, y - 15),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(
        `HP ${String(monster.maxHp)}  ATK ${String(monster.baseStats.attack)}`,
        { size: 20 },
      ),
      pos(x + 40, y + 10),
      color(180, 180, 180),
    ])

    add([
      text(
        `DEF ${String(monster.baseStats.defense)}  SPD ${String(monster.baseStats.speed)}`,
        { size: 20 },
      ),
      pos(x + 40, y + 35),
      color(180, 180, 180),
    ])

    card.onClick(() => {
      selected = monster
      for (let j = 0; j < cards.length; j++) {
        cards[j].color = rgb(40, 40, 60)
        cardBorders[j].opacity = 0
      }
      card.color = rgb(60, 60, 90)
      border.opacity = 1
      tameButton.setDisabled(false)
      sellButton.setDisabled(false)
    })
  })

  const tameButton = addButton({
    x: center().x - 100,
    y: height() - 80,
    width: 160,
    height: 56,
    color: [60, 180, 80],
    label: 'Tame',
    isFixed: true,
    disabled: true,
  })

  tameButton.onClick(() => {
    if (!selected) return
    if (playerTeam.length < 3) {
      // revive tamed monster at full HP
      selected.isAlive = true
      selected.currentHp = selected.maxHp
      playerTeam.push(selected)
      go(SCENE.SHOP)
    } else {
      // team full — replace first benched monster
      const activeIdx = runState.activePlayerIndex
      const benchIdx = playerTeam.findIndex((_m, i) => i !== activeIdx)
      if (benchIdx >= 0) {
        selected.isAlive = true
        selected.currentHp = selected.maxHp
        playerTeam[benchIdx] = selected
        go(SCENE.SHOP)
      }
    }
  })

  const sellButton = addButton({
    x: center().x + 100,
    y: height() - 80,
    width: 160,
    height: 56,
    color: [200, 160, 60],
    label: 'Sell',
    isFixed: true,
    disabled: true,
  })

  sellButton.onClick(() => {
    if (!selected) return
    const sellPrice = selected.level * 10
    runState.coins += sellPrice
    go(SCENE.SHOP)
  })

  const skipButton = addButton({
    x: center().x,
    y: height() - 140,
    width: 120,
    height: 48,
    color: [80, 80, 80],
    label: 'Skip',
    labelSize: 20,
    isFixed: true,
  })

  skipButton.onClick(() => {
    go(SCENE.SHOP)
  })
})
