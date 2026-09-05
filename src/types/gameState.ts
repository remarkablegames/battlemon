import type { ItemDef } from './item'
import type { Monster } from './monster'

export interface RunState {
  playerTeam: Monster[]
  wave: number
  activePlayerIndex: number
  bestWave: number
  coins: number
  defeatedEnemies: Monster[]
  inventory: ItemDef[]
  battleRoster: number[]
  enemyTeam: Monster[]
  // post-battle rewards
  battleXpGains: Map<string, { xpGained: number; oldLevel: number }> // monster id -> XP gained and old level
  battleCoinReward: number
}
