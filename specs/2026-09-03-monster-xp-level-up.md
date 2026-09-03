# Monster XP and Level Up System

Add XP earning from battles, exponential XP curve, level-up stat increases, and a shop item for instant level ups.

## Summary

Monsters gain XP from participating in battles with shared XP distribution; XP required scales exponentially; level-ups auto-increase stats, full heal, and can learn new moves; shop sells "Level Up" item for instant level gains; post-battle summary shows animated XP gains and coin rewards.

## Implementation

### 0. Rename arena to battle

- **File:** `src/constants/scene.ts`
- Rename `ARENA` to `BATTLE`

- **File:** `src/scenes/arena.ts` → `src/scenes/battle.ts`
- Rename file
- Update all internal references

- **File:** `src/scenes/index.ts`
- Update import from `arena` to `battle`

- **File:** All files referencing `SCENE.ARENA`
- Update to `SCENE.BATTLE` (grep and replace)

### 1. Add XP to Monster type

- **File:** `src/types/monster.ts`
- Add `xp: number` and `xpToNextLevel: number` to `Monster` interface
- Initialize to 0 and XP required for level 1 in `createMonster`

### 2. Add XP curve constants

- **File:** `src/constants/stat.ts`
- Add `XP_BASE` (e.g., 100) — XP needed for level 1→2
- Add `XP_MULTIPLIER` (e.g., 1.5) — exponential growth factor
- Add helper function `xpForLevel(level: number)` to calculate XP required

### 3. Add XP earning in battle

- **File:** `src/scenes/arena.ts`
- Track which player monsters participated in battle (dealt damage or took damage)
- On enemy defeat: calculate XP = `enemy.level * XP_BASE`
- Distribute XP equally among participating monsters
- Call `gainXp(monster, xpAmount)` for each participant
- Calculate coin reward = `defeatedEnemies.length * 10`
- Transition to new post-battle summary scene instead of tame

### 4. Implement XP gain and level up

- **File:** `src/utils/monster.ts`
- Add `gainXp(monster: Monster, amount: number)` function:
  - Add XP to monster
  - While `xp >= xpToNextLevel`: level up
  - On level up: increment level, recalculate stats from `STAT_GROWTH`, full heal, check for new moves
  - Update `xpToNextLevel` using `xpForLevel(level + 1)`

### 5. Add move learning at specific levels

- **File:** `src/constants/stat.ts`
- Add `MOVE_LEARNING_LEVELS` mapping (e.g., `{ 3: MOVE.LEARNABLE_MOVES, 5: MOVE.LEARNABLE_MOVES }`)
- In level up: if level in mapping, add random move from that pool (if not already known)

### 6. Create post-battle summary scene

- **File:** `src/scenes/postBattle.ts` (new)
- Show participating monsters with:
  - Name, level, type
  - XP bar (animated fill from old XP to new XP)
  - Level-up notification if leveled up
- Show coin reward (animated counter)
- "Continue" button to go to tame (if defeated enemies) or wave start
- Import and register in `src/scenes/index.ts`

### 7. Add Level Up item to shop

- **File:** `src/scenes/shop.ts`
- Add item to `SHOP_ITEMS`:
  ```ts
  {
    id: 'level_up',
    kind: 'level_up',
    label: 'Level Up',
    description: '+1 Level',
    price: 50, // pricier than stat boosts
  }
  ```
- Handle `level_up` in `applyPurchase`: call `gainXp(monster, monster.xpToNextLevel)`

### 7. Update runState reset

- **File:** `src/state/runState.ts`
- Reset `xp` and `xpToNextLevel` in `resetRunState()` for all monsters

### 8. Update Monster display

- **File:** `src/gameobjects/hud.ts`
- Add XP bar below HP bar (optional, or just show level)
- Show level-up animation/notification when monster levels up in battle

## Behavior

- **XP earning:** Participating monsters share XP from defeated enemies
- **XP curve:** 100 XP for level 2, 150 for level 3, 225 for level 4, etc. (×1.5 each level)
- **Level up:** Stats increase, full heal, may learn new move
- **Shop item:** Instant +1 level, no cap on usage

## Verify

- `npm run lint:tsc` — type check passes
- `npm run lint:fix` — lint passes
- `npm start` — playtest: monsters gain XP after battle, level up with stat increases, shop item grants instant level up
