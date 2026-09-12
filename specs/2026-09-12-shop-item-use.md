# Shop Item Use Plan

Let players use Full Restore, Heal Potion, and Revive directly from the shop items modal, and show toast feedback when items are used in the shop and in battle.

## Summary

Add optional interactivity to item cards rendered in the shop's items modal so the player can tap a card to consume Full Restore, Heal Potion, and Revive before a battle. Heal Potion and Revive open a team-select modal (filtered to eligible monsters). Introduce a reusable `addToast` gameobject to show float-up feedback text when purchasing/using items, and reuse it in battle's `useItem`. Cap the shop items panel height so it never overflows short screens. Keep temporary battle boosters and the enemy debuff battle-only (card is not tappable in the shop).

## Implementation Steps

### 1. Create `addToast` gameobject

- File: `src/gameobjects/toast.ts` (new)
- `addToast({ message, y?, color? })` — single options object (matches `addTooltip` convention):
  - `message: string` (required)
  - `y?: number` — default `center().y`
  - `color?: RGB` — default green `(100, 255, 100)`
- Text size 24, anchored center at `center().x`
- Rare float-up tween: `y` minus 30 over 1s, opacity 1→0, `easeOutQuad`; destroys itself on end

- File: `src/gameobjects/index.ts`
- Add `export * from './toast'`

### 2. Make item cards tappable

- File: `src/gameobjects/itemCard.ts`
- Add optional prop `hint?: string` — when provided, render a static right-aligned affordance label (e.g. `Use`) at the card's bottom-right (under the `xN` count, at `DESCRIPTION_Y`)
- Whole-card `onClick` already exists and gives hover intent (pointer cursor + tint) — this is the interaction path
- Cards without `onClick`/`hint` are inert (battle-only boosters in the shop)

### 3. Update shop item usage

- File: `src/scenes/shop.ts`
- Import `addToast` from `../gameobjects` and `fullHealTeam` from `../utils`
- Replace `showPurchaseFeedback` with `addToast` at both purchase sites:
  - `addToast({ message: 'Purchased ${item.label}!', y: <cardY> })` (for card-purchases and the Level Up monster-select)
  - Delete `showPurchaseFeedback` function
- Change `showTeamOverlay(options)` to `showTeamOverlay(options, monsters = playerTeam)` — pass `monsters` into `addTeamOverlay` instead of hardcoding `playerTeam`
- Add helper `consumeInventoryItem(id: string)`: find + splice the first matching item from `runState.inventory`
- Items modal rows: make a card tappable only when eligible (computed at render time) — `hint: 'Use'` + `onClick` when eligible, neither when not:
  | Item                         | Tappable when                             | Flow                                                                                                                                                                                                                                             |
  | ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Full Restore                 | any monster fainted or alive & missing HP | close items modal → `fullHealTeam(playerTeam)` + `sfx('heal')` + consume → `addToast({ message: 'Healed entire team!' })`                                                                                                                        |
  | Heal Potion                  | ≥1 alive monster missing HP               | close items modal → `showTeamOverlay({ title: item.label, subtitle: 'Select a monster to heal' }, aliveMissingHp)` → on select: `currentHp = maxHp` + consume → `addToast({ message: 'Healed {name}!' })`                                        |
  | Revive                       | ≥1 fainted monster                        | close items modal → `showTeamOverlay({ title: item.label, subtitle: 'Select a fainted monster to revive' }, faintedOnly)` → on select: `isAlive = true`, `currentHp = floor(maxHp * 0.5)` + consume → `addToast({ message: 'Revived {name}!' })` |
  | temp boosters / Enemy Debuff | never                                     | card inert (no hint, no click)                                                                                                                                                                                                                   |
- Cap items panel height: `panelHeight = Math.min(120 + Math.max(1, groupedArray.length) * ITEM_ROW_HEIGHT, height() - 80)`

### 4. Add toasts to battle item use

- File: `src/scenes/battle.ts`
- Import `addToast` from `../gameobjects`
- In `useItem()`, add `addToast` calls (y = 160, above enemy sprite and clear of HUD):
  - `heal_potion` → `Healed {activePlayer.name}!` (only if active player exists)
  - `full_heal` → `Healed entire team!`
  - `revive` → `Revived {monster.name}!` (only if a fainted battle-team monster was revived)
  - temp boosters / debuff → `{item.label}!` (e.g. Enrage!, Iron Skin!, Haste!, Enemy Debuff!)

## Files to Modify

- `src/gameobjects/toast.ts` (new) — `addToast`
- `src/gameobjects/index.ts` — export toast
- `src/gameobjects/itemCard.ts` — optional `action` button
- `src/scenes/shop.ts` — toasts, Use buttons, `monsters` param, panel height cap
- `src/scenes/battle.ts` — toasts in `useItem`

## Verification

- [ ] Run TypeScript check: `npm run lint:tsc`
- [ ] Run auto-fix: `npm run lint:fix`
- [ ] Run build: `npm run build`
- [ ] Manual test: Open shop items modal → Full Restore card is tappable when team needs healing; tapping heals whole team and shows "Healed entire team!" toast
- [ ] Manual test: Heal Potion card tap opens team modal with only alive monsters missing HP; selecting one heals, shows "Healed {name}!", modal returns to shop
- [ ] Manual test: Heal Potion card is inert (no hover/tap) when nothing is healable
- [ ] Manual test: Revive card tap opens team modal with only fainted monsters; selecting revives at 50% HP, shows "Revived {name}!"
- [ ] Manual test: Revive card is inert when nothing is fainted
- [ ] Manual test: Temp boosters / Enemy Debuff cards are inert (no hint, no click) in shop items modal
- [ ] Manual test: Items panel does not overflow short screens
- [ ] Manual test: Battle item use shows the matching toast

## Risks/Considerations

- Filtered team modals hide ineligible monsters entirely — confirm the missing-row feedback is acceptable UX
- Items panel is capped but not scrollable — many item types could clip rows if the panel is capped mid-list
- Heal Potion/Revive use closes the items modal (uniform "land on shop" flow) — no in-place count refresh needed
