import { FONT } from '../constants'
import type { Monster } from '../types'
import { addBench, type Bench } from './bench'
import { addHpBox, HP_BAR_WIDTH, HP_BOX_WIDTH, type HpBox } from './hpBox'

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
      size: 42,
      font: FONT.SECONDARY,
      fill: WHITE,
      outline: { color: BLACK, width: 2 },
    }),
    pos(center().x, 20),
    anchor('top'),
    fixed(),
  ])
}

type NameText = ReturnType<typeof addNameText>
type WaveText = ReturnType<typeof addWaveText>

export interface HudElements {
  playerHp: HpBox
  playerNameText: NameText
  enemyHp: HpBox
  enemyNameText: NameText
  waveText: WaveText
  bench: Bench
  destroy: () => void
}

export function addHud(
  battleTeam: Monster[],
  activeIdx: number,
  onSwap: (battleTeamIdx: number) => void,
): HudElements {
  // player HP (above player sprite)
  const playerHp = addHpBox(50, 460)
  const playerNameText = addNameText(58, 435)

  // enemy HP (above enemy sprite)
  const enemyHp = addHpBox(width() - 50 - HP_BOX_WIDTH, 125)
  const enemyNameText = addNameText(width() - 50 - HP_BOX_WIDTH + 8, 100)

  // wave counter (top-center)
  const waveText = addWaveText()

  // bench slots
  const bench = addBench(battleTeam, onSwap)
  bench.refresh(activeIdx)

  return {
    playerHp,
    playerNameText,
    enemyHp,
    enemyNameText,
    waveText,
    bench,
    destroy: () => {
      destroy(playerHp.box)
      destroy(playerNameText)
      destroy(enemyHp.box)
      destroy(enemyNameText)
      destroy(waveText)
      bench.destroy()
    },
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
