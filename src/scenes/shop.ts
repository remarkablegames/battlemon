import { ITEM, SCENE, STAT } from '../constants'
import {
  addButton,
  addCard,
  addItemCard,
  addMiniHpBar,
  addSoundToggle,
  ITEM_ROW_HEIGHT,
} from '../gameobjects'
import { runState } from '../state'
import type { ItemDef, Monster } from '../types'
import {
  gainXp,
  gateHover,
  initHoverGate,
  monsterHeightMultiplier,
  playMusic,
  sfx,
} from '../utils'

interface TeamOverlayOptions {
  title: string
  subtitle?: string
  onSelect?: (monster: Monster) => void
  rowRightText?: (monster: Monster) => string
}

scene(SCENE.SHOP, () => {
  initHoverGate()
  const { playerTeam, coins } = runState
  playMusic('rest')
  addSoundToggle()

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

  ITEM.ITEM_DEFS.forEach((item, index) => {
    const y = 160 + index * 80

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
        sfx('money')
        applyPurchase(item)
        refreshCoins()
        showPurchaseFeedback(item, y)
      }
    })
  })

  const NEEDS_SELECTION = new Set<ItemDef['kind']>(['level_up'])

  let selectOverlay: ReturnType<typeof addTeamOverlay> | null = null

  function addTeamOverlay(options: TeamOverlayOptions) {
    const overlay = add([pos(), fixed(), z(100)])
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

    overlay.add([rect(width(), height()), pos(), color(BLACK), opacity(0.7)])

    const panelWidth = 440
    const panelHeight = 170 + playerTeam.length * 100
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

    const listStartY = panelY + 95
    const rowHeight = 100

    playerTeam.forEach((monster, index) => {
      const rowY = listStartY + index * rowHeight

      const row = overlay.add([
        rect(panelWidth - 40, 90, { radius: 10 }),
        pos(panelX + 20, rowY),
        color(50, 50, 80),
        area(),
      ])

      const monsterSprite = row.add([
        sprite(monster.spriteId, {
          height:
            STAT.MONSTER_ICON_HEIGHT *
            monsterHeightMultiplier(monster.spriteId),
          animSpeed: STAT.ANIM_SPEED,
        }),
        pos(40, 45),
        anchor('center'),
      ])
      monsterSprite.play('idle')

      // monster name
      row.add([
        text(`${monster.name} Lv${String(monster.level)}`, { size: 20 }),
        pos(90, 22),
        anchor('left'),
        color(WHITE),
      ])

      // monster stats
      row.add([
        text(
          `ATK ${String(monster.baseStats.attack)} • DEF ${String(monster.baseStats.defense)} • SPD ${String(monster.baseStats.speed)}`,
          {
            size: 20,
          },
        ),
        pos(90, 46),
        anchor('left'),
        color(180, 180, 180),
      ])

      // monster health
      addMiniHpBar(90, 62, 200, 8, monster, row)

      // monster sell price
      if (options.rowRightText) {
        row.add([
          text(options.rowRightText(monster), { size: 20 }),
          pos(panelWidth - 60, 22),
          anchor('right'),
          color(255, 220, 80),
        ])
      }

      if (options.onSelect) {
        const onSelect = options.onSelect

        gateHover(row)

        row.onHover(() => {
          setCursor('pointer')
          row.color = rgb(70, 70, 100)
        })

        row.onHoverEnd(() => {
          setCursor('default')
          row.color = rgb(50, 50, 80)
        })

        row.onClick(() => {
          onSelect(monster)
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

    gateHover(cancelButton)

    cancelButton.onHover(() => {
      setCursor('pointer')
      cancelButton.color = rgb(100, 100, 100)
    })

    cancelButton.onHoverEnd(() => {
      setCursor('default')
      cancelButton.color = rgb(80, 80, 80)
    })

    cancelButton.onClick(() => {
      sfx('cancel')
      close()
    })

    return overlay
  }

  function addItemsOverlay() {
    const overlay = add([pos(), fixed(), z(100)])
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

    overlay.add([rect(width(), height()), pos(), color(BLACK), opacity(0.7)])

    const items = runState.inventory

    // Group items by id
    const groupedItems = new Map<string, { item: ItemDef; count: number }>()
    for (const item of items) {
      const existing = groupedItems.get(item.id)
      if (existing) {
        existing.count++
      } else {
        groupedItems.set(item.id, { item, count: 1 })
      }
    }

    const groupedArray = Array.from(groupedItems.values())
    const panelWidth = 440
    const panelHeight = 120 + Math.max(1, groupedArray.length) * ITEM_ROW_HEIGHT
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

    if (groupedArray.length === 0) {
      overlay.add([
        text('No items', { size: 20 }),
        pos(width() / 2, panelY + 80),
        anchor('center'),
        color(200, 200, 200),
      ])
    } else {
      const listStartY = panelY + 70

      groupedArray.forEach(({ item, count }, index) => {
        const rowY = listStartY + index * ITEM_ROW_HEIGHT - 10

        addItemCard({
          parent: overlay,
          x: panelX + 20,
          y: rowY,
          width: panelWidth - 40,
          item,
          count,
        })
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

    gateHover(cancelButton)

    cancelButton.onHover(() => {
      setCursor('pointer')
      cancelButton.color = rgb(100, 100, 100)
    })

    cancelButton.onHoverEnd(() => {
      setCursor('default')
      cancelButton.color = rgb(80, 80, 80)
    })

    cancelButton.onClick(() => {
      sfx('cancel')
      close()
    })

    return overlay
  }

  function openMonsterSelect(item: ItemDef) {
    // add delay to prevent monster from being clicked immediately
    wait(0, () => {
      addTeamOverlay({
        title: item.label,
        subtitle: 'Select a monster',
        onSelect: (monster) => {
          runState.coins -= item.price
          sfx('money')
          applyPurchase(item, monster)
          refreshCoins()
          showPurchaseFeedback(item, center().y)
        },
      })
    })
  }

  function openTeamView() {
    if (selectOverlay) return
    addTeamOverlay({
      title: 'Your Team',
      subtitle: 'Tap a monster to sell',
      rowRightText: (monster) => `${String(monster.level * 10)} coins`,
      onSelect: (monster) => {
        if (playerTeam.length <= 1) {
          sfx('cancel')
          return
        }
        const index = playerTeam.findIndex(({ id }) => id === monster.id)
        if (index === -1) return
        playerTeam.splice(index, 1)
        runState.coins += monster.level * 10
        sfx('money')
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
      case 'full_heal':
      case 'heal_potion':
      case 'revive':
      case 'temp_boost_enrage':
      case 'temp_boost_iron_skin':
      case 'temp_boost_haste':
      case 'temp_debuff_enemy_attack':
        runState.inventory.push(item)
        break
      case 'level_up':
        gainXp(monster, monster.xpToNextLevel)
        sfx('levelUp')
        break
    }
  }

  function showPurchaseFeedback(item: ItemDef, cardY: number) {
    const feedbackText = add([
      text(`Purchased ${item.label}!`, { size: 20 }),
      pos(center().x, cardY),
      anchor('center'),
      color(100, 255, 100),
      opacity(1),
      z(200),
    ])

    tween(
      feedbackText.pos.y,
      feedbackText.pos.y - 30,
      1.0,
      (y) => {
        feedbackText.pos.y = y
      },
      easings.easeOutQuad,
    )

    tween(
      1,
      0,
      1.0,
      (opacity) => {
        feedbackText.opacity = opacity
      },
      easings.easeOutQuad,
    ).onEnd(() => {
      destroy(feedbackText)
    })
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
    sound: 'continue',
  })

  continueButton.onClick(() => {
    runState.wave++
    runState.enemyTeam = []
    go(SCENE.WAVE_START)
  })
})
