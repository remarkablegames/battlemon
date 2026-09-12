import { SCENE, STAT, TYPE } from '../constants'
import {
  addButton,
  addCard,
  addSoundToggle,
  addTeamOverlay,
} from '../gameobjects'
import { runState } from '../state'
import type { Monster } from '../types'
import { initHoverGate, monsterHeight, playMusic, sfx } from '../utils'

const CARD_WIDTH = 480
const CARD_HEIGHT = 120
const CARD_TEXT_X = 60
const CARD_TEXT_START_Y = -26
const CARD_TEXT_ROW_GAP = 30

scene(SCENE.TAME, () => {
  initHoverGate()
  const { defeatedEnemies, playerTeam } = runState
  playMusic('rest')
  addSoundToggle()

  add([
    text('Tame', { size: 36 }),
    pos(center().x, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  add([
    text('Select 1 defeated enemy', { size: 26 }),
    pos(center().x, 120),
    anchor('center'),
    color(200, 200, 200),
  ])

  let selected: Monster | null = null

  let discardOverlay: ReturnType<typeof showDiscardOverlay> | null = null

  const cardBorders: ReturnType<typeof createCardBorder>[] = []

  function createCardBorder(x: number, y: number) {
    return add([
      rect(CARD_WIDTH, CARD_HEIGHT, { radius: 14, fill: false }),
      pos(x, y),
      anchor('center'),
      outline(0, rgb(100, 200, 100)),
      z(1),
    ])
  }

  const cards: ReturnType<typeof addCard>[] = []

  defeatedEnemies.forEach((monster, index) => {
    const x = center().x
    const y = 220 + index * 180

    const border = createCardBorder(x, y)
    cardBorders.push(border)

    const card = addCard({
      x,
      y,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      color: [40, 40, 60],
    })
    cards.push(card)

    const monsterSprite = add([
      sprite(monster.spriteId, {
        height: monsterHeight(monster.spriteId),
        animSpeed: STAT.ANIM_SPEED,
      }),
      pos(x - 160, y),
      anchor('center'),
    ])
    monsterSprite.play('idle')

    add([
      text(`${monster.name} Lv${String(monster.level)}`, { size: 26 }),
      pos(x - CARD_TEXT_X, y + CARD_TEXT_START_Y),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(
        `HP ${String(monster.maxHp)}  ATK ${String(monster.baseStats.attack)}`,
        { size: 24 },
      ),
      pos(x - CARD_TEXT_X, y + CARD_TEXT_START_Y + CARD_TEXT_ROW_GAP),
      anchor('left'),
      color(180, 180, 180),
    ])

    add([
      text(
        `DEF ${String(monster.baseStats.defense)}  SPD ${String(monster.baseStats.speed)}`,
        { size: 24 },
      ),
      pos(x - CARD_TEXT_X, y + CARD_TEXT_START_Y + CARD_TEXT_ROW_GAP * 2 - 4),
      anchor('left'),
      color(180, 180, 180),
    ])

    card.onClick(() => {
      if (discardOverlay) return
      selected = monster
      for (let j = 0; j < cards.length; j++) {
        cards[j].color = rgb(40, 40, 60)
        cardBorders[j].outline.width = 0
      }
      card.color = rgb(60, 60, 90)
      border.outline.width = 4
      tameButton.setDisabled(false)
    })
  })

  const tameButton = addButton({
    x: center().x - 90,
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
    if (discardOverlay) return
    if (playerTeam.length < STAT.MAX_TEAM_SIZE) {
      // revive tamed monster at full HP
      selected.isAlive = true
      selected.currentHp = selected.maxHp
      playerTeam.push(selected)
      go(SCENE.SHOP)
    } else {
      // team full — let the player pick which monster to discard
      selected.isAlive = true
      selected.currentHp = selected.maxHp
      showDiscardOverlay(selected)
    }
  })

  function showDiscardOverlay(tamed: Monster) {
    const overlay = addTeamOverlay(playerTeam, {
      title: 'Discard for Tame',
      subtitle: "Team's full. Tap a monster to discard",
      onSelect: (monster) => {
        sfx('continue')
        playerTeam.splice(playerTeam.indexOf(monster), 1, tamed)
        go(SCENE.SHOP)
      },
    })

    discardOverlay = overlay.root

    overlay.root.onDestroy(() => {
      discardOverlay = null
    })

    return overlay.root
  }

  const skipButton = addButton({
    x: center().x + 90,
    y: height() - 80,
    width: 160,
    height: 56,
    color: [80, 80, 80],
    label: 'Skip',
    isFixed: true,
  })

  skipButton.onClick(() => {
    go(SCENE.SHOP)
  })
})
