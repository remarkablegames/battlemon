import { MOVE, SCENE, STAT, TYPE } from '../constants'
import { addButton, addCard } from '../gameobjects'
import { runState } from '../state'
import type { ItemDef, Monster } from '../types'
import { addToTeam, fullHealTeam, randomMonster } from '../utils'

interface TeamOverlayOptions {
  title: string
  subtitle?: string
  onSelect?: (monster: Monster, i: number) => void
  rowRightText?: (monster: Monster) => string
}

const SHOP_ITEMS: ItemDef[] = [
  {
    id: 'boost_attack',
    kind: 'stat_boost_attack',
    label: 'Power Surge',
    description: '+20% Attack',
    price: 30,
  },
  {
    id: 'boost_defense',
    kind: 'stat_boost_defense',
    label: 'Iron Skin',
    description: '+20% Defense',
    price: 30,
  },
  {
    id: 'boost_hp',
    kind: 'stat_boost_hp',
    label: 'Vitality',
    description: '+30% Max HP',
    price: 30,
  },
  {
    id: 'boost_speed',
    kind: 'stat_boost_speed',
    label: 'Haste',
    description: '+20% Speed',
    price: 30,
  },
  {
    id: 'full_heal',
    kind: 'full_heal',
    label: 'Full Restore',
    description: 'Heal entire team',
    price: 20,
  },
  {
    id: 'learn_move',
    kind: 'learn_move',
    label: 'Learn Move',
    description: 'Learn 1 random move',
    price: 40,
  },
  {
    id: 'buy_monster',
    kind: 'buy_monster',
    label: 'Recruit Monster',
    description: 'Add 1 random monster',
    price: 50,
  },
  {
    id: 'heal_potion',
    kind: 'heal_potion',
    label: 'Heal Potion',
    description: 'Full heal in battle',
    price: 15,
  },
  {
    id: 'revive',
    kind: 'revive',
    label: 'Revive',
    description: 'Revive at 50% HP',
    price: 25,
  },
]

scene(SCENE.SHOP, () => {
  const { playerTeam, coins } = runState

  add([
    text('Shop', { size: 28 }),
    pos(center().x, 60),
    anchor('center'),
    color(255, 220, 100),
  ])

  const coinLabel = add([
    text(`${String(coins)} coins`, { size: 20 }),
    pos(center().x, 95),
    anchor('center'),
    color(255, 220, 80),
  ])

  function refreshCoins() {
    coinLabel.text = `${String(runState.coins)} coins`
  }

  const cards: ReturnType<typeof addCard>[] = []

  SHOP_ITEMS.forEach((item, i) => {
    const y = 145 + i * 80

    const card = addCard({
      x: center().x,
      y,
      width: 460,
      height: 70,
      color: [50, 50, 80],
    })
    cards.push(card)

    add([
      text(item.label, { size: 20 }),
      pos(56, y - 14),
      anchor('left'),
      color(WHITE),
    ])

    add([
      text(item.description, { size: 20 }),
      pos(56, y + 14),
      anchor('left'),
      color(200, 200, 200),
    ])

    add([
      text(`${String(item.price)} coins`, { size: 20 }),
      pos(width() - 56, y),
      anchor('right'),
      color(255, 220, 80),
    ])

    card.onClick(() => {
      if (selectOverlay) return
      if (runState.coins < item.price) return
      if (NEEDS_SELECTION.has(item.kind)) {
        openMonsterSelect(item)
      } else {
        runState.coins -= item.price
        applyPurchase(item)
        refreshCoins()
      }
    })
  })

  const NEEDS_SELECTION = new Set([
    'stat_boost_attack',
    'stat_boost_defense',
    'stat_boost_hp',
    'stat_boost_speed',
    'learn_move',
  ])

  let selectOverlay: ReturnType<typeof addTeamOverlay> | null = null

  function addTeamOverlay(options: TeamOverlayOptions) {
    const overlay = add([pos(0, 0), fixed(), z(100)])
    selectOverlay = overlay
    cards.forEach((card) => {
      card.tag('disabled')
    })

    function close() {
      cards.forEach((card) => {
        card.untag('disabled')
      })
      destroy(overlay)
      selectOverlay = null
    }

    overlay.add([
      rect(width(), height()),
      pos(0, 0),
      color(0, 0, 0),
      opacity(0.7),
    ])

    const panelWidth = 440
    const panelHeight = 150 + playerTeam.length * 80
    const panelX = (width() - panelWidth) / 2
    const panelY = (height() - panelHeight) / 2

    overlay.add([
      rect(panelWidth, panelHeight, { radius: 16 }),
      pos(panelX, panelY),
      color(30, 30, 50),
    ])

    overlay.add([
      text(options.title, { size: 24 }),
      pos(width() / 2, panelY + 30),
      anchor('center'),
      color(255, 220, 100),
    ])

    if (options.subtitle) {
      overlay.add([
        text(options.subtitle, { size: 20 }),
        pos(width() / 2, panelY + 60),
        anchor('center'),
        color(200, 200, 200),
      ])
    }

    const listStartY = panelY + 100
    const rowHeight = 80

    playerTeam.forEach((monster, i) => {
      const rowY = listStartY + i * rowHeight

      const row = overlay.add([
        rect(panelWidth - 40, 70, { radius: 10 }),
        pos(panelX + 20, rowY),
        color(50, 50, 80),
        area(),
      ])

      overlay.add([
        sprite(monster.spriteId, { height: STAT.MONSTER_ICON_HEIGHT }),
        pos(panelX + 60, rowY + 35),
        anchor('center'),
        color(rgb(TYPE.TYPE_COLORS[monster.type])),
      ])

      overlay.add([
        text(monster.name, { size: 20 }),
        pos(panelX + 110, rowY + 20),
        anchor('left'),
        color(WHITE),
      ])

      overlay.add([
        text(
          `${TYPE.TYPE_LABELS[monster.type]} Lv${String(monster.level)}  HP ${String(monster.maxHp)}  ATK ${String(monster.baseStats.attack)}`,
          { size: 20 },
        ),
        pos(panelX + 110, rowY + 48),
        anchor('left'),
        color(180, 180, 180),
      ])

      if (options.rowRightText) {
        overlay.add([
          text(options.rowRightText(monster), { size: 20 }),
          pos(panelX + panelWidth - 40, rowY + 20),
          anchor('right'),
          color(255, 220, 80),
        ])
      }

      if (options.onSelect) {
        const onSelect = options.onSelect

        row.onHover(() => {
          setCursor('pointer')
          row.color = rgb(70, 70, 100)
        })

        row.onHoverEnd(() => {
          setCursor('default')
          row.color = rgb(50, 50, 80)
        })

        row.onClick(() => {
          onSelect(monster, i)
          close()
        })
      }
    })

    const cancelButton = overlay.add([
      rect(120, 44, { radius: 8 }),
      pos(width() / 2, panelY + panelHeight - 35),
      anchor('center'),
      color(80, 80, 80),
      area(),
    ])

    overlay.add([
      text('Cancel', { size: 20 }),
      pos(width() / 2, panelY + panelHeight - 35),
      anchor('center'),
      color(WHITE),
    ])

    cancelButton.onHover(() => {
      setCursor('pointer')
      cancelButton.color = rgb(100, 100, 100)
    })

    cancelButton.onHoverEnd(() => {
      setCursor('default')
      cancelButton.color = rgb(80, 80, 80)
    })

    cancelButton.onClick(() => {
      close()
    })

    return overlay
  }

  function addItemsOverlay() {
    const overlay = add([pos(0, 0), fixed(), z(100)])
    selectOverlay = overlay
    cards.forEach((card) => {
      card.tag('disabled')
    })

    function close() {
      cards.forEach((card) => {
        card.untag('disabled')
      })
      destroy(overlay)
      selectOverlay = null
    }

    overlay.add([
      rect(width(), height()),
      pos(0, 0),
      color(0, 0, 0),
      opacity(0.7),
    ])

    const items = runState.inventory
    const panelWidth = 440
    const panelHeight = 120 + Math.max(1, items.length) * 60
    const panelX = (width() - panelWidth) / 2
    const panelY = (height() - panelHeight) / 2

    overlay.add([
      rect(panelWidth, panelHeight, { radius: 16 }),
      pos(panelX, panelY),
      color(30, 30, 50),
    ])

    overlay.add([
      text('Items', { size: 24 }),
      pos(width() / 2, panelY + 30),
      anchor('center'),
      color(255, 220, 100),
    ])

    if (items.length === 0) {
      overlay.add([
        text('No items', { size: 20 }),
        pos(width() / 2, panelY + 80),
        anchor('center'),
        color(200, 200, 200),
      ])
    } else {
      const listStartY = panelY + 70
      const rowHeight = 60

      items.forEach((item, i) => {
        const rowY = listStartY + i * rowHeight

        overlay.add([
          text(item.label, { size: 20 }),
          pos(panelX + 30, rowY),
          anchor('left'),
          color(WHITE),
        ])

        overlay.add([
          text(item.description, { size: 20 }),
          pos(panelX + 30, rowY + 25),
          anchor('left'),
          color(200, 200, 200),
        ])
      })
    }

    const cancelButton = overlay.add([
      rect(120, 44, { radius: 8 }),
      pos(width() / 2, panelY + panelHeight - 35),
      anchor('center'),
      color(80, 80, 80),
      area(),
    ])

    overlay.add([
      text('Cancel', { size: 20 }),
      pos(width() / 2, panelY + panelHeight - 35),
      anchor('center'),
      color(WHITE),
    ])

    cancelButton.onHover(() => {
      setCursor('pointer')
      cancelButton.color = rgb(100, 100, 100)
    })

    cancelButton.onHoverEnd(() => {
      setCursor('default')
      cancelButton.color = rgb(80, 80, 80)
    })

    cancelButton.onClick(() => {
      close()
    })

    return overlay
  }

  function openMonsterSelect(item: ItemDef) {
    if (selectOverlay) return
    addTeamOverlay({
      title: item.label,
      subtitle: 'Select a monster',
      onSelect: (monster) => {
        runState.coins -= item.price
        applyPurchase(item, monster)
        refreshCoins()
      },
    })
  }

  function openTeamView() {
    if (selectOverlay) return
    addTeamOverlay({
      title: 'Your Team',
      subtitle: 'Tap a monster to sell',
      rowRightText: (monster) => `${String(monster.level * 10)} coins`,
      onSelect: (monster, i) => {
        if (playerTeam.length <= 1) return
        playerTeam.splice(i, 1)
        runState.coins += monster.level * 10
        refreshCoins()
      },
    })
  }

  function openItemsView() {
    if (selectOverlay) return
    addItemsOverlay()
  }

  function applyPurchase(item: ItemDef, target?: Monster) {
    const monster = target ?? playerTeam[runState.activePlayerIndex]

    switch (item.kind) {
      case 'stat_boost_attack':
        monster.baseStats.attack = Math.round(monster.baseStats.attack * 1.2)
        break
      case 'stat_boost_defense':
        monster.baseStats.defense = Math.round(monster.baseStats.defense * 1.2)
        break
      case 'stat_boost_hp':
        monster.baseStats.hp = Math.round(monster.baseStats.hp * 1.3)
        monster.maxHp = monster.baseStats.hp
        monster.currentHp = monster.maxHp
        break
      case 'stat_boost_speed':
        monster.baseStats.speed = Math.round(monster.baseStats.speed * 1.2)
        break
      case 'full_heal':
        fullHealTeam(playerTeam)
        break
      case 'learn_move': {
        const move = choose(MOVE.LEARNABLE_MOVES)
        if (!monster.moves.includes(move)) {
          monster.moves.push(move)
        }
        break
      }
      case 'buy_monster': {
        const newMonster = randomMonster(runState.wave)
        addToTeam(playerTeam, newMonster)
        break
      }
      case 'heal_potion':
      case 'revive':
        runState.inventory.push(item)
        break
    }
  }

  // bottom bar: Team, Items, Continue
  const teamButton = addButton({
    x: center().x - 130,
    y: height() - 60,
    width: 120,
    height: 56,
    color: [200, 160, 60],
    label: 'Team',
    labelSize: 20,
    isFixed: true,
  })

  teamButton.onClick(() => {
    openTeamView()
  })

  const itemsButton = addButton({
    x: center().x,
    y: height() - 60,
    width: 120,
    height: 56,
    color: [80, 80, 120],
    label: 'Items',
    labelSize: 20,
    isFixed: true,
  })

  itemsButton.onClick(() => {
    openItemsView()
  })

  const continueButton = addButton({
    x: center().x + 130,
    y: height() - 60,
    width: 120,
    height: 56,
    color: [60, 180, 80],
    label: 'Continue',
    labelSize: 20,
    isFixed: true,
  })

  continueButton.onClick(() => {
    runState.wave++
    runState.enemyTeam = []
    go(SCENE.WAVE_START)
  })
})
