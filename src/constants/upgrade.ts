import type { UpgradeDef } from '../types'

export const UPGRADE_DEFS: UpgradeDef[] = [
  {
    kind: 'stat_boost',
    label: 'Power Surge',
    description: '+20% Attack to your active monster.',
  },
  {
    kind: 'stat_boost',
    label: 'Iron Skin',
    description: '+20% Defense to your active monster.',
  },
  {
    kind: 'stat_boost',
    label: 'Vitality',
    description: '+30% Max HP to your active monster.',
  },
  {
    kind: 'stat_boost',
    label: 'Haste',
    description: '+20% Speed to your active monster.',
  },
  {
    kind: 'heal_team',
    label: 'Full Restore',
    description: 'Heal your entire team to full.',
  },
  {
    kind: 'add_monster',
    label: 'Recruit',
    description: 'Add a new monster to your team.',
  },
]
