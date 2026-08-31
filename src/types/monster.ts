import type { MoveDef } from './move'
import type { Personality } from './personality'
import type { MonsterType } from './type'

export interface MonsterStats {
  hp: number
  attack: number
  defense: number
  speed: number
}

export interface Monster {
  id: string
  name: string
  type: MonsterType
  personality: Personality
  spriteId: string
  level: number
  baseStats: MonsterStats
  moves: MoveDef[]
  // runtime battle state
  currentHp: number
  maxHp: number
  basicCooldown: number
  specialCooldown: number
  defenseBuff: number
  speedDebuff: number
  isAlive: boolean
}

export interface MonsterInstance extends Monster {
  team: 'player' | 'enemy'
}
