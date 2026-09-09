# Replace Sprites with Spritesheets

Replace individual sprite loading with animated spritesheets from public/spritesheets/, update TYPE_SPRITES mapping to match available assets (10 monster sets) with revised type assignments, configure animations using Kaplay's sliceX/sliceY system, and flip enemy sprites horizontally to face left. (Updated 2026-09-09 to reflect the implemented animation system.)

## Summary

Replace the current individual sprite system (public/sprites/) with animated spritesheets (public/spritesheets/), reduce the TYPE_SPRITES mapping to match available spritesheet assets with revised type assignments, and load all animation frames centrally from a spritesheet config. Two animation architectures are used: dinosaurs hold all four anims (idle/attack/hurt/death) on a single sprite ID, while humanoid/plant/slime monsters use a separate sprite ID per state. The battle scene flips enemy sprites horizontally to face left and triggers attack/hurt/death animations through a shared sprite-state helper.

## Current State

- **Individual sprites**: 25 sprite IDs in public/sprites/
- **Spritesheets available**: 10 monster sets with animation frames
  - Dino (4 color variants: Blue, Green, Red, Yellow) - 24 frames in a 24x1 grid; one sprite ID per color holding idle/attack/hurt/death anims
  - Dude_Monster, Owlet_Monster, Pink_Monster - separate horizontal sheets per state (Idle_4, Attack1_4, Hurt_4, Death_8)
  - Plant_Blue, Plant_Purple, Plant_Red - frame grids with idle/attack (4x4), hurt (5x4), death (10x4), use last row only
  - Slime_Blue, Slime_Fire, Slime_Green - frame grids with idle (6x4), attack (11/9/10 x4), hurt (5x4), death (10x4), use last row only
- **Battle scene**: Spawns player and enemy sprites with `flipX` on the sprite component; triggers state animations via a shared `setSpriteState` helper

## Implementation Steps

### 1. Update TYPE_SPRITES mapping in src/constants/type.ts

Reduce sprite IDs to match available spritesheets with revised type assignments:

```typescript
export const TYPE_SPRITES: Record<MonsterType, string[]> = {
  fire: ['dino_red', 'slime_fire'],
  water: ['dino_blue', 'dude_monster', 'slime_blue'],
  plant: ['plant_blue', 'plant_purple', 'plant_red'],
  electric: ['dino_yellow'],
  earth: ['dino_green', 'slime_green'],
  air: ['owlet_monster', 'pink_monster'],
}
```

### 2. Define sprite configs in src/constants/spritesheet.ts

Central `SpriteConfig` (`id`, `file`, `sliceX`, `sliceY`, `anims`) array `SPRITESHEETS` drives both preload and the animation helpers.

**Dinosaurs** - one id per color (`dino_red`, etc.), all anims on the base sheet (24x1 grid):

```typescript
{
  id: 'dino_red',
  file: 'spritesheets/Dino/Dino_Red.png',
  sliceX: 24,
  anims: {
    idle: { frames: [0, 1, 2, 1], loop: true },
    attack: { frames: [11, 12, 13, 17] },
    hurt: { from: 14, to: 16 },
    death: { from: 15, to: 15 },
  },
}
```

**Humanoids** - separate id + file per state; death sheet is 8-wide, others 4-wide:

```typescript
// id: 'dude_monster' (or owlet_monster, pink_monster)
{
  id, file: 'spritesheets/Dude_Monster/Dude_Monster_Idle_4.png',
  sliceX: 4, anims: { idle: { from: 0, to: 3, loop: true } },
},
{ id: `${id}_attack`, file: '..._Attack1_4.png', sliceX: 4, anims: { attack: { from: 0, to: 3 } } },
{ id: `${id}_hurt`, file: '..._Hurt_4.png', sliceX: 4, anims: { hurt: { from: 0, to: 3 } } },
{ id: `${id}_death`, file: '..._Death_8.png', sliceX: 8, anims: { death: { from: 0, to: 7 } } },
```

**Plants / Slimes** - last row of a sliceY 4 grid. Row-major frame numbering, so the last row is `(sliceY - 1) * sliceX` .. `sliceX * sliceY - 1`. Example (plant):

```typescript
{
  id: 'plant_blue', file: 'spritesheets/Plant_Blue/Idle/Plant_Idle_full.png',
  sliceX: 4, sliceY: 4, anims: { idle: { from: 12, to: 15, loop: true } },
},
{ id: 'plant_blue_attack',  file: '..._Attack/Plant_Attack_full.png',  sliceX: 7,  sliceY: 4, anims: { attack: { from: 21, to: 27 } } },
{ id: 'plant_blue_hurt',    file: '..._Hurt/Plant_Hurt_full.png',      sliceX: 5,  sliceY: 4, anims: { hurt: { from: 15, to: 19 } } },
{ id: 'plant_blue_death',   file: '..._Death/Plant_Death_full.png',    sliceX: 10, sliceY: 4, anims: { death: { from: 30, to: 39 } } },
```

Slimes are identical in shape; the attack sheet width is per-color (blue 11, fire 9, green 10), so the attack anim is computed as `{ from: (rows-1) * cols, to: rows * cols - 1 }` (blue 33-43, fire 27-35, green 30-39).

### 3. Update preload scene in src/scenes/preload.ts

Load every config in the `SPRITESHEETS` array:

```typescript
scene(SCENE.PRELOAD, () => {
  for (const config of SPRITESHEET.SPRITESHEETS) {
    loadSprite(config.id, config.file, {
      sliceX: config.sliceX,
      sliceY: config.sliceY,
      anims: config.anims,
    })
  }
  go(applyQuerystringOverrides())
})
```

### 4. Update battle scene in src/scenes/battle.ts

Add a `flipX` parameter to `spawnSprite` (set via the sprite component's `flipX`, not negative scale), store the current state in a WeakMap, and start with the idle animation:

```typescript
const monsterSprite = add([
  sprite(spriteId, { height: STAT.MONSTER_HEIGHT, animSpeed: STAT.ANIM_SPEED }),
  pos(x, y),
  anchor('center'),
  scale(1),
  color(WHITE),
  opacity(1),
])
monsterSprite.flipX = flipX
monsterSprite.play('idle')
markSpriteIdle(monsterSprite)
```

Enemies are spawned with `flipX: true`; players with `flipX: false`. `animSpeed: STAT.ANIM_SPEED` (0.5, i.e. ~5 fps at Kaplay's 10 fps default) is applied to every spawned sprite.

### 5. Add animation helpers in src/utils/spriteAnim.ts

State switching is centralized in a shared helper so anims revert to idle on completion (guarded so an interrupted anim can't revert a sprite that has moved on to a newer state):

- `getStateSpriteId(baseId, state)` - returns the base id when it already contains the state's anim (dinos), else `` `${baseId}_${state}` `` (humanoids/plants/slimes)
- `markSpriteIdle(sprite)` / `setSpriteState(sprite, monster, state)` - register/swap the sprite and play the state anim; attack/hurt return to idle via `onEnd`, death plays one-shot
- `playDeathAnimation(sprite)` - returns a `Promise<void>` that resolves when the death anim actually ends (then destroys the sprite), so callers can await it
- `shakeSprite(sprite, intensity)` - decaying 0.3s positional shake

Battle wiring: `executeMove` plays 'attack' on the attacker; `dealDamage` plays 'hurt' on a surviving defender and 'death' on a defeated one. The wave/game-over transition awaits all `pendingDeathAnims` before clearing sprites and calling `go()` (no hardcoded delay).

Supporting changes:

- `src/constants/stat.ts` - added `ANIM_SPEED = 0.5`
- `src/types/battle.ts` - added `MonsterState` and `BattleSprite` types

## Files to Modify

- `src/constants/type.ts` - TYPE_SPRITES mapping with new sprite IDs and revised type assignments
- `src/constants/spritesheet.ts` - SpriteConfig type + SPRITESHEETS config array (source of truth for loading and state-switching)
- `src/constants/stat.ts` - ANIM_SPEED constant
- `src/scenes/preload.ts` - load all spritesheet configs via loop
- `src/scenes/battle.ts` - flipX on enemy sprites + attack/hurt/death animation triggers
- `src/utils/spriteAnim.ts` - new sprite-state/animation helpers
- `src/types/battle.ts` - MonsterState, BattleSprite types

## Verification

- [ ] Run `npm run lint:tsc` to check TypeScript errors
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test the game to ensure sprites load and display correctly
- [ ] Verify idle animations play automatically on spawn for all monster families
- [ ] Verify Dino idle animation uses frames 0, 1, 2, 1
- [ ] Verify Dino attack animation uses frames 11, 12, 13, 17
- [ ] Verify Dino hurt animation uses frames 14-16
- [ ] Verify Dino death animation uses `{ from: 15, to: 15 }`
- [ ] Verify Plant Attack uses 7x4 grid (last row frames 21-27)
- [ ] Verify Slime_Blue Attack uses 11x4 grid (last row frames 33-43)
- [ ] Verify Slime_Fire Attack uses 9x4 grid (last row frames 27-35)
- [ ] Verify Slime_Green Attack uses 10x4 grid (last row frames 30-39)
- [ ] Verify all hurt and death animations load correctly and revert via onEnd
- [ ] Verify non-artifact frame indices (Kaplay frames are row-major; unused-looking rows are valid cells)
- [ ] Verify soldier death anims (humanoid 8 frames, plant/slime 10 frames) fully play before the battle → post-battle / game-over transition
- [ ] Verify type assignments match the new mapping (dude_monster water, owlet_monster air, slime_blue water, slime_green earth, slime_fire fire, dino_yellow electric, pink_monster air)
- [ ] Verify enemy sprites are flipped horizontally to face left toward the player

## Risks/Considerations

- **Frame index calculation**: Kaplay frames are row-major (`index = row * sliceX + col`). Last-row anims must use `(sliceY-1)*sliceX` as `from`. The original spec's attack frames (e.g. slime_blue 40-43) were out of range of the sheet and caused a runtime `Frame not found` crash; all grids are now last-row-correct.
- **Player-side deaths**: helps the player death motion read; note the humanoid/plant/slime death anims are ~1.6-2s long, so the scene transition is gated on the death anim rather than a fixed timer.
- **Number-type anims**: e.g. `death: 16` never fire `onEnd`/`onAnimEnd` in Kaplay; always use object form `{ from, to }` when completion matters.
- **Backward compatibility**: save files may reference old sprite IDs - may need to clear save data or add migration logic
- **Performance**: Loading all animation frames may increase initial load time, but Kaplay handles this efficiently
- **Sprite flip**: Enemy sprites are flipped via `flipX` (preserves child cooldown bars); the flip is re-applied whenever the sprite state is swapped
