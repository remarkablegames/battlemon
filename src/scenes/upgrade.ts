import { SCENE, UPGRADE } from '../constants'
import {
  addCard,
  addToTeam,
  fullHealTeam,
  MAX_TEAM_SIZE,
  randomMonster,
} from '../gameobjects'
import { runState } from '../state'
import type { UpgradeDef } from '../types'

function pickRandomUpgrades(count: number): UpgradeDef[] {
  const pool = [...UPGRADE.UPGRADE_DEFS]
  const result: UpgradeDef[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = randi(pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

scene(SCENE.UPGRADE, () => {
  const { playerTeam } = runState

  add([
    text('Wave cleared! Choose an upgrade', { size: 22 }),
    pos(width() / 2, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  const upgrades = pickRandomUpgrades(3)

  upgrades.forEach((upgrade, i) => {
    const x = width() / 2
    const y = 180 + i * 200

    const card = addCard({
      x,
      y,
      width: 360,
      height: 160,
      color: [50, 50, 80],
    })

    add([
      text(upgrade.label, { size: 20 }),
      pos(x, y - 30),
      anchor('center'),
      color(WHITE),
    ])

    add([
      text(upgrade.description, { size: 20 }),
      pos(x, y + 10),
      anchor('center'),
      color(200, 200, 200),
    ])

    card.onClick(() => {
      applyUpgrade(upgrade)
      runState.wave++
      go(SCENE.WAVE_START)
    })
  })

  function applyUpgrade(upgrade: UpgradeDef): void {
    const active = playerTeam[runState.activePlayerIndex]

    switch (upgrade.kind) {
      case 'stat_boost':
        if (upgrade.label.includes('Attack')) {
          active.baseStats.attack = Math.round(active.baseStats.attack * 1.2)
        } else if (upgrade.label.includes('Defense')) {
          active.baseStats.defense = Math.round(active.baseStats.defense * 1.2)
        } else if (upgrade.label.includes('HP')) {
          active.baseStats.hp = Math.round(active.baseStats.hp * 1.3)
          active.maxHp = active.baseStats.hp
          active.currentHp = active.maxHp
        } else if (upgrade.label.includes('Speed')) {
          active.baseStats.speed = Math.round(active.baseStats.speed * 1.2)
        }
        break

      case 'heal_team':
        fullHealTeam(playerTeam)
        break

      case 'add_monster':
        if (playerTeam.length < MAX_TEAM_SIZE) {
          const newMonster = randomMonster(runState.wave)
          addToTeam(playerTeam, newMonster)
        } else {
          // team full, heal instead
          fullHealTeam(playerTeam)
        }
        break
    }
  }
})
