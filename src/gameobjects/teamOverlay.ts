import type { GameObj } from 'kaplay'

import { STAT, TYPE } from '../constants'
import type { Monster } from '../types'
import { gateHover, monsterHeightMultiplier, sfx } from '../utils'
import { addMiniHpBar } from './healthbar'

export interface TeamOverlayOptions {
  title: string
  subtitle?: string
  onSelect?: (monster: Monster) => void
  rowRightText?: (monster: Monster) => string
  showHpBar?: boolean
}

export interface TeamOverlay {
  root: GameObj
  close: () => void
}

export function addTeamOverlay(
  team: Monster[],
  options: TeamOverlayOptions,
): TeamOverlay {
  const { title, subtitle, onSelect, rowRightText, showHpBar = true } = options
  const overlay = add([pos(), fixed(), z(100)])

  function close() {
    destroy(overlay)
  }

  overlay.add([rect(width(), height()), pos(), color(BLACK), opacity(0.7)])

  const panelWidth = 440
  const panelHeight = 170 + team.length * 100
  const panelX = (width() - panelWidth) / 2
  const panelY = (height() - panelHeight) / 2

  overlay.add([
    rect(panelWidth, panelHeight, { radius: 16 }),
    pos(panelX, panelY),
    color(30, 30, 50),
  ])

  // title
  overlay.add([
    text(title, { size: 26 }),
    pos(width() / 2, panelY + 30),
    anchor('center'),
    color(255, 220, 100),
  ])

  if (subtitle) {
    overlay.add([
      text(subtitle, { size: 22 }),
      pos(width() / 2, panelY + 60),
      anchor('center'),
      color(200, 200, 200),
    ])
  }

  const listStartY = panelY + 95
  const rowHeight = 100

  team.forEach((monster, index) => {
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
          STAT.MONSTER_ICON_HEIGHT * monsterHeightMultiplier(monster.spriteId),
        animSpeed: STAT.ANIM_SPEED,
      }),
      pos(40, 45),
      anchor('center'),
    ])
    monsterSprite.play('idle')

    // monster name
    row.add([
      text(`${monster.name} Lv${String(monster.level)}`, { size: 22 }),
      pos(90, 22),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // monster stats
    row.add([
      text(
        `ATK ${String(monster.baseStats.attack)} | DEF ${String(monster.baseStats.defense)} | SPD ${String(monster.baseStats.speed)}`,
        { size: 20 },
      ),
      pos(90, 46),
      anchor('left'),
      color(180, 180, 180),
    ])

    // monster health
    if (showHpBar) {
      addMiniHpBar({
        x: 90,
        y: 62,
        width: 200,
        height: 10,
        monster,
        showHpText: true,
        parent: row,
      })
    }

    if (rowRightText) {
      row.add([
        text(rowRightText(monster), { size: 20 }),
        pos(panelWidth - 60, 22),
        anchor('right'),
        color(255, 220, 80),
      ])
    }

    if (onSelect) {
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

  return { root: overlay, close }
}
