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
}
