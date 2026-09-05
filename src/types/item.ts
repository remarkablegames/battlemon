export type ItemKind =
  | 'heal_potion'
  | 'revive'
  | 'stat_boost_attack'
  | 'stat_boost_defense'
  | 'stat_boost_hp'
  | 'stat_boost_speed'
  | 'full_heal'
  | 'single_heal'
  | 'learn_move'
  | 'buy_monster'
  | 'level_up'

export interface ItemDef {
  id: string
  kind: ItemKind
  label: string
  description: string
  price: number
}
