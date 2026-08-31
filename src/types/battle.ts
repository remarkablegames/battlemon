import type { Monster } from './monster'

export interface BattleState {
  playerTeam: Monster[]
  enemyTeam: Monster[]
  activePlayerIndex: number
  activeEnemyIndex: number
  wave: number
  swapCooldown: number
  isWaveActive: boolean
}

export interface DamageResult {
  damage: number
  effectiveness: number
  isCrit: boolean
}
