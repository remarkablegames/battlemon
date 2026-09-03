import type { MonsterType, MoveDef } from '../types'

export const BASIC_ATTACK: MoveDef = {
  id: 'basic',
  name: 'Tackle',
  kind: 'basic',
  power: 1,
  cooldown: 1,
  description: 'A quick basic attack.',
}

// special moves per type
export const SPECIAL_MOVES: Record<MonsterType, MoveDef> = {
  fire: {
    id: 'fire_blast',
    name: 'Fire Blast',
    kind: 'nuke',
    power: 2.5,
    cooldown: 4,
    description: 'A powerful fire attack.',
  },
  water: {
    id: 'water_surge',
    name: 'Water Surge',
    kind: 'nuke',
    power: 2.2,
    cooldown: 4,
    description: 'A surging water attack.',
  },
  plant: {
    id: 'leaf_storm',
    name: 'Leaf Storm',
    kind: 'nuke',
    power: 2,
    cooldown: 3.5,
    description: 'A storm of sharp leaves.',
  },
  electric: {
    id: 'thunderbolt',
    name: 'Thunderbolt',
    kind: 'debuff',
    power: 1.8,
    cooldown: 3.5,
    description: 'Damages and slows the enemy.',
  },
  earth: {
    id: 'rock_armor',
    name: 'Rock Armor',
    kind: 'buff',
    power: 1.5,
    cooldown: 4,
    description: 'Boosts own defense.',
  },
  air: {
    id: 'gust_heal',
    name: 'Healing Gust',
    kind: 'heal',
    power: 10,
    cooldown: 7,
    description: 'Heals the team.',
  },
}

// extra learnable moves for upgrade choices
export const LEARNABLE_MOVES: MoveDef[] = [
  {
    id: 'power_slam',
    name: 'Power Slam',
    kind: 'nuke',
    power: 3,
    cooldown: 8,
    description: 'A devastating slam attack.',
  },
  {
    id: 'quick_strike',
    name: 'Quick Strike',
    kind: 'nuke',
    power: 1.5,
    cooldown: 3,
    description: 'A fast light attack.',
  },
  {
    id: 'shield_up',
    name: 'Shield Up',
    kind: 'buff',
    power: 2,
    cooldown: 8,
    description: 'Greatly boosts defense.',
  },
  {
    id: 'team_mend',
    name: 'Team Mend',
    kind: 'heal',
    power: 5,
    cooldown: 8,
    description: 'Heals the whole team.',
  },
]
