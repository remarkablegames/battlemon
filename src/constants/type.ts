import type { MonsterType } from '../types'

export const TYPES: MonsterType[] = [
  'fire',
  'water',
  'plant',
  'electric',
  'earth',
  'air',
]

// each type is strong against one and weak against one
export const TYPE_CHART: Record<
  MonsterType,
  { strong: MonsterType; weak: MonsterType }
> = {
  fire: { strong: 'plant', weak: 'water' },
  water: { strong: 'fire', weak: 'electric' },
  plant: { strong: 'water', weak: 'fire' },
  electric: { strong: 'water', weak: 'earth' },
  earth: { strong: 'electric', weak: 'air' },
  air: { strong: 'earth', weak: 'electric' },
}

export const TYPE_COLORS: Record<MonsterType, string> = {
  fire: '#ff6b3d',
  water: '#4dabf7',
  plant: '#51cf66',
  electric: '#fcc419',
  earth: '#a78b6f',
  air: '#e0e0e0',
}

export const TYPE_LABELS: Record<MonsterType, string> = {
  fire: 'Fire',
  water: 'Water',
  plant: 'Plant',
  electric: 'Electric',
  earth: 'Earth',
  air: 'Air',
}

// sprites mapped to each type from public/sprites/
export const TYPE_SPRITES: Record<MonsterType, string[]> = {
  fire: ['dino_red', 'slime_fire'],
  water: ['dino_blue', 'dude_monster', 'slime_blue'],
  plant: ['plant_blue', 'plant_purple', 'plant_red'],
  electric: ['dino_yellow'],
  earth: ['dino_green', 'slime_green'],
  air: ['owlet_monster', 'pink_monster'],
}

export function getTypeMultiplier(
  attacker: MonsterType,
  defender: MonsterType,
): number {
  if (TYPE_CHART[attacker].strong === defender) return 1.5
  if (TYPE_CHART[attacker].weak === defender) return 0.5
  return 1
}
