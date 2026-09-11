import type { ColorComp, GameObj, RectComp } from 'kaplay'

import { FONT } from '../constants'
import type { Monster } from '../types'

export const HP_BOX_WIDTH = 240
const HP_BOX_HEIGHT = 56
export const HP_BAR_WIDTH = 216
const HP_BAR_HEIGHT = 12

type HpFill = GameObj<RectComp & ColorComp>

export function setHpFill(
  fill: HpFill,
  currentHp: number,
  maxHp: number,
  fullWidth: number,
) {
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, currentHp / maxHp)) : 0
  fill.width = fullWidth * ratio
  fill.color =
    ratio <= 0.25
      ? rgb(255, 50, 50)
      : ratio <= 0.5
        ? rgb(255, 200, 0)
        : rgb(0, 200, 0)
}

export function addHpBox(x: number, y: number) {
  const box = add([pos(x, y), fixed()])

  // border and background
  box.add([
    rect(HP_BOX_WIDTH, HP_BOX_HEIGHT, { radius: 14 }),
    pos(),
    color(BLACK),
  ])

  box.add([
    rect(HP_BOX_WIDTH - 8, HP_BOX_HEIGHT - 8, { radius: 12 }),
    pos(4),
    color(WHITE),
  ])

  // HP label
  box.add([
    text('HP', { size: 20, font: FONT.SECONDARY }),
    pos(12, 6),
    color(255, 50, 50),
  ])

  // bar track
  box.add([
    rect(HP_BAR_WIDTH, HP_BAR_HEIGHT, { radius: 4 }),
    pos(12, 32),
    color(120, 120, 120),
  ])

  // bar fill
  const fill: HpFill = box.add([
    rect(HP_BAR_WIDTH, HP_BAR_HEIGHT, { radius: 4 }),
    pos(12, 32),
    color(0, 200, 0),
  ])

  // current/max hp
  const hpText = box.add([
    text('100/100', { size: 20, font: FONT.SECONDARY }),
    pos(HP_BOX_WIDTH - 15, 16),
    anchor('right'),
    color(BLACK),
  ])

  return { box, fill, hpText }
}

export function updateHpBox(hpBox: HpBox, currentHp: number, maxHp: number) {
  setHpFill(hpBox.fill, currentHp, maxHp, HP_BAR_WIDTH)
  hpBox.hpText.text = `${String(Math.ceil(currentHp))} / ${String(maxHp)}`
}

export function addMiniHpBar(
  x: number,
  y: number,
  width: number,
  height: number,
  monster: Monster,
  parent?: GameObj,
) {
  const host = parent ?? add([pos()])

  host.add([
    rect(width, height, { radius: height / 4 }),
    pos(x, y),
    color(120, 120, 120),
  ])

  const fill = host.add([
    rect(width, height, { radius: height / 4 }),
    pos(x, y),
    color(0, 200, 0),
  ])

  fill.onUpdate(() => {
    setHpFill(fill, monster.currentHp, monster.maxHp, width)
  })
}

export type HpBox = ReturnType<typeof addHpBox>
