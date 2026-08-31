// battle layout positions
export const PLAYER_POS = { x: 140, y: 620 }
export const ENEMY_POS = { x: 400, y: 280 }
export const BENCH_POS = [
  { x: 420, y: 720 },
  { x: 480, y: 760 },
  { x: 480, y: 680 },
]

// monster sprite scale on screen
export const MONSTER_SCALE = 3
export const BENCH_SCALE = 1.5

// battle timing
export const BASIC_ATTACK_COOLDOWN = 1.5 // seconds
export const SPECIAL_COOLDOWN = 6 // seconds
export const SWAP_COOLDOWN = 5 // seconds
export const BENCH_REGEN_RATE = 5 // hp per second while benched

// base stats for a level-1 monster
export const BASE_STATS = {
  hp: 100,
  attack: 20,
  defense: 15,
  speed: 10,
}

// stat growth per level
export const STAT_GROWTH = {
  hp: 15,
  attack: 4,
  defense: 3,
  speed: 2,
}

// type effectiveness multipliers
export const TYPE_MULTIPLIER_STRONG = 1.5
export const TYPE_MULTIPLIER_WEAK = 0.5
export const TYPE_MULTIPLIER_NEUTRAL = 1
