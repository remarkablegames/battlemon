import type { Monster } from '../types'
import { randomMonster } from './monster'

export function spawnWave(wave: number): Monster[] {
  // enemy count scales: 1 enemy for waves 1-2, 2 for 3-5, 3 for 6+
  const count = wave <= 2 ? 1 : wave <= 5 ? 2 : 3
  // enemy level scales with wave
  const level = Math.max(1, Math.floor(wave * 1.2))

  return Array.from({ length: count }, () => randomMonster(level))
}
