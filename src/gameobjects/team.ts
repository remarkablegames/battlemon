import type { Monster } from '../types'

export const MAX_TEAM_SIZE = 3

export function createTeam(): Monster[] {
  return []
}

export function addToTeam(team: Monster[], monster: Monster): boolean {
  if (team.length >= MAX_TEAM_SIZE) return false
  team.push(monster)
  return true
}

export function getAliveMonsters(team: Monster[]): Monster[] {
  return team.filter(({ isAlive }) => isAlive)
}

export function getActiveMonster(
  team: Monster[],
  index: number,
): Monster | null {
  if (index < 0 || index >= team.length) return null
  return team[index].isAlive ? team[index] : null
}

export function swapActiveMonster(
  team: Monster[],
  _fromIndex: number,
  toIndex: number,
): boolean {
  if (toIndex < 0 || toIndex >= team.length) return false
  if (!team[toIndex].isAlive) return false
  // swap logic is handled by changing the active index externally
  return true
}

export function healTeam(team: Monster[], amount: number): void {
  for (const monster of team) {
    if (monster.isAlive) {
      monster.currentHp = Math.min(monster.maxHp, monster.currentHp + amount)
    }
  }
}

export function fullHealTeam(team: Monster[]): void {
  for (const monster of team) {
    monster.currentHp = monster.maxHp
    monster.isAlive = true
  }
}

export function isTeamDefeated(team: Monster[]): boolean {
  return team.every(({ isAlive }) => !isAlive)
}
