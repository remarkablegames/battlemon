# Healing Gust Rebalance

Nerf Healing Gust with a diminishing-percentage heal curve so it starts at ~10% of max HP at level 1 and tapers to ~5% at high levels without becoming self-sustaining, round heals to whole numbers, and remove the dead learnable-moves system.

## Summary

Healing Gust (air-type special, `src/constants/move.ts`) currently heals a flat 10% of the caster's max HP every 7s (`maxHp * power`). Because enemy damage-per-hit stays roughly constant across levels while HP pools grow by ~10/level, a flat percentage heal scales up faster than incoming damage and an air monster can out-heal sustained enemy DPS around level ~12+ (10% of HP > 14 dmg / 7s window). But a pure log/diminishing curve drops too low: at high levels the heal feels weak (~3% of pool).

This spec replaces the flat-percentage heal with a **diminishing-percentage curve**:

```
heal = round(maxHp * power / (1 + diminish * (level - 1)))
```

With `power: 0.1` and `diminish: 0.042`, the heal starts at ~10% of max HP at level 1, tapers through mid game, and lands at ~5% at level 25 — above the sustain wall (enemy DPS at high level is ~25 HP/7s) but still meaningful. Heals are rounded to whole numbers for consistency with damage (`Math.round` in `dealDamage`).

Since the learnable-move system is dead code (`monster.moves` is populated but never consumed by the battle loop — specials always come from `SPECIAL_MOVES[attacker.type]`), this spec also removes `Team Mend`, the `LEARNABLE_MOVES` constant, the level-up learn block in `utils/monster.ts`, and the `moves` field on `Monster`.

## Current State

- **Healing Gust** (`src/constants/move.ts`): `kind: 'heal'`, `power: 0.1`, `cooldown: 7`, description "Heals 10% of the monster's max HP." — constant 10% is weak early in effect yet self-sustaining late.
- **Heal execution** (`src/scenes/battle.ts:333`): `attacker.currentHp + attacker.maxHp * special.power` — unbounded to whole numbers; HP can hold fractional values while damage is always rounded.
- **Learnable moves** (`src/utils/monster.ts:111-129`): pushes a random `LEARNABLE_MOVES` entry onto `monster.moves` at levels 3 and 5. Nothing in the battle loop ever reads `monster.moves` — `executeMove` always uses `SPECIAL_MOVES[attacker.type]`. `Team Mend` (`src/constants/move.ts:90-97`) and the entire `LEARNABLE_MOVES` array are unreachable.

## Balance Math

Stats: `HP = 35 + 10(level-1)`, `ATK = 25 + 5(level-1)`, `DEF = 15 + 3(level-1)`. Damage per basic hit `ATK/DEF` stays ~2 at every level; attack rate scales with `1 + speed/50`. Healing target curve (`power: 0.1`, `diminish: 0.042`, cooldown 7s):

| Level | Max HP | Old (10%)           | New heal | New % of pool |
| ----- | ------ | ------------------- | -------- | ------------- |
| 1     | 35     | 3.5                 | 4        | 10%           |
| 5     | 75     | 7.5                 | 6        | 8%            |
| 10    | 125    | 12.5                | 9        | 7%            |
| 15    | 175    | 17.5                | 11       | 6%            |
| 25    | 275    | 27.5 (self-sustain) | 14       | 5%            |

Late game the heal covers roughly half of sustained incoming damage instead of breaking even, so air monsters still decay under focused fire.

## Implementation Steps

### 1. Add `diminish` to `MoveDef`

- File: `src/types/move.ts`
- Add optional `diminish?: number` to `MoveDef`. Optional so non-heal moves keep working unchanged; `diminish` is only meaningful for `heal` moves (nukes treat `power` as a damage multiplier).

### 2. Update Healing Gust and remove dead moves

- File: `src/constants/move.ts`
- Healing Gust: `power: 0.1` → `power: 0.1` (unchanged), add `diminish: 0.042`, description → `"Heals a fraction of your health."` (`cooldown: 7` unchanged)
- Delete the `Team Mend` entry (dead code — see above)
- Delete the now-empty `LEARNABLE_MOVES` array

### 3. Update the heal branch

- File: `src/scenes/battle.ts`
- Replace the `case 'heal'` heal assignment with the diminishing-percentage formula, rounded to a whole number:
  ```ts
  case 'heal': {
    sfx('spray')
    const fraction =
      special.power /
      (1 + (special.diminish ?? 0) * (attacker.level - 1))
    const heal = Math.round(attacker.maxHp * fraction)
    attacker.currentHp = Math.min(
      attacker.maxHp,
      attacker.currentHp + heal,
    )
    break
  }
  ```
- `special.diminish ?? 0` keeps the branch safe for any future heal move without the field.

### 4. Remove dead learnable-move code

- File: `src/utils/monster.ts`
- Remove the `moveLearningLevels` block in `levelUp` (lines ~111-129)
- Remove `moves: []` from `createMonster`'s returned object
- Remove `MOVE` from the `../constants` import (no longer referenced)
- File: `src/types/monster.ts`
- Remove `moves: MoveDef[]` from `Monster`
- Remove the now-unused `import type { MoveDef } from './move'`

## Files to Modify

- `src/types/move.ts` - `diminish?: number` on `MoveDef`
- `src/constants/move.ts` - Healing Gust curve + description; delete Team Mend / LEARNABLE_MOVES
- `src/scenes/battle.ts` - diminishing-percentage rounded heal
- `src/utils/monster.ts` - remove learn block, `moves` init, unused `MOVE` import
- `src/types/monster.ts` - remove `moves` field + unused import

## Verification

- [ ] Run TypeScript check: `npm run lint:tsc`
- [ ] Run build: `npm run build`
- [ ] Manual: Battle with an air monster at level 1, verify heal ≈ 4 HP (~10%), rounded whole number
- [ ] Manual: Battle with a high-level air monster, verify heal ≈ 5% of max HP (never near enemy sustain DPS)

## Risks/Considerations

- Air type's identity is sustained healing; at ~5% late game it remains useful but not free. If it feels weak, nudge `power` up but keep late-game well under the sustain wall (~half of enemy DPS).
- `diminish: 0.042` can be fine-tuned after playtests; the goal is to stay well under the sustain wall (~half of enemy DPS) at high levels.
