import { SCENE } from '../constants'
import { runState } from '../state'

const VALID_SCENES = new Set(Object.values(SCENE) as string[])

export function applyQuerystringOverrides(): string {
  const params = new URLSearchParams(window.location.search)
  const sceneParam = params.get('scene')
  const coinsParam = params.get('coins')
  const waveParam = params.get('wave')

  // Apply coins override if present
  if (coinsParam !== null) {
    const coins = Number.parseInt(coinsParam, 10)
    if (!Number.isNaN(coins)) {
      runState.coins = coins
    }
  }

  // Apply wave override if present
  if (waveParam !== null) {
    const wave = Number.parseInt(waveParam, 10)
    if (!Number.isNaN(wave)) {
      runState.wave = wave
    }
  }

  // Validate scene parameter
  if (sceneParam !== null && VALID_SCENES.has(sceneParam)) {
    return sceneParam
  }

  // No valid scene override, use default
  return SCENE.TITLE
}
