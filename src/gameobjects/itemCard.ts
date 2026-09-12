import type { GameObj } from 'kaplay'

import { FONT } from '../constants'
import type { ItemDef } from '../types'
import { gateHover } from '../utils'

export const ITEM_ROW_HEIGHT = 80
const CARD_HEIGHT = 70
const PAD_X = 20
const LABEL_Y = 24
const DESCRIPTION_Y = 50

export function addItemCard({
  parent,
  x,
  y,
  width,
  item,
  count,
  onClick,
}: {
  parent: GameObj
  x: number
  y: number
  width: number
  item: ItemDef
  count: number
  onClick?: () => void
}) {
  const card = parent.add([
    rect(width, CARD_HEIGHT, { radius: 10 }),
    pos(x, y),
    color(50, 50, 80),
    area(),
  ])

  card.add([
    text(item.label, { size: 24 }),
    pos(PAD_X, LABEL_Y),
    anchor('left'),
    color(WHITE),
  ])

  card.add([
    text(item.description, { size: 22 }),
    pos(PAD_X, DESCRIPTION_Y),
    anchor('left'),
    color(200, 200, 200),
  ])

  card.add([
    text(`x${String(count)}`, { size: 28, font: FONT.SECONDARY }),
    pos(width - PAD_X, LABEL_Y),
    anchor('right'),
    color(255, 220, 80),
  ])

  if (onClick) {
    gateHover(card)

    card.onHover(() => {
      setCursor('pointer')
      card.color = rgb(70, 70, 100)
    })

    card.onHoverEnd(() => {
      setCursor('default')
      card.color = rgb(50, 50, 80)
    })

    card.onClick(onClick)
  }

  return card
}
