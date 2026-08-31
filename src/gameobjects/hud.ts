import { TYPE } from '../constants'
import type { Monster } from '../types'

function addHpBar(x: number, y: number) {
  return add([
    rect(HP_BAR_WIDTH, HP_BAR_HEIGHT),
    pos(x, y),
    color(0, 200, 0),
    fixed(),
  ])
}

function addHpText(x: number, y: number) {
  return add([text('100/100', { size: 14 }), pos(x, y), color(WHITE), fixed()])
}

function addNameText(x: number, y: number) {
  return add([text('Player', { size: 16 }), pos(x, y), color(WHITE), fixed()])
}

function addWaveText() {
  return add([
    text('Wave 1', { size: 20 }),
    pos(center().x, 20),
    anchor('top'),
    fixed(),
  ])
}

function addBenchText() {
  return add([
    text('Bench', { size: 14 }),
    pos(width() - 60, height() - 200),
    anchor('top'),
    fixed(),
  ])
}

type HpBar = ReturnType<typeof addHpBar>
type HpText = ReturnType<typeof addHpText>
type NameText = ReturnType<typeof addNameText>
type WaveText = ReturnType<typeof addWaveText>
type BenchText = ReturnType<typeof addBenchText>

export interface HudElements {
  playerHpBar: HpBar
  playerHpText: HpText
  playerNameText: NameText
  enemyHpBar: HpBar
  enemyHpText: HpText
  enemyNameText: NameText
  waveText: WaveText
  benchText: BenchText
}

const HP_BAR_WIDTH = 180
const HP_BAR_HEIGHT = 14

export function createHud(): HudElements {
  // player HP bar (bottom-left area)
  const playerHpBar = addHpBar(50, height() - 280)
  const playerHpText = addHpText(50, height() - 260)
  const playerNameText = addNameText(50, height() - 300)

  // enemy HP bar (top-right area)
  const enemyHpBar = addHpBar(width() - 50 - HP_BAR_WIDTH, 180)
  const enemyHpText = addHpText(width() - 50 - HP_BAR_WIDTH, 200)
  const enemyNameText = addNameText(width() - 50 - HP_BAR_WIDTH, 160)

  // wave counter (top-center)
  const waveText = addWaveText()

  // bench label
  const benchText = addBenchText()

  return {
    playerHpBar,
    playerHpText,
    playerNameText,
    enemyHpBar,
    enemyHpText,
    enemyNameText,
    waveText,
    benchText,
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
    hud.playerHpBar.width = HP_BAR_WIDTH * hpRatio
    hud.playerHpText.text = `${String(Math.ceil(player.currentHp))}/${String(player.maxHp)}`
    hud.playerNameText.text = `${player.name} Lv${String(player.level)} ${TYPE.TYPE_LABELS[player.type]}`
    hud.playerNameText.color = rgb(TYPE.TYPE_COLORS[player.type])
  }

  if (enemy) {
    const hpRatio = enemy.currentHp / enemy.maxHp
    hud.enemyHpBar.width = HP_BAR_WIDTH * hpRatio
    hud.enemyHpText.text = `${String(Math.ceil(enemy.currentHp))}/${String(enemy.maxHp)}`
    hud.enemyNameText.text = `${enemy.name} Lv${String(enemy.level)} ${TYPE.TYPE_LABELS[enemy.type]}`
    hud.enemyNameText.color = rgb(TYPE.TYPE_COLORS[enemy.type])
  }

  hud.waveText.text = `Wave ${String(wave)}`
}

export function destroyHud(hud: HudElements): void {
  destroy(hud.playerHpBar)
  destroy(hud.playerHpText)
  destroy(hud.playerNameText)
  destroy(hud.enemyHpBar)
  destroy(hud.enemyHpText)
  destroy(hud.enemyNameText)
  destroy(hud.waveText)
  destroy(hud.benchText)
}
