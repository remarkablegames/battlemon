# Shop +100 XP Item

Rework the shop's "Level Up" item into a flat "+100 XP" boost so it grants partial progress at higher levels instead of a guaranteed level-up, and update the team overlay used to pick the XP target to show an XP bar instead of the mini HP bar.

## Summary

The shop's `xp_up` item (`src/constants/item.ts`) currently grants exactly one full level (`gainXp(monster, monster.xpToNextLevel)` in `src/scenes/shop.ts`). Because XP requirements grow exponentially (`xpForLevel` = `100 × 1.5^(level−2)` in `src/constants/stat.ts`), a flat +100 XP reward is a full level at Lv1 (100 XP), but only partial progress at higher levels — making the level-up decision more interesting.

The team overlay that selects the XP target (`openMonsterSelect` → `addTeamOverlay`) shows each monster's name, stats line, and a mini HP bar. Since the player now chooses who receives partial XP progress, the overlay should surface progress instead of health: the mini HP bar is replaced by an XP bar (`xp / xpToNextLevel`).

## Current State

- **Item** (`src/constants/item.ts:63-69`): `xp_up`, label "Level Up", description "+1 Level", price 15.
- **Purchase logic** (`src/scenes/shop.ts:378-381`): `gainXp(monster, monster.xpToNextLevel)` — always exactly one level. `sfx('levelUp')` always plays.
- **XP curve** (`src/constants/stat.ts:52-58`): `XP_BASE = 100`, `XP_MULTIPLIER = 1.5`; `xpForLevel(level) = round(100 × 1.5^(level−2))`. Lv1→2 = 100, Lv2→3 = 150, Lv3→4 = 225, Lv4→5 = 338...
- **Team overlay** (`src/gameobjects/teamOverlay.ts`): per-row name + Lv, stats line (`ATK | DEF | SPD`), and a mini HP bar (`addMiniHpBar`, width 200 at y 62). `showHpBar` option defaults true.
- **Selection flow** (`src/scenes/shop.ts:97, 313-328`): `xp_up` is in `NEEDS_SELECTION`; `openMonsterSelect` opens the team overlay to pick a monster.

## Implementation Steps

### 1. Add an XP amount constant

- File: `src/constants/stat.ts`
- Add `export const XP_ITEM_AMOUNT = 100 // XP granted by the shop +100 XP item` beside the existing XP curve constants.

### 2. Update the shop item

- File: `src/constants/item.ts`
- The shop item previously `level_up` becomes `id`/`kind` `xp_up` with label → `+100 XP`, description → `Grants 100 XP to 1 monster`, price 15. The `ItemKind` union (`src/types/item.ts`) and the shop's `NEEDS_SELECTION` set / `applyPurchase` case (`src/scenes/shop.ts`) use the new `xp_up` name.

### 3. Update purchase logic

- File: `src/scenes/shop.ts`
- `applyPurchase` `xp_up` case → grant flat XP, play `levelUp` sfx only when a level was gained, otherwise `powerup`:
  ```ts
  case 'xp_up': {
    const oldLevel = monster.level
    gainXp(monster, STAT.XP_ITEM_AMOUNT)
    sfx(monster.level > oldLevel ? 'levelUp' : 'powerup')
    break
  }
  ```
- Import `STAT` from `../constants` (currently only `ITEM, SCENE`).

### 4. XP bar in the target-selection overlay

- File: `src/gameobjects/teamOverlay.ts`
- Add `showXpBar?: boolean` to `TeamOverlayOptions` (default `false`).
- Per row, when `showXpBar` is true:
  - Skip the mini HP bar (stats line unchanged: `ATK {attack} | DEF {defense} | SPD {speed}`).
  - Render a mini XP bar at the former HP-bar position (`x: 90, y: 62`, width 200, height 10): track `rgb(60, 60, 80)`, fill `rgb(100, 200, 100)` (matches the post-battle XP bar), fill ratio `monster.xp / monster.xpToNextLevel`, plus `{xp}/{xpToNextLevel}` text to the right. Fill width refreshed in `onUpdate` (like `addMiniHpBar`).
- Precedence: if both `showHpBar` and `showXpBar` are true, `showXpBar` wins.

### 5. Enable in the shop only for XP targeting

- File: `src/scenes/shop.ts`
- In `openMonsterSelect`'s `showTeamOverlay` call (line ~316), pass `showXpBar: true`. All other overlay call sites (team view, heal/revive targets, battle revive, tame discard) unchanged.

## Files to Modify

- `src/constants/stat.ts` - add `XP_ITEM_AMOUNT`
- `src/constants/item.ts` - `level_up` label/description
- `src/gameobjects/teamOverlay.ts` - `showXpBar` option, XP bar
- `src/scenes/shop.ts` - flat XP grant, conditional sfx, `showXpBar: true`, `STAT` import

## Verification

- [ ] Run TypeScript check: `npm run lint:tsc`
- [ ] Run lint: `npm run lint:fix`
- [ ] Run build: `npm run build`
- [ ] Manual: Buy "+100 XP" at Lv1 monster → levels up to Lv2 (levelUp sfx)
- [ ] Manual: Buy "+100 XP" on high-level monster → partial XP bar progress, no levelUp sfx
- [ ] Manual: Open the +100 XP target overlay → XP bar replaces HP bar; stats line unchanged

## Risks/Considerations

- A flat 100 XP at high levels is small relative to battle rewards; price 15 coins is left unchanged per product decision but can be tuned later if the item feels weak at level ~10+.
- The XP-bar overlay no longer shows HP (the stats line keeps `ATK | DEF | SPD` only); the HP bar is hidden in that select flow, so a player picking an XP target sees no health info.
- `showXpBar` is intentionally opt-in so battle/tame overlays keep the HP bar.
