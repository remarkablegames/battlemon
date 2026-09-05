import { MOVE, PERSONALITY, STAT, TYPE } from '../constants'
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
    xp: 0,
    xpToNextLevel: STAT.xpForLevel(level + 1),
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

export function gainXp(monster: Monster, amount: number): void {
  monster.xp += amount

  // handle multiple level ups from large XP gains
  while (monster.xp >= monster.xpToNextLevel) {
    monster.xp -= monster.xpToNextLevel
    levelUp(monster)
  }
}

function levelUp(monster: Monster): void {
  monster.level++

  // recalculate stats from STAT_GROWTH
  const mods = PERSONALITY.PERSONALITY_MODIFIERS[monster.personality]
  const growth = {
    hp: STAT.BASE_STATS.hp + STAT.STAT_GROWTH.hp * (monster.level - 1),
    attack:
      STAT.BASE_STATS.attack + STAT.STAT_GROWTH.attack * (monster.level - 1),
    defense:
      STAT.BASE_STATS.defense + STAT.STAT_GROWTH.defense * (monster.level - 1),
    speed: STAT.BASE_STATS.speed + STAT.STAT_GROWTH.speed * (monster.level - 1),
  }

  monster.baseStats = {
    hp: Math.round(growth.hp * mods.hp),
    attack: Math.round(growth.attack * mods.attack),
    defense: Math.round(growth.defense * mods.defense),
    speed: Math.round(growth.speed * mods.speed),
  }

  monster.maxHp = monster.baseStats.hp
  monster.currentHp = monster.maxHp // full heal on level up

  // update XP requirement for next level
  monster.xpToNextLevel = STAT.xpForLevel(monster.level + 1)

  // learn new move at specific levels
  const moveLearningLevels: Record<number, typeof MOVE.LEARNABLE_MOVES> = {
    3: MOVE.LEARNABLE_MOVES,
    5: MOVE.LEARNABLE_MOVES,
  }

  const availableMoves = moveLearningLevels[monster.level].filter(
    (move) => !monster.moves.some(({ id }) => id === move.id),
  )

  if (availableMoves.length > 0) {
    const newMove = choose(availableMoves)
    monster.moves.push(newMove)
  }
}
