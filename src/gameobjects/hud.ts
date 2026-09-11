import { FONT } from '../constants'
import type { Monster } from '../types'
import { addBench, type Bench } from './bench'
import { addHpBox, HP_BOX_WIDTH, type HpBox, updateHpBox } from './hpBox'

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
    updateHpBox(hud.playerHp, player.currentHp, player.maxHp)
    hud.playerNameText.text = `${player.name} Lv${String(player.level)}`
  }

  if (enemy) {
    updateHpBox(hud.enemyHp, enemy.currentHp, enemy.maxHp)
    hud.enemyNameText.text = `${enemy.name} Lv${String(enemy.level)}`
  }

  hud.waveText.text = `Wave ${String(wave)}`
}
