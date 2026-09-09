import { SPRITESHEET, STAT } from '../constants'
import type { BattleSprite, Monster, MonsterState } from '../types'

const SPRITE_BY_ID = new Map(
  SPRITESHEET.SPRITESHEETS.map((config) => [config.id, config]),
)

/**
 * Some monster families (dinos) hold all anims on the base sprite, while
 * others (humanoids, plants, slimes) use a separate sprite per state.
 */
export function getStateSpriteId(baseId: string, state: MonsterState): string {
  const base = SPRITE_BY_ID.get(baseId)
  if (base?.anims[state]) return baseId
  return `${baseId}_${state}`
}

/**
 * Tracks the current animation state of each battle sprite so stale
 * onEnd callbacks (e.g. from an attack interrupted by a counter-hurt)
 * don't revert an object still mid-animation.
 */
const spriteStates = new WeakMap<object, MonsterState>()

export function markSpriteIdle(sprite: BattleSprite): void {
  spriteStates.set(sprite, 'idle')
}

export function setSpriteState(
  battleSprite: BattleSprite,
  monster: Monster,
  state: MonsterState,
): void {
  const flip = battleSprite.flipX
  spriteStates.set(battleSprite, state)
  battleSprite.unuse('sprite')
  battleSprite.use(
    sprite(getStateSpriteId(monster.spriteId, state), {
      height: STAT.MONSTER_HEIGHT,
      animSpeed: STAT.ANIM_SPEED,
    }),
  )
  battleSprite.flipX = flip
  if (state === 'idle') {
    battleSprite.play('idle')
    return
  }
  if (state === 'death') {
    battleSprite.play('death')
    return
  }
  battleSprite.play(state, {
    onEnd: () => {
      if (spriteStates.get(battleSprite) !== state) return
      setSpriteState(battleSprite, monster, 'idle')
    },
  })
}

export function playDeathAnimation(sprite: BattleSprite): Promise<void> {
  return new Promise((resolve) => {
    sprite.onAnimEnd((name) => {
      if (name !== 'death') return
      if (spriteStates.get(sprite) !== 'death') return
      if (sprite.exists()) sprite.destroy()
      resolve()
    })
  })
}

export function shakeSprite(sprite: BattleSprite, intensity: number): void {
  const origX = sprite.pos.x
  const origY = sprite.pos.y
  let elapsed = 0
  const duration = 0.3
  const cancel = sprite.onUpdate(() => {
    elapsed += dt()
    if (elapsed >= duration) {
      sprite.pos.x = origX
      sprite.pos.y = origY
      cancel.cancel()
      return
    }
    const decay = 1 - elapsed / duration
    sprite.pos.x = origX + rand(-intensity, intensity) * decay
    sprite.pos.y = origY + rand(-intensity, intensity) * decay
  })
}
