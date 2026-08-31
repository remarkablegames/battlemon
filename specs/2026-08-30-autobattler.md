# Battlemon: Mobile-First Pokémon-Inspired Autobattler

Build a portrait-oriented, touch-driven autobattler where a player team of up to three monsters fights automatically through an endless arena run, with one active monster on screen at a time (Pokémon-style 1v1 layout), type advantages, move cooldowns, and roguelite upgrades.

## Design Decisions

- **Battle format:** Real-time autobattler with light Pokémon inspiration — each monster has a type, two moves with cooldowns, and stat-based auto-attacks. The player influences the fight by positioning the team, swapping monsters, and triggering limited-use abilities, but most attacks resolve automatically.
- **Progression model:** Endless arena run with permadeath and between-wave upgrade choices (roguelite). A persistent best-score and unlocked monster palettes save to `localStorage` via Kaplay `getData`/`setData`.
- **Monster art:** Use the existing Kaplay art-pack sprites in `public/sprites/` (23+ monster designs like `bean`, `dino`, `flowy`, `ghosty`, `mushroom`, etc.). Map each type to a subset of sprites and color-tint via `color()` for variety. Outline (`-o`) variants used for enemy versions.
- **Mobile layout:** Portrait-first 9:16 canvas with dynamic logical resolution via Kaplay's `width()`/`height()`, large touch buttons, tap-to-swap, and a bottom control panel. Landscape falls back to a centered, letterboxed portrait view.

## Core Mechanics

- **Team:** Player fields up to 3 monsters. One active monster is shown bottom-left like the classic Pokémon layout; the other two sit on a bench and regenerate slowly. Tap the active monster to swap in a benched teammate.
- **Types:** Fire, Water, Plant, Electric, Earth, Air. Each type has a single strength and weakness (e.g., Fire strong vs Plant, weak vs Water).
- **Stats:** HP, Attack, Defense, Speed. Speed shortens cooldowns and determines attack order.
- **Personality/Nature:** Each monster has one personality that applies a small stat bias (e.g., Brave +Attack/−Speed, Timid +Speed/−Attack, Sturdy +Defense/−Attack, Swift +Speed/−Defense). This makes same-type monsters feel distinct.
- **Moves:** Each monster has a fast basic auto-attack and one special move. The special fires automatically on cooldown; the player can also tap a large **Ability** button to force it early (with a shared charge/cooldown). Specials can be single-target nuke, team heal, or buff/debuff.
- **Auto-battle loop:** The active monster and the enemy pick their highest-priority ready move and target each other. The player can tap the enemy to retarget, tap the active monster to swap, or tap a limited-use ability. Swaps are real-time but have a 5-second global cooldown to prevent stalling.
- **Waves:** Defeat a wave to choose one of three randomized upgrades (stat boost, new move, heal team, add monster). Difficulty scales every wave.

## Pre-Battle Choices

- **Run start:** Choose 1 of 3 randomly rolled starter monsters (type and base stats differ).
- **Before each wave:** Choose which of your 3 monsters enters the arena first.
- **Between waves:** Choose one of three randomized upgrades (stat boost, learn/replace a move, heal team, add/recruit monster).

## File Changes

- `src/main.ts` — initialize Kaplay with portrait-first logical resolution and scale to fit.
- `src/scenes/preload.ts` — keep preloading any image assets; generate monster sprites programmatically at runtime.
- `src/scenes/start.ts` — add a title/start scene with touch-to-start.
- `src/scenes/game.ts` — replace free-roaming demo with the arena battle scene (or delete and use `arena.ts`).
- `src/scenes/` — add `arena.ts`, `starter.ts`, `waveStart.ts`, `upgrade.ts`, `gameOver.ts`.
- `src/gameobjects/` — add `monster.ts`, `team.ts`, `enemyWave.ts`, `hud.ts`, `touchControls.ts`, `button.ts`; **delete** demo `player.ts` and `enemy.ts`.
- `src/constants/` — add `type.ts`, `personality.ts`, `stat.ts`, `move.ts`, `upgrade.ts`; keep `scene.ts`; **delete** demo `sprite.ts` and `tag.ts` if unused.
- `src/types/` — add `monster.ts`, `move.ts`, `battle.ts`, `personality.ts`, `type.ts`, `upgrade.ts`; **delete** demo `gameobject.ts` and `sprite.ts` if unused.
- `src/state/` — add `runState.ts` with runtime game state, best wave persistence, and reset logic.
- `src/style.css` — black background, no scrollbars, canvas full viewport.
- `public/manifest.webmanifest` — update PWA name/theme if needed.

## Implementation Steps

1. **Viewport & mobile shell** — set logical portrait resolution, scaling, and touch-safe CSS.
2. **Sprite-based monster renderer** — map types to existing `public/sprites/` sprites, color-tint per monster, preload all needed sprites in `preload.ts`.
3. **Monster data model** — base stats, type, level, moves, and runtime battle state (hp, cooldowns, status effects).
4. **Battle engine** — tick loop that advances cooldowns, picks moves, applies damage with type multipliers, handles knockouts, and resolves waves.
5. **Team & enemy wave factories** — spawn player team and wave enemies with scaling difficulty.
6. **HUD & touch controls** — health bars, type badges, swap buttons, target reticle, ability button, and wave/upgrade counters.
7. **Upgrade scene** — card picker between waves with three choices.
8. **Game-over & persistence** — wave reached, best wave, unlock palettes; save via `getData`/`setData`.
9. **Polish** — simple particle effects on hit/kill, screen shake, sound placeholders, lint/type-check.

## Mobile UX Notes

- Minimum button size 64×64 logical pixels.
- Two-thumb layout: swap/ability buttons on bottom-left, target select on bottom-right.
- Tap active monster to open the swap panel; tap an enemy to retarget.
- Disable all native touch gestures (pan, double-tap zoom, pinch-to-zoom) via CSS `touch-action: none` so Kaplay handles all input.

## Verification

- `npm run lint:fix`
- `npm run lint:tsc`
- `npm run build`
- Manual playtest in browser devtools mobile portrait preset.
