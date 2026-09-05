// battle layout positions
export const PLAYER_POS = { x: 140, y: 620 }
export const ENEMY_POS = { x: 400, y: 280 }
export const BENCH_POS = [
  { x: 420, y: 720 },
  { x: 480, y: 760 },
  { x: 480, y: 680 },
]

// team sizes
export const MAX_TEAM_SIZE = 6
export const BATTLE_TEAM_SIZE = 3

// monster sprite size on screen (height in px, width scales proportionally)
export const MONSTER_HEIGHT = 96
export const MONSTER_ICON_HEIGHT = 48

// battle timing
export const BASIC_ATTACK_COOLDOWN = 1 // seconds
export const SPECIAL_COOLDOWN = 4 // seconds
export const SWAP_COOLDOWN = 3 // seconds
export const BENCH_REGEN_RATE = 5 // hp per second while benched

// base stats for a level-1 monster
export const BASE_STATS = {
  hp: 70,
  attack: 25,
  defense: 15,
  speed: 10,
}

// stat growth per level
export const STAT_GROWTH = {
  hp: 10,
  attack: 5,
  defense: 3,
  speed: 2,
}

// type effectiveness multipliers
export const TYPE_MULTIPLIER_STRONG = 1.5
export const TYPE_MULTIPLIER_WEAK = 0.5
export const TYPE_MULTIPLIER_NEUTRAL = 1

// critical hit
export const CRIT_CHANCE = 0.15
export const CRIT_MULTIPLIER = 1.5

// XP curve
export const XP_BASE = 100 // XP needed for level 1→2
export const XP_MULTIPLIER = 1.5 // exponential growth factor

export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(XP_BASE * Math.pow(XP_MULTIPLIER, level - 2))
}
