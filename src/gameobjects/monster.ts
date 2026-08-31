import { PERSONALITY, STAT, TYPE } from '../constants'
import type { Monster, MonsterStats, MonsterType, Personality } from '../types'

let monsterIdCounter = 0

export function createMonster(
  type: MonsterType,
  personality: Personality,
  level = 1,
  customName?: string,
): Monster {
  const sprites = TYPE.TYPE_SPRITES[type]
  const spriteId = choose(sprites)

  // apply personality modifiers to base stats + level growth
  const mods = PERSONALITY.PERSONALITY_MODIFIERS[personality]
  const growth = {
    hp: STAT.BASE_STATS.hp + STAT.STAT_GROWTH.hp * (level - 1),
    attack: STAT.BASE_STATS.attack + STAT.STAT_GROWTH.attack * (level - 1),
    defense: STAT.BASE_STATS.defense + STAT.STAT_GROWTH.defense * (level - 1),
    speed: STAT.BASE_STATS.speed + STAT.STAT_GROWTH.speed * (level - 1),
  }

  const baseStats: MonsterStats = {
    hp: Math.round(growth.hp * mods.hp),
    attack: Math.round(growth.attack * mods.attack),
    defense: Math.round(growth.defense * mods.defense),
    speed: Math.round(growth.speed * mods.speed),
  }

  const name =
    customName ??
    `${TYPE.TYPE_LABELS[type]} ${PERSONALITY.PERSONALITY_LABELS[personality]}`

  return {
    id: `monster_${String(monsterIdCounter++)}`,
    name,
    type,
    personality,
    spriteId,
    level,
    baseStats,
    moves: [],
    currentHp: baseStats.hp,
    maxHp: baseStats.hp,
    basicCooldown: 0,
    specialCooldown: 0,
    defenseBuff: 0,
    speedDebuff: 0,
    isAlive: true,
  }
}

export function randomMonster(level = 1): Monster {
  const type = choose(TYPE.TYPES)
  const personality = choose(PERSONALITY.PERSONALITIES)
  return createMonster(type, personality, level)
}

export function randomMonsterPool(count: number, level = 1): Monster[] {
  return Array.from({ length: count }, () => randomMonster(level))
}
