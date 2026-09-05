import { STAT, TYPE } from '../constants'
import { runState } from '../state'
import type { Monster } from '../types'

const HP_BOX_WIDTH = 240
const HP_BOX_HEIGHT = 56
const HP_BAR_WIDTH = 216
const HP_BAR_HEIGHT = 12
const BENCH_SLOT_SIZE = 72
const BENCH_SLOT_GAP = 12
const BENCH_HP_BAR_WIDTH = 56
const BENCH_HP_BAR_HEIGHT = 6

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

export interface Bench {
  refresh: (activeIdx: number) => void
  setCooldown: (ratio: number) => void
  destroy: () => void
}

export function createBench(
  battleTeam: Monster[],
  onSwap: (battleTeamIdx: number) => void,
): Bench {
  const root = add([pos(), fixed()])
  let cooldownRatio = 0

  function refresh(activeIdx: number): void {
    root.removeAll()

    const benchedIndices = battleTeam
      .map((_monster, i) => i)
      .filter((i) => i !== activeIdx)

    if (benchedIndices.length === 0) return

    const slotsHeight =
      benchedIndices.length * BENCH_SLOT_SIZE +
      Math.max(0, benchedIndices.length - 1) * BENCH_SLOT_GAP
    const slotsTop = height() - 90 - 32 - slotsHeight

    root.add([
      styledText('Bench', {
        size: 20,
        fill: WHITE,
        outline: { color: BLACK, width: 2 },
      }),
      pos(width() - 80, slotsTop - 30),
      anchor('top'),
    ])

    benchedIndices.forEach((teamIdx, slotIdx) => {
      const monster = battleTeam[teamIdx]
      const slotY = slotsTop + slotIdx * (BENCH_SLOT_SIZE + BENCH_SLOT_GAP)

      // border
      root.add([
        rect(BENCH_SLOT_SIZE + 8, BENCH_SLOT_SIZE + 8, { radius: 12 }),
        pos(width() - 80, slotY),
        anchor('center'),
        color(BLACK),
      ])

      // fill (tap target)
      const fill = root.add([
        rect(BENCH_SLOT_SIZE, BENCH_SLOT_SIZE, { radius: 10 }),
        pos(width() - 80, slotY),
        anchor('center'),
        color(40, 40, 60),
        opacity(1),
        area(),
      ])

      const monsterSprite = root.add([
        sprite(monster.spriteId, { height: STAT.MONSTER_ICON_HEIGHT }),
        pos(width() - 80, slotY - 8),
        anchor('center'),
        color(rgb(TYPE.TYPE_COLORS[monster.type])),
        opacity(monster.isAlive ? 1 : 0.3),
      ])

      // cooldown clock overlay (pie sweep, drains clockwise)
      const clockOverlay = root.add([
        pos(width() - 80, slotY - 8),
        anchor('center'),
        z(10),
      ])

      clockOverlay.onDraw(() => {
        if (!monster.isAlive || cooldownRatio <= 0) return
        const radius = BENCH_SLOT_SIZE / 2 - 6
        const sweep = cooldownRatio * Math.PI * 2
        const segments = 32
        const pts = [vec2()]
        for (let i = 0; i <= segments; i++) {
          const angle = -Math.PI / 2 + (i / segments) * sweep
          pts.push(vec2(Math.cos(angle) * radius, Math.sin(angle) * radius))
        }
        drawPolygon({
          pts,
          color: rgb(255, 220, 80),
          opacity: 0.6,
        })
      })

      // hp bar
      root.add([
        rect(BENCH_HP_BAR_WIDTH, BENCH_HP_BAR_HEIGHT, { radius: 3 }),
        pos(width() - 80, slotY + 26),
        anchor('center'),
        color(120, 120, 120),
      ])

      const hpFill = root.add([
        rect(BENCH_HP_BAR_WIDTH, BENCH_HP_BAR_HEIGHT, { radius: 3 }),
        pos(width() - 80 - BENCH_HP_BAR_WIDTH / 2, slotY + 26),
        anchor('left'),
        color(0, 200, 0),
      ])

      hpFill.onUpdate(() => {
        const ratio = Math.max(0, monster.currentHp / monster.maxHp)
        hpFill.width = BENCH_HP_BAR_WIDTH * ratio
        hpFill.color =
          ratio <= 0.25
            ? rgb(255, 50, 50)
            : ratio <= 0.5
              ? rgb(255, 200, 0)
              : rgb(0, 200, 0)
      })

      fill.onUpdate(() => {
        const dimmed = !monster.isAlive || cooldownRatio > 0
        fill.opacity = dimmed ? 0.4 : 1
        monsterSprite.opacity = !monster.isAlive ? 0.3 : 1
      })

      if (monster.isAlive) {
        fill.onHover(() => {
          setCursor('pointer')
        })
        fill.onHoverEnd(() => {
          setCursor('default')
        })
        fill.onClick(() => {
          onSwap(teamIdx)
        })
      }
    })
  }

  return {
    refresh,
    setCooldown: (ratio: number) => {
      cooldownRatio = ratio
    },
    destroy: () => {
      destroy(root)
    },
  }
}

function addHpBox(x: number, y: number) {
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
    color(BLACK),
  ])

  return { box, fill, hpText }
}

function addCoinText() {
  return add([
    styledText('0', {
      size: 20,
      fill: rgb(255, 220, 80),
      outline: { color: BLACK, width: 2 },
    }),
    pos(width() - 15, 20),
    anchor('topright'),
    fixed(),
  ])
}

type CoinText = ReturnType<typeof addCoinText>

type HpBox = ReturnType<typeof addHpBox>
type NameText = ReturnType<typeof addNameText>
type WaveText = ReturnType<typeof addWaveText>

export interface HudElements {
  playerHp: HpBox
  playerNameText: NameText
  enemyHp: HpBox
  enemyNameText: NameText
  waveText: WaveText
  bench: Bench
  coinText: CoinText
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
  const bench = createBench(battleTeam, onSwap)
  bench.refresh(activeIdx)

  // coin counter (top-right)
  const coinText = addCoinText()

  return {
    playerHp,
    playerNameText,
    enemyHp,
    enemyNameText,
    waveText,
    bench,
    coinText,
    destroy: () => {
      destroy(playerHp.box)
      destroy(playerNameText)
      destroy(enemyHp.box)
      destroy(enemyNameText)
      destroy(waveText)
      bench.destroy()
      destroy(coinText)
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
  hud.coinText.text = `${String(runState.coins)} coins`
}
