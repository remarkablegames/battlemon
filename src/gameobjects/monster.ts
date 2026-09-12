import { MOVE, STAT, TYPE } from '../constants'
import type { Monster } from '../types'
import { markSpriteIdle, monsterHeight } from '../utils'

const COOLDOWN_BAR_WIDTH = 60
const COOLDOWN_BAR_HEIGHT = 4

const BUFF_DISPLAY: {
  key:
    | 'attackBuff'
    | 'speedBuff'
    | 'enemyAttackDebuff'
    | 'defenseBuff'
    | 'speedDebuff'
  label: string
}[] = [
  { key: 'attackBuff', label: 'ENRAGE' },
  { key: 'speedBuff', label: 'HASTE' },
  { key: 'enemyAttackDebuff', label: 'WEAKENED' },
  { key: 'defenseBuff', label: 'IRON SKIN' },
  { key: 'speedDebuff', label: 'SLOWED' },
]

export function addMonster({
  spriteId,
  x,
  y,
  monster,
  flipX = false,
}: {
  spriteId: string
  x: number
  y: number
  monster: Monster
  flipX?: boolean
}) {
  const monsterSprite = add([
    sprite(spriteId, {
      height: monsterHeight(spriteId),
      animSpeed: STAT.ANIM_SPEED,
    }),
    pos(x, y),
    anchor('center'),
    scale(1),
    color(WHITE),
    opacity(1),
  ])
  monsterSprite.flipX = flipX
  monsterSprite.play('idle')
  markSpriteIdle(monsterSprite)

  // cooldown bar track
  monsterSprite.add([
    rect(COOLDOWN_BAR_WIDTH, COOLDOWN_BAR_HEIGHT, { radius: 2 }),
    pos(0, 52),
    anchor('center'),
    color(80, 80, 80),
  ])

  // cooldown bar fill
  const fill = monsterSprite.add([
    rect(0, COOLDOWN_BAR_HEIGHT, { radius: 2 }),
    pos(-COOLDOWN_BAR_WIDTH / 2, 52),
    anchor('left'),
    color(rgb(TYPE.TYPE_COLORS[monster.type])),
  ])

  // active buff cooldown indicator
  const buffText = monsterSprite.add([
    styledText('', {
      size: 20,
      fill: rgb(255, 220, 100),
    }),
    pos(0, -64),
    anchor('center'),
  ])

  monsterSprite.onUpdate(() => {
    const ratio = 1 - monster.basicCooldown / MOVE.BASIC_ATTACK.cooldown
    fill.width = COOLDOWN_BAR_WIDTH * Math.max(0, Math.min(1, ratio))

    const activeBuff = BUFF_DISPLAY.find(({ key }) => monster[key] > 0)
    buffText.text = activeBuff
      ? `${activeBuff.label} ${monster[activeBuff.key].toFixed(1)}s`
      : ''
  })

  return monsterSprite
}
