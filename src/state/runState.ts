import type { RunState } from '../types'

const STORAGE_KEY = 'org.remarkablegames.battlemon'

interface SaveData {
  bestWave: number
}

export const runState: RunState = {
  playerTeam: [],
  wave: 0,
  activePlayerIndex: 0,
  bestWave: 0,
  coins: 0,
  defeatedEnemies: [],
  inventory: [],
  battleRoster: [],
}

export function resetRunState(): void {
  runState.playerTeam = []
  runState.wave = 0
  runState.activePlayerIndex = 0
  runState.coins = 0
  runState.defeatedEnemies = []
  runState.inventory = []
  runState.battleRoster = []
}

export function loadBestWave(): number {
  const data = getData<SaveData>(STORAGE_KEY)
  if (data && typeof data.bestWave === 'number') {
    runState.bestWave = data.bestWave
    return data.bestWave
  }
  return 0
}

export function saveBestWave(wave: number): void {
  if (wave > runState.bestWave) {
    runState.bestWave = wave
    setData(STORAGE_KEY, { bestWave: wave })
  }
}
