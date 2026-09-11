export type ItemKind =
  | 'heal_potion'
  | 'revive'
  | 'full_heal'
  | 'single_heal'
  | 'level_up'
  | 'temp_boost_enrage'
  | 'temp_boost_iron_skin'
  | 'temp_boost_haste'
  | 'temp_debuff_enemy_attack'

export interface BoosterEffect {
  duration: number
  attackMult?: number
  defenseMult?: number
  speedMult?: number
  damageMult?: number
  enemyAttackMult?: number
  selfDamagePerSec?: number
}

export interface ItemDef {
  id: string
  kind: ItemKind
  label: string
  description: string
  price: number
  effect?: BoosterEffect
}
