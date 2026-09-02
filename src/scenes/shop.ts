import { MOVE, SCENE } from '../constants'
import {
  addButton,
  addCard,
  addToTeam,
  fullHealTeam,
  randomMonster,
} from '../gameobjects'
import { runState } from '../state'
import type { ItemDef } from '../types'

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
      if (runState.coins < item.price) return
      runState.coins -= item.price
      applyPurchase(item)
      refreshCoins()
    })
  })

  function applyPurchase(item: ItemDef) {
    const active = playerTeam[runState.activePlayerIndex]

    switch (item.kind) {
      case 'stat_boost_attack':
        active.baseStats.attack = Math.round(active.baseStats.attack * 1.2)
        break
      case 'stat_boost_defense':
        active.baseStats.defense = Math.round(active.baseStats.defense * 1.2)
        break
      case 'stat_boost_hp':
        active.baseStats.hp = Math.round(active.baseStats.hp * 1.3)
        active.maxHp = active.baseStats.hp
        active.currentHp = active.maxHp
        break
      case 'stat_boost_speed':
        active.baseStats.speed = Math.round(active.baseStats.speed * 1.2)
        break
      case 'full_heal':
        fullHealTeam(playerTeam)
        break
      case 'learn_move': {
        const move = choose(MOVE.LEARNABLE_MOVES)
        if (!active.moves.includes(move)) {
          active.moves.push(move)
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

  // continue button
  const continueButton = addButton({
    x: center().x,
    y: height() - 60,
    width: 200,
    height: 56,
    color: [60, 180, 80],
    label: 'Continue',
    labelSize: 20,
    isFixed: true,
  })

  continueButton.onClick(() => {
    runState.wave++
    go(SCENE.WAVE_START)
  })
})
