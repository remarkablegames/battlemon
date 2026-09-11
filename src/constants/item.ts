import type { BoosterEffect, ItemDef, ItemKind } from '../types'

export const ITEM_DEFS: ItemDef[] = [
  {
    id: 'enrage',
    kind: 'temp_boost_enrage',
    label: 'Enrage',
    description: '2× ATK + -2.5 HP/sec for 5s',
    price: 5,
    effect: { duration: 5, attackMult: 2, selfDamagePerSec: 2.5 },
  },
  {
    id: 'iron_skin',
    kind: 'temp_boost_iron_skin',
    label: 'Iron Skin',
    description: '2× DEF + 0.5× SPD for 5s',
    price: 5,
    effect: { duration: 5, defenseMult: 2, speedMult: 0.5 },
  },
  {
    id: 'haste',
    kind: 'temp_boost_haste',
    label: 'Haste',
    description: '2× SPD + 0.75× DMG for 5s',
    price: 5,
    effect: { duration: 5, speedMult: 2, damageMult: 0.75 },
  },
  {
    id: 'enemy_debuff',
    kind: 'temp_debuff_enemy_attack',
    label: 'Enemy Debuff',
    description: 'Enemy ATK 0.5× for 5s',
    price: 5,
    effect: { duration: 5, enemyAttackMult: 0.5 },
  },
  {
    id: 'full_heal',
    kind: 'full_heal',
    label: 'Full Restore',
    description: 'Heal entire team',
    price: 15,
  },
  {
    id: 'heal_potion',
    kind: 'heal_potion',
    label: 'Heal Potion',
    description: 'Full heal in battle',
    price: 5,
  },
  {
    id: 'revive',
    kind: 'revive',
    label: 'Revive',
    description: 'Revive at 50% HP',
    price: 10,
  },
  {
    id: 'level_up',
    kind: 'level_up',
    label: 'Level Up',
    description: '+1 Level',
    price: 15,
  },
]

export function effectFor(kind: ItemKind): BoosterEffect | undefined {
  return ITEM_DEFS.find((item) => item.kind === kind)?.effect
}
