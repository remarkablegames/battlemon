import type { Color, GameObj, TextComp } from 'kaplay'

import { FONT } from '../constants'

export interface MiniBarOptions {
  x: number
  y: number
  width: number
  height: number
  parent?: GameObj
  trackColor: Color
  fillColor: Color
  getRatio: () => number
  getFillColor?: (ratio: number) => Color
  getLabel?: () => string
}

export function addMiniBar({
  x,
  y,
  width,
  height,
  parent,
  trackColor,
  fillColor,
  getRatio,
  getFillColor,
  getLabel,
}: MiniBarOptions) {
  const root = parent ?? add([pos()])

  root.add([
    rect(width, height, { radius: height / 4 }),
    pos(x, y),
    color(trackColor),
  ])

  const fill = root.add([
    rect(0, height, { radius: height / 4 }),
    pos(x, y),
    color(fillColor),
  ])

  let label: GameObj<TextComp> | null = null
  const updateLabel = getLabel
  if (updateLabel) {
    label = root.add([
      text(updateLabel(), { size: 22, font: FONT.SECONDARY }),
      pos(x + width + 8, y - 6),
      color(WHITE),
    ])
  }

  fill.onUpdate(() => {
    const ratio = Math.min(1, Math.max(0, getRatio()))
    fill.width = width * ratio
    if (getFillColor) fill.color = getFillColor(ratio)
    if (label && updateLabel) label.text = updateLabel()
  })
}
