import type { Personality } from '../types'

export const PERSONALITIES: Personality[] = [
  'brave',
  'timid',
  'sturdy',
  'swift',
  'calm',
  'fierce',
]

export const PERSONALITY_LABELS: Record<Personality, string> = {
  brave: 'Brave',
  timid: 'Timid',
  sturdy: 'Sturdy',
  swift: 'Swift',
  calm: 'Calm',
  fierce: 'Fierce',
}

// stat multipliers: [hp, attack, defense, speed]
export const PERSONALITY_MODIFIERS: Record<
  Personality,
  { hp: number; attack: number; defense: number; speed: number }
> = {
  brave: { hp: 1, attack: 1.15, defense: 1, speed: 0.85 },
  timid: { hp: 1, attack: 0.85, defense: 1, speed: 1.15 },
  sturdy: { hp: 1.1, attack: 0.9, defense: 1.2, speed: 1 },
  swift: { hp: 0.9, attack: 1, defense: 0.85, speed: 1.25 },
  calm: { hp: 1.15, attack: 1, defense: 1.1, speed: 0.9 },
  fierce: { hp: 0.85, attack: 1.25, defense: 0.9, speed: 1.1 },
}
