import type { AudioPlay, TweenController } from 'kaplay'

import { AUDIO } from '../constants'
import type { MusicTrack, SoundEvent } from '../types'

let currentMusic: AudioPlay | null = null
let currentTrack: MusicTrack | null = null
let currentTween: TweenController | null = null

export function getAudioMuted(): boolean {
  return getData<{ muted?: boolean }>(AUDIO.AUDIO_STORAGE_KEY)?.muted ?? false
}

export function setAudioMuted(value: boolean): void {
  setData(AUDIO.AUDIO_STORAGE_KEY, { muted: value })
  syncMusicMuted()
}

export function toggleMuted(): boolean {
  const next = !getAudioMuted()
  setAudioMuted(next)
  return next
}

function syncMusicMuted(): void {
  if (currentMusic != null) {
    currentMusic.paused = getAudioMuted()
  }
}

export function sfx(event: SoundEvent): void {
  if (getAudioMuted()) {
    return
  }

  play(AUDIO.SOUND[event], {
    volume: AUDIO.SOUND_VOL[event] ?? AUDIO.SFX_VOL,
  })
}

export function playMusic(track: MusicTrack): void {
  if (currentTrack === track && currentMusic != null) {
    return
  }

  currentTween?.cancel()
  currentTween = null

  const next = play(track, { loop: true })
  next.volume = 0
  currentTrack = track

  const previous = currentMusic
  currentMusic = next

  if (getAudioMuted()) {
    previous?.stop()
    next.volume = AUDIO.MUSIC_VOL
    next.paused = true
    return
  }

  if (previous != null) {
    const fadeOut = tween(
      previous.volume,
      0,
      AUDIO.FADE_DURATION,
      (volume) => {
        previous.volume = volume
      },
      easings.easeInOutSine,
    )
    fadeOut.onEnd(() => {
      previous.stop()
    })
  }

  const fadeIn = tween(
    0,
    AUDIO.MUSIC_VOL,
    AUDIO.FADE_DURATION,
    (volume) => {
      next.volume = volume
    },
    easings.easeInOutSine,
  )
  currentTween = fadeIn
}
