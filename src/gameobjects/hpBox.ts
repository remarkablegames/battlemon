import { FONT } from '../constants'

export const HP_BOX_WIDTH = 240
const HP_BOX_HEIGHT = 56
export const HP_BAR_WIDTH = 216
const HP_BAR_HEIGHT = 12

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
  const fill = box.add([
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

export type HpBox = ReturnType<typeof addHpBox>
