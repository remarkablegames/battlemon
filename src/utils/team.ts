import type { Monster } from '../types'

export function fullHealTeam(team: Monster[]): void {
  for (const monster of team) {
    monster.currentHp = monster.maxHp
    monster.isAlive = true
  }
}

export function isTeamDefeated(team: Monster[]): boolean {
  return team.every(({ isAlive }) => !isAlive)
}
