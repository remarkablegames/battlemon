# Battle and Shop Enhancements

Speed up battles, add visual feedback (damage numbers, crits, type effectiveness, cooldown bars, death animations), and introduce a tame/sell/shop economy loop to make combat snappy and rewarding.

## Phase 1: Speed Up Battles

Tune constants in `src/constants/stat.ts` and `src/constants/move.ts`:

- **Less HP**: `BASE_STATS.hp` 100 → 70, `STAT_GROWTH.hp` 15 → 10
- **More damage**: `BASE_STATS.attack` 20 → 25, `STAT_GROWTH.attack` 4 → 5
- **Faster cooldowns**: `BASIC_ATTACK.cooldown` 1.5s → 1s, special move cooldowns reduced ~30% across the board (e.g., fire 6→4, water 5.5→4, plant 5→3.5, electric 5→3.5, earth 6→4, air 7→5)
- **Swap cooldown**: 5s → 3s (more swapping = more agency)

Files: `src/constants/stat.ts`, `src/constants/move.ts`

## Phase 2: Damage Numbers

Add floating damage numbers on every hit in `arena.ts`:

- Create `spawnDamageNumber(x, y, damage, isCrit, isSuperEffective)` helper in `arena.ts`
- White text for normal, yellow for super-effective, red for crits
- Text floats upward and fades out over ~0.8s using `lifespan()` + `onUpdate()` for movement
- Size 20 normal, size 28 for crits
- Call from `dealDamage()` after damage is calculated

Files: `src/scenes/arena.ts`

## Phase 3: Critical Hits

Add crit chance to basic attacks in `arena.ts`:

- 15% crit chance on basic attacks (not specials — those are already powerful)
- Crit multiplier: 1.5x damage
- Pass `isCrit` flag to `spawnDamageNumber` for visual feedback
- Add `STAT.CRIT_CHANCE = 0.15` and `STAT.CRIT_MULTIPLIER = 1.5` to `src/constants/stat.ts`

Files: `src/constants/stat.ts`, `src/scenes/arena.ts`

## Phase 4: Type Effectiveness Text

Show effectiveness text on super-effective or resisted hits:

- "Super effective!" (yellow) when `typeMult > 1`
- "Not effective" (gray) when `typeMult < 1`
- Spawn as floating text below the damage number, slightly smaller
- Only show when multiplier is not neutral (skip `typeMult === 1`)
- Use `styledText` from `kaplay-plugin-text` with outline for readability

Files: `src/scenes/arena.ts`

## Phase 5: Button Cooldown Overlay

Add vertical cooldown overlays to the Swap and Ability buttons:

- Dark semi-transparent rect on top of the button, shrinking from full height to zero as cooldown ticks down
- **Ability button**: overlay shows `specialCooldown / special.maxCooldown` ratio; when cleared, button is ready
- **Swap button**: overlay complements the existing text indicator (keep both)
- Overlay is a child of the button, positioned with `anchor('bot')`, height updated via `setCooldownRatio(ratio)` method on the button GameObj
- `addButton` in `src/gameobjects/button.ts` includes an inline `cooldown` comp that contributes `setCooldownRatio(ratio)` to the button
- Arena scene calls `button.setCooldownRatio(ratio)` each frame based on cooldown values

Files: `src/gameobjects/button.ts`, `src/gameobjects/touchControls.ts`, `src/scenes/arena.ts`

## Phase 6: Monster Attack Cooldown Bars

Show a thin progress bar below each monster sprite indicating basic attack cooldown:

- Bar: ~60px wide, 4px tall, positioned below sprite (e.g., y + 40)
- Fills from empty to full as cooldown progresses; resets to empty when attack triggers
- Track (gray) + fill (type-colored) for player, red-tinted for enemy
- Add as a child of each sprite; update bar fill width in the sprite's own `onUpdate` using `basicCooldown / MOVE.BASIC_ATTACK.cooldown` ratio
- Works for both player and enemy sprites
- No changes to the main arena `onUpdate` loop — each sprite self-manages its bar

Files: `src/scenes/arena.ts`

## Phase 7: Death Animation

Replace instant disappearance with fade + shrink:

- In `dealDamage()` when `defender.currentHp <= 0`, mark `isAlive = false` as before
- Add `playDeathAnimation(sprite)` helper that tweens opacity 1→0 and scale 3→0 over ~0.4s, then destroys the sprite
- Call for both player and enemy sprites on death
- Ensure `checkWaveEnd()` still works (it checks `isAlive`, not sprite existence)
- For enemy: delay `spawnEnemySprite()` until animation completes

Files: `src/scenes/arena.ts`

## Verification

- `npm run lint:fix && npm run lint:tsc && npm run build`
- Manual playtest: battles feel fast, damage numbers visible, crits exciting, deaths animated, tame/sell/shop loop is engaging

## Phase 8: Currency System

Add coins to `runState`:

- Add `coins: number` to `RunState` interface and `runState` initial value (0)
- Reset coins in `resetRunState()`
- Display coin count in the HUD (small coin icon + number, top-right corner)
- Earn coins from: selling monsters (Phase 9) and wave clear bonuses

Files: `src/types/gameState.ts`, `src/state/runState.ts`, `src/gameobjects/hud.ts`

## Phase 9: Tame/Sell Mechanic

After clearing a wave, let the player choose one defeated enemy to tame or sell:

- New scene `SCENE.TAME` shown after wave clear, before shop
- Display all defeated enemies from that wave as cards
- Player taps one enemy, then chooses: **Tame** or **Sell**
  - **Tame**: Add to team if space (< 3); if team full, offer to swap with a benched monster
  - **Sell**: Gain coins (amount scales with enemy level, e.g., `level * 10`)
- Tame and Sell buttons are disabled until a card is selected (via `buttonState` comp with `setDisabled` method)
- Selected card is highlighted with a visible border
- After choice, proceed to shop scene
- Track defeated enemies in `runState` during arena battle (add `defeatedEnemies: Monster[]`)

Files: `src/constants/scene.ts`, `src/scenes/tame.ts`, `src/scenes/arena.ts`, `src/state/runState.ts`, `src/types/gameState.ts`

## Phase 10: Shop System

Replace the current upgrade scene with a coin-based shop:

- New scene `SCENE.SHOP` (replaces `SCENE.UPGRADE`)
- Player sees a list of purchasable items with prices:
  - **Stat boosts**: +20% Attack/Defense/HP/Speed (cost: 30 coins each)
  - **Heals**: Full team heal (cost: 20 coins), single monster heal (cost: 10 coins)
  - **Moves**: Random learnable move for active monster (cost: 40 coins)
  - **Buy monster**: Random monster at wave level (cost: 50 coins)
  - **Battle consumables**: Heal potion (cost: 15 coins), Revive (cost: 25 coins)
- Player can buy multiple items as long as they have coins
- "Continue" button proceeds to next wave
- Add `inventory: Item[]` to `runState` for battle consumables

Files: `src/constants/scene.ts`, `src/scenes/shop.ts`, `src/constants/item.ts` (new), `src/types/item.ts` (new), `src/state/runState.ts`, `src/types/gameState.ts`

## Phase 11: Battle Consumables

Allow using shop-purchased items during battle:

- Add an "Items" button (third button, bottom-center) to touch controls
- Tapping opens a pop-up overlay listing inventory items
- Player taps an item to use it:
  - **Heal potion**: Heals active monster to full
  - **Revive**: Revives a fainted monster at 50% HP
- Pop-up closes after use, battle resumes
- Update `touchControls.ts` to include items button and inventory overlay

Files: `src/gameobjects/touchControls.ts`, `src/scenes/arena.ts`
