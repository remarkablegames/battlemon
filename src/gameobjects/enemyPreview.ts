import { TYPE } from '../constants'
import type { Monster } from '../types'

interface EnemyPreviewOptions {
  label?: string
  y?: number
}

export function addEnemyPreview(
  enemies: Monster[],
  { label = 'Enemies', y = 175 }: EnemyPreviewOptions = {},
) {
  const spacing = 175
  const rowStartX = center().x - ((enemies.length - 1) * spacing) / 2

  add([
    text(label, { size: 20 }),
    pos(center().x, y - 50),
    anchor('center'),
    color(255, 100, 100),
  ])

  enemies.forEach((enemy, i) => {
    const ex = rowStartX + i * spacing
    const ey = y

    add([
      rect(160, 60, { radius: 10 }),
      pos(ex, ey),
      anchor('center'),
      color(60, 30, 30),
      outline(2, rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    add([
      sprite(enemy.spriteId, { height: 42 }),
      pos(ex - 50, ey),
      anchor('center'),
      color(rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    add([
      text(TYPE.TYPE_LABELS[enemy.type], { size: 20 }),
      pos(ex - 20, ey - 12),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[enemy.type])),
    ])

    add([
      text(`Lv${String(enemy.level)}`, { size: 20 }),
      pos(ex - 20, ey + 10),
      anchor('left'),
      color(180, 180, 180),
    ])
  })
}
