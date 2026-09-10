# Add Sound Effects and Music

Load and play the audio assets already present in `public/sounds/` (8 UI mp3 files, 7 battle mp3 files) and `public/music/` (4 mp3 tracks). Wire sound effects into global UI components (buttons/cards), battle events (attack, hit, death, item use), and level-ups; play a per-scene music track; add a persistent mute toggle using the `sprites/ui/sounds.png` / `sprites/ui/sounds-o.png` icons in the top-right corner of every scene.

## Summary

Audio assets existed on disk but were never loaded or triggered. This spec centralizes audio config in `src/constants/audio.ts`, provides an audio helper module (`src/utils/audio.ts`), loads all sounds/music/icons in the preload scene, plays SFX from button/card hovers/clicks and battle game events, switches music by scene (title/gameover share the Title Theme; battle gets Decisive Battle; progress screens get "And The Journey Begins"; rest screens get "Take some rest and eat some food"), and adds a mute toggle (`sounds-o` = sound on, `sounds` = muted) to all 9 scenes. Mute preference is persisted to localStorage at `org.remarkablegames.battlemon.audio`.

## Current State

- **Assets present, not wired**: `public/sounds/ui/*.mp3` (8 files), `public/sounds/battle/*.mp3` (7 files), `public/music/*.mp3` (4 tracks), `public/sprites/ui/sounds.png` (64x64, muted) and `sounds-o.png` (70x70, on) are untracked and unused
- **Preload**: loads only sprites and fonts, then calls `go()`
- **UI**: `addButton` and `addCard` handle hover/click visuals but no audio
- **Battle**: `battle.ts` handles damage, specials, deaths, swaps, item overlay, and XP via `gainXp` in `utils/monster.ts`; no audio hooks
- **Scenes**: 9 scenes (`title`, `starter`, `battle`, `postBattle`, `tame`, `shop`, `upgrade`, `waveStart`, `gameOver`) with no music
- **Kaplay 3001 audio**: `loadSound(name, src)` returns an `Asset<SoundData>`; `loadMusic(name, url)` streams and registers a URL by name; `play(name, opts)` resolves registered music by name (streamed) or sound, and returns an `AudioPlay` (`stop()`, `paused`, `volume`, `loop`)

## Implementation Steps

### 1. Create src/constants/audio.ts

Config-only module (no Kaplay calls):

- `SFX_VOL = 0.6`, `MUSIC_VOL = 0.25`, `FADE_DURATION = 1.5`
- `AUDIO_STORAGE_KEY = 'org.remarkablegames.battlemon.audio'`
- `SOUND_VOL: Partial<Record<SoundEvent, number>>` = per-event volume overrides (e.g. `levelUp: 0.3`); `sfx()` falls back to `SFX_VOL` when an event has no override
- `MUSIC: Record<MusicTrack, string>` = `{ title, battle, journey, rest }` -> the 4 mp3 files (relative paths)
- `SOUND: Record<SoundEvent, string>` = event -> file path (one file per event; paths prefixed with `sounds/`, e.g. `sounds/ui/click.mp3`, `sounds/battle/hit.mp3`)
- `MusicTrack` / `SoundEvent` hand-written unions live in `src/types/audio.ts` (constants import them), matching the existing pattern (e.g. `MonsterType`, `MoveKind`)

### 2. Create src/utils/audio.ts (exported from utils/index.ts)

- `getAudioMuted()` / `setAudioMuted()` / `toggleMuted()` - persisted via `getData`/`setData`
- `sfx(event)` - plays `SOUND[event]` at `SFX_VOL`, skipped when muted
- `playMusic(track)` - no-op when `track` equals the current track; otherwise crossfades: the new track starts at volume 0 and tweens up to `MUSIC_VOL` (0.6s, `easeInOutSine`) while the previous track tweens down to 0 and is stopped; an in-flight fade is cancelled on the next call; muted transitions pause the new track instead of fading. Uses `tween()` and `easings` globals. Volume is set explicitly because Kaplay's music path ignores the `volume` option.
- `syncMusicMuted()` - keeps the current `AudioPlay` in sync with the mute flag

### 3. Update src/scenes/preload.ts

- `loadSound(file, file)` for every sound file (names == relative file paths, all prefixed with `sounds/`); a missing path would return the SPA fallback (HTML) and fail `decodeAudioData` with "unknown content type"
- `loadMusic(name, file)` for every `MUSIC` entry (streamed, non-blocking)
- `loadSprite(id, file)` for both `SPRITE.SOUND_ICONS`
- Gate `go(...)` on `Promise.all([...fonts, ...soundAssets])`

### 4. Update src/main.ts

No changes needed (audio helpers are self-contained; SFX fire on the user gesture that triggers them).

### 5. Wire SFX into UI components

`src/gameobjects/button.ts`:

- `sfx('hover')` in the enabled hover branch
- internal `onClick` -> `sfx('click')` (only when not disabled; scene `onClick` handlers still fire independently)

`src/gameobjects/card.ts`:

- `sfx('hover')` in the enabled hover branch
- `onClick` -> `sfx('click')` (skipped when tagged `disabled`)

### 6. Create src/gameobjects/soundToggle.ts (exported from gameobjects/index.ts)

- `addSoundToggle(x, y)` - fixed, `z(100)`, centered sprite button
- Initial icon reflects `getAudioMuted()`
- On click: `sfx('click')`, `toggleMuted()`, then swap sprite via `unuse('sprite')` + `use(sprite(...))`

### 7. Battle + XP hooks

`src/scenes/battle.ts`:

- Scene entry: `playMusic('battle')`, `addSoundToggle(width() - 45, 45)` (top-right, consistent with all other scenes after the battle HUD coin counter was removed)
- `dealDamage`: `sfx('hit')`, plus `sfx('cut')` on crits; `sfx('splash')` when a defender dies
- `executeMove` specials: nuke/debuff -> `woosh`; buff/heal -> `spray`
- `spawnEnemySprite` -> `bushes`; `swapPlayerMonster` -> `woosh`
- Items overlay: open -> `open`, close -> `close`, heal/revive use -> `spray`

`src/utils/monster.ts` / callers:

- `gainXp` no longer plays sfx; `sfx('levelUp')` now lives at the call sites: the shop `level_up` item plays it on purchase, and the post-battle scene plays it when the XP bar reaches the level-up stage transition (fills to 100%, then crosses into new-level progress), so battle level-ups land on the screen change instead of mid-battle

### 8. Scene music + mute toggle (all 9 scenes)

| Scene      | Music   | Toggle position |
| ---------- | ------- | --------------- |
| title      | title   | width()-45, 45  |
| gameOver   | title   | width()-45, 45  |
| battle     | battle  | width()-45, 45  |
| starter    | journey | width()-45, 45  |
| waveStart  | journey | width()-45, 45  |
| upgrade    | journey | width()-45, 45  |
| shop       | rest    | width()-45, 45  |
| postBattle | rest    | width()-45, 45  |
| tame       | rest    | width()-45, 45  |

Because Kaplay destroys all objects on `go()`, the toggle is re-added per scene; same-track transitions (e.g. gameOver -> title) do not restart music.

## Files to Modify

- `src/constants/audio.ts` - new audio config
- `src/constants/sprite.ts` - `SOUND_ICONS` (mute toggle sprite ids/files, alongside `SPRITES`)
- `src/types/audio.ts` - `MusicTrack` / `SoundEvent` types
- `src/utils/audio.ts` - new audio helper module
- `src/utils/index.ts` - export audio
- `src/scenes/preload.ts` - load sounds, music, mute icons
- `src/gameobjects/button.ts` - hover/click SFX
- `src/gameobjects/card.ts` - hover/click SFX
- `src/gameobjects/soundToggle.ts` - new mute toggle
- `src/gameobjects/index.ts` - export soundToggle
- `src/scenes/battle.ts` - battle SFX + music + toggle
- `src/utils/monster.ts` - level-up SFX moved out to shop + post-battle call sites
- `src/scenes/title.ts`, `gameOver.ts`, `starter.ts`, `waveStart.ts`, `upgrade.ts`, `shop.ts`, `postBattle.ts`, `tame.ts` - music + toggle

## Verification

- [x] Run `npm run lint:tsc` to check TypeScript errors
- [x] Run `npm run lint` for ESLint/prettier
- [x] Run `npm run build` to verify the production bundle
- [ ] Test the game to ensure no sounds crash the preload
- [ ] Verify hover/click SFX play on buttons and cards
- [ ] Verify battle SFX (hit, crit, specials, death, spawn, swap, items) play
- [ ] Verify level-up SFX plays in battle XP and the shop level-up purchase
- [ ] Verify title/gameOver play Title Theme, battle plays Decisive Battle, starter/waveStart/upgrade play "And The Journey Begins", shop/postBattle/tame play "Take some rest and eat some food"
- [ ] Verify re-entering a scene with the same track does not restart the music
- [ ] Verify the mute toggle appears top-right in all 9 scenes and swaps between `sounds-o` (on) and `sounds` (muted)
- [ ] Verify mute state persists across reloads (localStorage `org.remarkablegames.battlemon.audio`) and pauses/resumes music
- [ ] Verify SFX/music play after user interaction; note the initial Title Theme may be silent on first load in browsers with autoplay policy (no unlock handler)

## Risks/Considerations

- **Autoplay policy**: browsers block programmatic audio until the user interacts with the page. SFX always fire on the triggering gesture and need no unlock; most BGM starts from button-clicks or after the first interaction and is allowed. The one exception is the initial Title Theme, which starts at scene-load before any gesture and may be silent on first load in autoplay-restricted browsers (it plays from gameOver onward). A first-gesture unlock handler was considered but omitted by choice.
- **Music volume**: Kaplay's streamed-music `AudioPlay` ignores the `play()` `volume` option, so `currentMusic.volume` is set explicitly.
- **Scene teardown**: Kaplay destroys scene objects on `go()`, so the toggle is added per scene rather than persisted globally.
