# Wave Start & Tame/Shop Improvements

Three related changes to the battle flow: preview upcoming enemies on the wave start screen, move the sell mechanic from the tame scene to the shop, and add team/inventory view modals to the shop.

## Summary

Generate the enemy team in `waveStart` (instead of `arena`) and show a compact enemy preview row so players can make strategic team selections; remove the Sell button from the tame scene and add a Sell Monster feature to the shop via a shared team overlay; add Team and Items view modals to the shop so players can inspect their roster and inventory.

## Part A: Preview Enemies on Wave Start

### 1. Add `enemyTeam` to `RunState`

- **File:** `src/types/gameState.ts`
- Add `enemyTeam: Monster[]` to the `RunState` interface

- **File:** `src/state/runState.ts`
- Initialize `enemyTeam: []` in `runState`
- Reset `enemyTeam` in `resetRunState()`

### 2. Generate enemies in `waveStart` instead of `arena`

- **File:** `src/scenes/waveStart.ts`
- Call `spawnWave(wave)` at scene init and store result in `runState.enemyTeam`
- Import `spawnWave` from `../utils`

- **File:** `src/scenes/arena.ts`
- Replace `const enemyTeam = spawnWave(wave)` with `const enemyTeam = runState.enemyTeam`
- Remove the `spawnWave` import (no longer used in arena)

### 3. Add enemy preview row to `waveStart` layout

- **File:** `src/scenes/waveStart.ts`
- Add a compact horizontal row of enemy cards below the subtitle (~y=120), before player selection
- Each enemy card shows: sprite (small scale, tinted with type color), name, type label, level
- Max 3 enemies, spaced horizontally across the 540px width
- Add a small "Enemies" label above the row
- Shift player card start down to ~y=280 and reduce card spacing from 110 to ~95 to fit 6 cards above the start button

### 4. Adjust player card layout

- **File:** `src/scenes/waveStart.ts`
- Change `startY` from 170 to ~280
- Change `cardSpacing` from 110 to ~95
- Verify 6 cards fit: 280 + 5×95 = 755, well above start button at 900

### 5. Add enemy preview to starter scene

- **File:** `src/scenes/starter.ts`
- Generate Wave 1 enemies at scene init: `runState.enemyTeam = spawnWave(1)`
- Import `spawnWave` from `../utils`
- Add enemy preview row below the title (~y=145)
- Shift starter cards down to start at y=280 (from 240) to avoid overlap

### 6. Extract shared `addEnemyPreview` gameobject

- **File:** `src/gameobjects/enemyPreview.ts` (new)
- Create `addEnemyPreview(enemies, { label, y })` function
- Displays compact enemy cards: sprite (height 42px), type label (tinted), level
- Card background: dark red (60, 30, 30) with type-colored outline
- Used in both `starter.ts` and `waveStart.ts`

- **File:** `src/gameobjects/index.ts`
- Export `addEnemyPreview` from `enemyPreview.ts`

- **File:** `src/scenes/waveStart.ts`
- Replace inline enemy preview code with `addEnemyPreview(runState.enemyTeam, { label: 'Enemies', y: 175 })`

- **File:** `src/scenes/starter.ts`
- Replace inline enemy preview code with `addEnemyPreview(runState.enemyTeam, { label: 'Upcoming Enemies', y: 145 })`

## Part B: Move Sell from Tame to Shop

### 7. Remove Sell button from tame scene

- **File:** `src/scenes/tame.ts`
- Delete the `sellButton` definition and its `onClick` handler (lines 136–152)
- Update title from "Tame or Sell" to "Tame" (line 10)
- Remove `sellButton.setDisabled(false)` from card click handler (line 100)
- Reposition `tameButton` to left side (x: `center().x - 100`, y: `height() - 80`)
- Move `skipButton` to right side (x: `center().x + 100`, y: `height() - 80`) so both buttons sit side-by-side at the same level

### 8. Add shared `addTeamOverlay` function in shop

- **File:** `src/scenes/shop.ts`
- Add `addTeamOverlay(options)` function that reuses the existing `addMonsterSelect` overlay pattern:
  - Options: `{ title: string, onSelect?: (monster: Monster, i: number) => void }`
  - If `onSelect` is provided (sell mode): rows are clickable, show sell price (`monster.level * 10`) on the right, call `onSelect` on click then close
  - If `onSelect` is omitted (view mode): rows are display-only, no click action
  - Rows show: sprite (tinted with type color), name, type/level, stats — same layout as existing `addMonsterSelect` rows
  - Cancel button at the bottom (same as existing)
- Refactor existing `addMonsterSelect` to use `addTeamOverlay` internally (passing the purchase callback as `onSelect`)

### 9. Add Sell Monster, Team, and Items buttons to shop

- **File:** `src/scenes/shop.ts`
- Add three buttons at the bottom alongside Continue:
  - **Sell Monster** (x: `center().x - 170`, y: `height() - 60`) — opens `addTeamOverlay` in sell mode; on select: remove from `playerTeam`, add `level * 10` coins, `refreshCoins()`
  - **Team** (x: `center().x`, y: `height() - 60`) — opens `addTeamOverlay` in view mode (no `onSelect`)
  - **Items** (x: `center().x + 170`, y: `height() - 60`) — opens `addItemsOverlay` (new, see step 8)
- Shrink button widths to ~140 to fit four buttons side-by-side
- Guard: disable Sell Monster button if `playerTeam.length <= 1`

### 10. Add `addItemsOverlay` function in shop

- **File:** `src/scenes/shop.ts`
- Add `addItemsOverlay()` function — same overlay pattern as `addTeamOverlay`:
  - Title: "Items"
  - Lists `runState.inventory` items with label and description
  - Read-only (no click action), just a Cancel button
  - If inventory is empty, show "No items" message

## Verify

- `npm run lint:tsc` — type check passes
- `npm run lint:fix` — lint passes
- `npm start` — playtest: enemies visible on wave start, team selection works, battle starts with correct enemies, tame scene shows only Tame + Skip, shop has Sell/Team/Items buttons, selling works, can't sell last monster, team modal shows roster, items modal shows inventory
