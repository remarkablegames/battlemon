import { SPRITE, STAT } from '../constants'

const MULTIPLIER_BY_ID = new Map(
  SPRITE.SPRITES.map((config) => [config.id, config.sizeMultiplier ?? 1]),
)

export function monsterHeightMultiplier(spriteId: string): number {
  return MULTIPLIER_BY_ID.get(spriteId) ?? 1
}

export function monsterHeight(spriteId: string): number {
  return STAT.MONSTER_HEIGHT * monsterHeightMultiplier(spriteId)
}
