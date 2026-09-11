# Game Rebalance Plan

Rebalance game by nerfing bench regen, replacing permanent stat boosts with temporary battle boosters that have strategic side effects, lowering shop prices, and adding visual cooldown indicators.

## Summary

Nerf bench regen (5→1.5 HP/sec), replace permanent stat boosts with temporary boosters with side effects (Enrage: 2x ATK/-2-3 HP per sec, Iron Skin: 2x DEF/0.5x SPD, Haste: SPD boost/damage reduction, Enemy Debuff: 50% enemy ATK reduction), lower shop prices to 5-15 coins, and add visual cooldown indicators.

## Implementation Steps

### 1. Nerf bench regen

- File: `src/constants/stat.ts`
- Change `BENCH_REGEN_RATE` from 5 to 1.5 HP/sec

### 2. Create temporary battle booster system with side effects

- File: `src/types/item.ts`
- Add new item kinds: `temp_boost_enrage`, `temp_boost_iron_skin`, `temp_boost_haste`, `temp_debuff_enemy_attack`
- Extend `ItemDef` with optional `effect` field carrying all booster tuning (single source of truth):
  - `effect.duration` (seconds)
  - `effect.attackMult` (Enrage)
  - `effect.defenseMult` (Iron Skin)
  - `effect.speedMult` (Iron Skin/Haste)
  - `effect.damageMult` (Haste damage penalty)
  - `effect.enemyAttackMult` (Enemy Debuff)
  - `effect.selfDamagePerSec` (Enrage HP/sec)

- File: `src/types/monster.ts`
- Add temporary boost fields to Monster type: `attackBuff`, `defenseBuff`, `speedBuff`, `damageDebuff`, `enemyAttackDebuff` (all numbers representing remaining duration in seconds)

- File: `src/utils/monster.ts`
- Initialize new buff fields to 0 in `createMonster()`:
  - `attackBuff: 0`
  - `defenseBuff: 0` (reuse existing field)
  - `speedBuff: 0`
  - `damageDebuff: 0`
  - `enemyAttackDebuff: 0`

- File: `src/scenes/battle.ts`
- Update damage calculation to apply attackBuff, damageDebuff, and enemyAttackDebuff multipliers
- Update defense calculation to apply defenseBuff multiplier
- Update speed calculation to apply speedBuff multiplier
- Add buff decay logic in onUpdate loop (decrement all buff timers by dt())
- Add Enrage self-damage logic in onUpdate loop (reduce HP by `effect.selfDamagePerSec * dt()` from the item def while attackBuff active)
- Add buff application logic when items are used in `useItem()` function

### 3. Create shared item definitions constant with booster effects

- File: `src/constants/item.ts` (new)
- Create `ITEM_DEFS: ItemDef[]` — array of objects (id, kind, label, description, price, effect) mirroring the `UPGRADE_DEFS` pattern in `src/constants/upgrade.ts`
- Booster effect data lives on the item defs (replaces the `stat.ts` TEMP_* constants — `stat.ts` only keeps `BENCH_REGEN_RATE`):
  - Enrage: price 5, `effect { duration: 5, attackMult: 2, selfDamagePerSec: 2.5 }`
  - Iron Skin: price 5, `effect { duration: 5, defenseMult: 2, speedMult: 0.5 }`
  - Haste: price 5, `effect { duration: 5, speedMult: 2, damageMult: 0.75 }`
  - Enemy Debuff: price 5, `effect { duration: 5, enemyAttackMult: 0.5 }`
- Non-booster items with lowered prices:
  - Full Restore: 15 coins
  - Heal Potion: 5 coins
  - Revive: 10 coins
  - Level Up: 15 coins
- File: `src/constants/index.ts`
- Add `export * as ITEM from './item'`
- File: `src/scenes/shop.ts`
- Replace the local `SHOP_ITEMS` const with an import of `ITEM` from `../constants`

### 4. Update shop logic for new items

- File: `src/scenes/shop.ts`
- Remove permanent stat boost items (`stat_boost_attack`, `stat_boost_defense`, `stat_boost_hp`, `stat_boost_speed`)
- Update `applyPurchase()` to handle temporary boost items (add to inventory like consumables)
- Update `NEEDS_SELECTION` set to exclude temporary boost items (they apply to active monster when used in battle)
- Remove the four `stat_boost_*` kinds from `NEEDS_SELECTION`

### 5. Add visual cooldown indicators for boosters

- File: `src/gameobjects/monster.ts` or modify existing monster display
- Add function to show cooldown indicator above active monster when buff is active
- Display buff name and remaining time (e.g., "ENRAGE 3.2s")
- Update battle scene to update indicator text each frame based on remaining buff duration
- Remove indicator when buff expires

### 6. Update battle item usage

- File: `src/scenes/battle.ts`
- Update `useItem()` function to handle new temporary booster items, reading values from `item.effect`:
  - `temp_boost_enrage`: Set `attackBuff = item.effect.duration`
  - `temp_boost_iron_skin`: Set `defenseBuff = item.effect.duration`
  - `temp_boost_haste`: Set `speedBuff = item.effect.duration` and `damageDebuff = item.effect.duration`
  - `temp_debuff_enemy_attack`: Set `enemyAttackDebuff = item.effect.duration` on active enemy

## Files to Modify

- `src/constants/item.ts` (new) - shared `ITEM_DEFS` array of objects with booster effects
- `src/constants/stat.ts` - bench regen rate only (booster tuning lives in ITEM_DEFS)
- `src/constants/index.ts` - export ITEM namespace
- `src/types/item.ts` - new item kinds, booster `effect` field on `ItemDef`
- `src/types/monster.ts` - new buff fields
- `src/utils/monster.ts` - initialize buff fields
- `src/scenes/battle.ts` - buff logic, damage calc, item usage, visual indicators
- `src/scenes/shop.ts` - import ITEM_DEFS, new items, purchase logic
- `src/gameobjects/monster.ts` - visual cooldown indicators

## Verification

- [ ] Run TypeScript check: `npm run lint:tsc`
- [ ] Run build: `npm run build`
- [ ] Manual test: Battle to verify bench regen is slower (1.5 HP/sec)
- [ ] Manual test: Purchase Enrage from shop, use in battle, verify 2x damage and self-damage
- [ ] Manual test: Purchase Iron Skin, verify 2x defense and 0.5x speed
- [ ] Manual test: Purchase Haste, verify speed boost and damage reduction
- [ ] Manual test: Purchase Enemy Debuff, verify enemy attack reduced
- [ ] Manual test: Verify visual cooldown indicators appear and countdown correctly
- [ ] Manual test: Verify all buffs expire after 5 seconds

## Risks/Considerations

- Enrage self-damage may kill low-HP monsters - monitor balance
- Side effects may make boosters too situational - tune multipliers if needed
- Visual indicators need to be readable during fast-paced battle - use large text
- Multiple buffs could stack - decide if this is allowed or mutually exclusive (currently allowing stacking)
- Lower prices may make game too easy - monitor coin economy and adjust if needed
