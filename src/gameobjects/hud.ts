import type { Monster } from '../types'

const HP_BOX_WIDTH = 240
const HP_BOX_HEIGHT = 56
const HP_BAR_WIDTH = 216
const HP_BAR_HEIGHT = 12
const BENCH_SLOT_SIZE = 72
const BENCH_SLOT_GAP = 12
const BENCH_SLOTS = 2

function addNameText(x: number, y: number) {
  return add([
    styledText('Player', {
      size: 20,
      fill: WHITE,
      outline: { color: BLACK, width: 2 },
    }),
    pos(x, y),
    fixed(),
  ])
}

function addWaveText() {
  return add([
    styledText('Wave 1', {
      size: 20,
      fill: WHITE,
      outline: { color: BLACK, width: 2 },
    }),
    pos(center().x, 20),
    anchor('top'),
    fixed(),
  ])
}

function addBench() {
  const bench = add([pos(0, 0), fixed()])

  // label above the slots
  const slotsHeight =
    BENCH_SLOTS * BENCH_SLOT_SIZE + (BENCH_SLOTS - 1) * BENCH_SLOT_GAP
  const slotsTop = height() - 90 - 32 - slotsHeight

  bench.add([
    styledText('Bench', {
      size: 20,
      fill: WHITE,
      outline: { color: BLACK, width: 2 },
    }),
    pos(width() - 80, slotsTop - 30),
    anchor('top'),
  ])

  // vertical stack of rounded slots
  for (let i = 0; i < BENCH_SLOTS; i++) {
    const slotY = slotsTop + i * (BENCH_SLOT_SIZE + BENCH_SLOT_GAP)

    // border
    bench.add([
      rect(BENCH_SLOT_SIZE + 8, BENCH_SLOT_SIZE + 8, { radius: 12 }),
      pos(width() - 80, slotY),
      anchor('center'),
      color(0, 0, 0),
    ])

    // fill
    bench.add([
      rect(BENCH_SLOT_SIZE, BENCH_SLOT_SIZE, { radius: 10 }),
      pos(width() - 80, slotY),
      anchor('center'),
      color(40, 40, 60),
    ])
  }

  return bench
}

function addHpBox(x: number, y: number) {
  const box = add([pos(x, y), fixed()])

  // border and background
  box.add([
    rect(HP_BOX_WIDTH, HP_BOX_HEIGHT, { radius: 14 }),
    pos(0, 0),
    color(0, 0, 0),
  ])
  box.add([
    rect(HP_BOX_WIDTH - 8, HP_BOX_HEIGHT - 8, { radius: 12 }),
    pos(4, 4),
    color(255, 255, 255),
  ])

  // HP label
  box.add([text('HP', { size: 20 }), pos(12, 6), color(255, 50, 50)])

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
    text('100/100', { size: 20 }),
    pos(HP_BOX_WIDTH - 15, 16),
    anchor('right'),
    color(0, 0, 0),
  ])

  return { box, fill, hpText }
}

type HpBox = ReturnType<typeof addHpBox>
type NameText = ReturnType<typeof addNameText>
type WaveText = ReturnType<typeof addWaveText>
type Bench = ReturnType<typeof addBench>

export interface HudElements {
  playerHp: HpBox
  playerNameText: NameText
  enemyHp: HpBox
  enemyNameText: NameText
  waveText: WaveText
  bench: Bench
}

export function createHud(): HudElements {
  // player HP (above player sprite)
  const playerHp = addHpBox(50, 460)
  const playerNameText = addNameText(58, 435)

  // enemy HP (above enemy sprite)
  const enemyHp = addHpBox(width() - 50 - HP_BOX_WIDTH, 125)
  const enemyNameText = addNameText(width() - 50 - HP_BOX_WIDTH + 8, 100)

  // wave counter (top-center)
  const waveText = addWaveText()

  // bench slots
  const bench = addBench()

  return {
    playerHp,
    playerNameText,
    enemyHp,
    enemyNameText,
    waveText,
    bench,
  }
}

export function updateHud(
  hud: HudElements,
  player: Monster | null,
  enemy: Monster | null,
  wave: number,
): void {
  if (player) {
    const hpRatio = player.currentHp / player.maxHp
    hud.playerHp.fill.width = Math.max(0, HP_BAR_WIDTH * hpRatio)
    hud.playerHp.hpText.text = `${String(Math.ceil(player.currentHp))} / ${String(player.maxHp)}`
    hud.playerNameText.text = `${player.name} Lv${String(player.level)}`

    if (hpRatio <= 0.25) {
      hud.playerHp.fill.color = rgb(255, 50, 50)
    } else if (hpRatio <= 0.5) {
      hud.playerHp.fill.color = rgb(255, 200, 0)
    } else {
      hud.playerHp.fill.color = rgb(0, 200, 0)
    }
  }

  if (enemy) {
    const hpRatio = enemy.currentHp / enemy.maxHp
    hud.enemyHp.fill.width = Math.max(0, HP_BAR_WIDTH * hpRatio)
    hud.enemyHp.hpText.text = `${String(Math.ceil(enemy.currentHp))} / ${String(enemy.maxHp)}`
    hud.enemyNameText.text = `${enemy.name} Lv${String(enemy.level)}`

    if (hpRatio <= 0.25) {
      hud.enemyHp.fill.color = rgb(255, 50, 50)
    } else if (hpRatio <= 0.5) {
      hud.enemyHp.fill.color = rgb(255, 200, 0)
    } else {
      hud.enemyHp.fill.color = rgb(0, 200, 0)
    }
  }

  hud.waveText.text = `Wave ${String(wave)}`
}

export function destroyHud(hud: HudElements): void {
  destroy(hud.playerHp.box)
  destroy(hud.playerNameText)
  destroy(hud.enemyHp.box)
  destroy(hud.enemyNameText)
  destroy(hud.waveText)
  destroy(hud.bench)
}
