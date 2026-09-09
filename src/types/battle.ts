import type { GameObj, PosComp, SpriteComp } from 'kaplay'

import type { Monster } from './monster'

export type MonsterState = 'idle' | 'attack' | 'hurt' | 'death'

// a battle monster sprite with the comps the animation helpers need
export type BattleSprite = GameObj<SpriteComp & PosComp>

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
