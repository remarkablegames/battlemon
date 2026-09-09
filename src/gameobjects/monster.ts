import { MOVE, STAT, TYPE } from '../constants'
import type { Monster } from '../types'
import { markSpriteIdle } from '../utils'

const COOLDOWN_BAR_WIDTH = 60
const COOLDOWN_BAR_HEIGHT = 4

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
      height: STAT.MONSTER_HEIGHT,
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
    pos(0, 40),
    anchor('center'),
    color(80, 80, 80),
  ])

  // cooldown bar fill
  const fill = monsterSprite.add([
    rect(0, COOLDOWN_BAR_HEIGHT, { radius: 2 }),
    pos(-COOLDOWN_BAR_WIDTH / 2, 40),
    anchor('left'),
    color(rgb(TYPE.TYPE_COLORS[monster.type])),
  ])

  monsterSprite.onUpdate(() => {
    const ratio = 1 - monster.basicCooldown / MOVE.BASIC_ATTACK.cooldown
    fill.width = COOLDOWN_BAR_WIDTH * Math.max(0, Math.min(1, ratio))
  })

  return monsterSprite
}
