export type UpgradeKind =
  'stat_boost' | 'learn_move' | 'heal_team' | 'add_monster'

export interface UpgradeDef {
  kind: UpgradeKind
  label: string
  description: string
}
