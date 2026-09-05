import { TYPE } from '../constants'
import type { Monster } from '../types'

interface EnemyPreviewOptions {
  label?: string
  y?: number
}

const SPACING = 175

export function addEnemyPreview(
  enemies: Monster[],
  { label = 'Enemies', y = 175 }: EnemyPreviewOptions = {},
) {
  const rowStartX = -((enemies.length - 1) * SPACING) / 2

  const root = add([pos(center().x, y)])

  root.add([
    text(label, { size: 20 }),
    pos(0, -50),
    anchor('center'),
    color(255, 100, 100),
  ])

  enemies.forEach((enemy, index) => {
    const enemyX = rowStartX + index * SPACING

    const slot = root.add([pos(enemyX, 0)])

    slot.add([
      rect(160, 60, { radius: 10 }),
      anchor('center'),
      color(60, 30, 30),
      outline(2, rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    slot.add([
      sprite(enemy.spriteId, { height: 42 }),
      pos(-50, 0),
      anchor('center'),
      color(rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    slot.add([
      text(TYPE.TYPE_LABELS[enemy.type], { size: 20 }),
      pos(-20, -12),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    slot.add([
      text(`Lv${String(enemy.level)}`, { size: 20 }),
      pos(-20, 10),
      anchor('left'),
      color(180, 180, 180),
    ])
  })
}
