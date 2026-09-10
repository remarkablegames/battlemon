import type { MusicTrack, SoundEvent } from '../types'

export const SFX_VOL = 0.6
export const MUSIC_VOL = 0.25
export const AUDIO_STORAGE_KEY = 'org.remarkablegames.battlemon.audio'
export const FADE_DURATION = 1.5

export const SOUND_VOL: Partial<Record<SoundEvent, number>> = {
  levelUp: 0.3,
}

export const MUSIC: Record<MusicTrack, string> = {
  title: 'music/Title Theme.mp3',
  battle: 'music/Decisive Battle.mp3',
  journey: 'music/And The Journey Begins.mp3',
  rest: 'music/Take some rest and eat some food.mp3',
}

export const SOUND: Record<SoundEvent, string> = {
  click: 'sounds/ui/click.mp3',
  hover: 'sounds/ui/hover.mp3',
  open: 'sounds/ui/open.mp3',
  close: 'sounds/ui/close.mp3',
  cancel: 'sounds/ui/cancel.mp3',
  start: 'sounds/ui/start.mp3',
  continue: 'sounds/ui/continue.mp3',
  levelUp: 'sounds/ui/level_up.mp3',
  hit: 'sounds/battle/hit.mp3',
  woosh: 'sounds/battle/woosh.mp3',
  splash: 'sounds/battle/splash.mp3',
  cut: 'sounds/battle/cut.mp3',
  spray: 'sounds/battle/spray.mp3',
  bubbles: 'sounds/battle/bubbles.mp3',
  bushes: 'sounds/battle/bushes.mp3',
  heal: 'sounds/battle/heal.mp3',
  powerup: 'sounds/battle/powerup.mp3',
  punch: 'sounds/battle/punch.mp3',
}
