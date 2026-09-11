import { STAT } from '../constants'
import type { Monster } from '../types'
import { gateHover, monsterHeightMultiplier } from '../utils'
import { setHpFill } from './healthbar'

const BENCH_SLOT_SIZE = 72
const BENCH_SLOT_GAP = 12
const BENCH_HP_BAR_WIDTH = 56
const BENCH_HP_BAR_HEIGHT = 6

export interface Bench {
  refresh: (activeIdx: number) => void
  setCooldown: (ratio: number) => void
  destroy: () => void
}

export function addBench(
  battleTeam: Monster[],
  onSwap: (battleTeamIdx: number) => void,
): Bench {
  const root = add([pos(), fixed()])
  let cooldownRatio = 0

  function refresh(activeIdx: number): void {
    root.removeAll()

    const benchedIndices = battleTeam
      .map((_monster, index) => index)
      .filter((index) => index !== activeIdx)

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
        sprite(monster.spriteId, {
          height:
            STAT.MONSTER_ICON_HEIGHT *
            monsterHeightMultiplier(monster.spriteId),
          animSpeed: STAT.ANIM_SPEED,
        }),
        pos(width() - 80, slotY - 8),
        anchor('center'),
        opacity(monster.isAlive ? 1 : 0.3),
      ])
      monsterSprite.play('idle')

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
        setHpFill(hpFill, monster.currentHp, monster.maxHp, BENCH_HP_BAR_WIDTH)
      })

      fill.onUpdate(() => {
        const dimmed = !monster.isAlive || cooldownRatio > 0
        fill.opacity = dimmed ? 0.4 : 1
        monsterSprite.opacity = !monster.isAlive ? 0.3 : 1
      })

      if (monster.isAlive) {
        gateHover(fill)

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
