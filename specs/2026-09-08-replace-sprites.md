# Replace Sprites with Spritesheets

Replace individual sprite loading with animated spritesheets from public/spritesheets/, update TYPE_SPRITES mapping to match available assets (10 monster sets) with revised type assignments, configure idle animations as the main sprite IDs using Kaplay's sliceX/sliceY system, and flip enemy sprites horizontally to face left.

## Summary

Replace the current individual sprite system (public/sprites/) with animated spritesheets (public/spritesheets/), reduce the TYPE_SPRITES mapping to match available spritesheet assets with revised type assignments, and update the preload scene to load animation frames using Kaplay's sprite animation system. Idle animations will be loaded as the main sprite IDs for automatic playback, with attack, hurt, and death animations loaded separately for manual triggering. Enemy sprites will be flipped horizontally to face left toward the player.

## Current State

- **Individual sprites**: 25 sprite IDs in public/sprites/
- **Spritesheets available**: 10 monster sets with animation frames
  - Dino (4 color variants: Blue, Green, Red, Yellow) - 576x24 spritesheets, 24 frames (24x1 grid)
  - Dude_Monster, Owlet_Monster, Pink_Monster - horizontal spritesheets with idle, attack, hurt, death animations
  - Plant_Blue, Plant_Purple, Plant_Red - frame grids with idle/attack (4x4), hurt (5x4), death (10x4), use last row only
  - Slime_Blue, Slime_Fire, Slime_Green - frame grids with idle/attack (6x4), hurt (4x4), death (10x4), use last row only
- **Battle scene**: Currently spawns both player and enemy sprites with `scale(1)`, no horizontal flip

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

### 2. Update preload scene in src/scenes/preload.ts

Replace individual sprite loading with spritesheet loading. Load idle animations as the main sprite IDs:

```typescript
// Load Dino with animations (576x24, 24 frames in 24x1 grid)
for (const [color, Color] of [
  ['red', 'Red'],
  ['blue', 'Blue'],
  ['green', 'Green'],
  ['yellow', 'Yellow'],
]) {
  const id = `dino_${color}`
  loadSprite(id, `spritesheets/Dino/Dino_${Color}.png`, {
    sliceX: 24,
    anims: {
      idle: { frames: [1, 2, 3, 2], loop: true }, // Frames 1, 2, 3, 2 for idle
    },
  })
  loadSprite(`${id}_attack`, `spritesheets/Dino/Dino_${Color}.png`, {
    sliceX: 24,
    anims: {
      attack: { frames: [11, 12, 18] }, // Frames 11, 12, 18 for attack
    },
  })
  loadSprite(`${id}_hurt`, `spritesheets/Dino/Dino_${Color}.png`, {
    sliceX: 24,
    anims: {
      hurt: { from: 15, to: 17 }, // Frames 15-17 for hurt
    },
  })
  loadSprite(`${id}_death`, `spritesheets/Dino/Dino_${Color}.png`, {
    sliceX: 24,
    anims: {
      death: 16, // Frame 16 for death
    },
  })
}

// Load Dude_Monster with idle animation as main sprite
loadSprite(
  'dude_monster',
  'spritesheets/Dude_Monster/Dude_Monster_Idle_4.png',
  {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true } },
  },
)
loadSprite(
  'dude_monster_attack',
  'spritesheets/Dude_Monster/Dude_Monster_Attack1_4.png',
  {
    sliceX: 4,
    anims: { attack: { from: 0, to: 3 } },
  },
)
loadSprite(
  'dude_monster_hurt',
  'spritesheets/Dude_Monster/Dude_Monster_Hurt_4.png',
  {
    sliceX: 4,
    anims: { hurt: { from: 0, to: 3 } },
  },
)
loadSprite(
  'dude_monster_death',
  'spritesheets/Dude_Monster/Dude_Monster_Death_8.png',
  {
    sliceX: 8,
    anims: { death: { from: 0, to: 7 } },
  },
)

// Load Owlet_Monster with idle animation as main sprite
loadSprite(
  'owlet_monster',
  'spritesheets/Owlet_Monster/Owlet_Monster_Idle_4.png',
  {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true } },
  },
)
loadSprite(
  'owlet_monster_attack',
  'spritesheets/Owlet_Monster/Owlet_Monster_Attack1_4.png',
  {
    sliceX: 4,
    anims: { attack: { from: 0, to: 3 } },
  },
)
loadSprite(
  'owlet_monster_hurt',
  'spritesheets/Owlet_Monster/Owlet_Monster_Hurt_4.png',
  {
    sliceX: 4,
    anims: { hurt: { from: 0, to: 3 } },
  },
)
loadSprite(
  'owlet_monster_death',
  'spritesheets/Owlet_Monster/Owlet_Monster_Death_8.png',
  {
    sliceX: 8,
    anims: { death: { from: 0, to: 7 } },
  },
)

// Load Pink_Monster with idle animation as main sprite
loadSprite(
  'pink_monster',
  'spritesheets/Pink_Monster/Pink_Monster_Idle_4.png',
  {
    sliceX: 4,
    anims: { idle: { from: 0, to: 3, loop: true } },
  },
)
loadSprite(
  'pink_monster_attack',
  'spritesheets/Pink_Monster/Pink_Monster_Attack1_4.png',
  {
    sliceX: 4,
    anims: { attack: { from: 0, to: 3 } },
  },
)
loadSprite(
  'pink_monster_hurt',
  'spritesheets/Pink_Monster/Pink_Monster_Hurt_4.png',
  {
    sliceX: 4,
    anims: { hurt: { from: 0, to: 3 } },
  },
)
loadSprite(
  'pink_monster_death',
  'spritesheets/Pink_Monster/Pink_Monster_Death_8.png',
  {
    sliceX: 8,
    anims: { death: { from: 0, to: 7 } },
  },
)

// Load Plant monsters (4x4 for Idle, 7x4 for Attack, 5x4 for Hurt, 10x4 for Death, use last row)
for (const [color, Color] of [
  ['blue', 'Blue'],
  ['purple', 'Purple'],
  ['red', 'Red'],
]) {
  const id = `plant_${color}`
  loadSprite(id, `spritesheets/Plant_${Color}/Idle/Plant2_Idle_full.png`, {
    sliceX: 4,
    sliceY: 4,
    anims: { idle: { from: 12, to: 15, loop: true } }, // Last row (frames 12-15)
  })
  loadSprite(
    `${id}_attack`,
    `spritesheets/Plant_${Color}/Attack/Plant2_Attack_full.png`,
    {
      sliceX: 7,
      sliceY: 4,
      anims: { attack: { from: 24, to: 27 } }, // Last row (frames 24-27)
    },
  )
  loadSprite(
    `${id}_hurt`,
    `spritesheets/Plant_${Color}/Hurt/Plant2_Hurt_full.png`,
    {
      sliceX: 5,
      sliceY: 4,
      anims: { hurt: { from: 16, to: 19 } }, // Last row (frames 16-19)
    },
  )
  loadSprite(
    `${id}_death`,
    `spritesheets/Plant_${Color}/Death/Plant2_Death_full.png`,
    {
      sliceX: 10,
      sliceY: 4,
      anims: { death: { from: 36, to: 39 } }, // Last row (frames 36-39)
    },
  )
}

// Load Slime monsters (6x4 for Idle, variable for Attack, 4x4 for Hurt, 10x4 for Death, use last row)
loadSprite('slime_blue', 'spritesheets/Slime_Blue/Idle/Slime1_Idle_full.png', {
  sliceX: 6,
  sliceY: 4,
  anims: { idle: { from: 18, to: 23, loop: true } }, // Last row (frames 18-23)
})
loadSprite(
  'slime_blue_attack',
  'spritesheets/Slime_Blue/Attack/Slime1_Attack_full.png',
  {
    sliceX: 11,
    sliceY: 4,
    anims: { attack: { from: 40, to: 43 } }, // Last row (frames 40-43)
  },
)
loadSprite(
  'slime_blue_hurt',
  'spritesheets/Slime_Blue/Hurt/Slime1_Hurt_full.png',
  {
    sliceX: 4,
    sliceY: 4,
    anims: { hurt: { from: 12, to: 15 } }, // Last row (frames 12-15)
  },
)
loadSprite(
  'slime_blue_death',
  'spritesheets/Slime_Blue/Death/Slime1_Death_full.png',
  {
    sliceX: 10,
    sliceY: 4,
    anims: { death: { from: 36, to: 39 } }, // Last row (frames 36-39)
  },
)

loadSprite('slime_fire', 'spritesheets/Slime_Fire/Idle/Slime1_Idle_full.png', {
  sliceX: 6,
  sliceY: 4,
  anims: { idle: { from: 18, to: 23, loop: true } }, // Last row (frames 18-23)
})
loadSprite(
  'slime_fire_attack',
  'spritesheets/Slime_Fire/Attack/Slime1_Attack_full.png',
  {
    sliceX: 9,
    sliceY: 4,
    anims: { attack: { from: 32, to: 35 } }, // Last row (frames 32-35)
  },
)
loadSprite(
  'slime_fire_hurt',
  'spritesheets/Slime_Fire/Hurt/Slime1_Hurt_full.png',
  {
    sliceX: 4,
    sliceY: 4,
    anims: { hurt: { from: 12, to: 15 } }, // Last row (frames 12-15)
  },
)
loadSprite(
  'slime_fire_death',
  'spritesheets/Slime_Fire/Death/Slime1_Death_full.png',
  {
    sliceX: 10,
    sliceY: 4,
    anims: { death: { from: 36, to: 39 } }, // Last row (frames 36-39)
  },
)

loadSprite(
  'slime_green',
  'spritesheets/Slime_Green/Idle/Slime1_Idle_full.png',
  {
    sliceX: 6,
    sliceY: 4,
    anims: { idle: { from: 18, to: 23, loop: true } }, // Last row (frames 18-23)
  },
)
loadSprite(
  'slime_green_attack',
  'spritesheets/Slime_Green/Attack/Slime1_Attack_full.png',
  {
    sliceX: 10,
    sliceY: 4,
    anims: { attack: { from: 36, to: 39 } }, // Last row (frames 36-39)
  },
)
loadSprite(
  'slime_green_hurt',
  'spritesheets/Slime_Green/Hurt/Slime1_Hurt_full.png',
  {
    sliceX: 4,
    sliceY: 4,
    anims: { hurt: { from: 12, to: 15 } }, // Last row (frames 12-15)
  },
)
loadSprite(
  'slime_green_death',
  'spritesheets/Slime_Green/Death/Slime1_Death_full.png',
  {
    sliceX: 10,
    sliceY: 4,
    anims: { death: { from: 36, to: 39 } }, // Last row (frames 36-39)
  },
)
```

### 3. Update battle scene in src/scenes/battle.ts

Add horizontal flip to enemy sprites so they face left toward the player:

```typescript
// In spawnSprite function, add a flip parameter
function spawnSprite(
  spriteId: string,
  x: number,
  y: number,
  typeColor: string,
  monster: Monster,
  flipX: boolean = false, // Add flip parameter
) {
  const monsterSprite = add([
    sprite(spriteId, { height: STAT.MONSTER_HEIGHT }),
    pos(x, y),
    anchor('center'),
    scale(flipX ? -1 : 1), // Flip horizontally if flipX is true
    color(rgb(typeColor)),
    opacity(1),
  ])
  // ... rest of the function remains the same
  return monsterSprite
}

// Update spawnEnemySprite to pass flipX: true
function spawnEnemySprite() {
  const enemy = enemyTeam[activeEnemyIdx]
  if (enemySprite) destroy(enemySprite)
  enemySprite = spawnSprite(
    enemy.spriteId,
    STAT.ENEMY_POS.x,
    STAT.ENEMY_POS.y,
    TYPE.TYPE_COLORS[enemy.type],
    enemy,
    true, // Flip enemy sprite horizontally
  )
}
```

### 4. Optional: Add animation triggers

Add logic in battle.ts to trigger animations:

- Attack: Switch to attack sprite, play animation, return to idle
- Hurt: Switch to hurt sprite, play animation, return to idle
- Death: Switch to death sprite, play animation (one-shot)

## Files to Modify

- `src/constants/type.ts` - Update TYPE_SPRITES mapping with new sprite IDs and revised type assignments
- `src/scenes/preload.ts` - Replace loadSprite with spritesheet loading and animation configuration
- `src/scenes/battle.ts` - Add horizontal flip to enemy sprites

## Verification

- [ ] Run `npm run lint:tsc` to check TypeScript errors
- [ ] Run `npm run build` to verify build succeeds
- [ ] Test the game to ensure sprites load and display correctly
- [ ] Verify idle animations play automatically for animated monsters
- [ ] Verify Dino idle animation uses frames 1, 2, 3, 2
- [ ] Verify Dino attack animation uses frames 11, 12, 18
- [ ] Verify Dino hurt animation uses frames 15-17
- [ ] Verify Dino death animation uses frame 16
- [ ] Verify Plant Attack uses 7x4 grid (last row frames 24-27)
- [ ] Verify Slime_Blue Attack uses 11x4 grid (last row frames 40-43)
- [ ] Verify Slime_Fire Attack uses 9x4 grid (last row frames 32-35)
- [ ] Verify Slime_Green Attack uses 10x4 grid (last row frames 36-39)
- [ ] Verify all hurt and death animations load correctly
- [ ] Verify type assignments match the new mapping (dude_monster water, owlet_monster air, slime_blue water, slime_green earth, slime_fire fire, dino_yellow electric, pink_monster air)
- [ ] Verify enemy sprites are flipped horizontally to face left toward the player

## Risks/Considerations

- **Frame index calculation**: Need to verify frame indices are correct for all grid layouts, especially the varying attack grid sizes
- **Dude_Monster attack animations**: Has multiple attack animations (Attack1_4, Attack2_6) - loading Attack1_4 as default
- **Backward compatibility**: Save files may reference old sprite IDs - may need to clear save data or add migration logic
- **Performance**: Loading all animation frames may increase initial load time, but Kaplay handles this efficiently
- **Animation triggers**: Attack/hurt/death animations are loaded but not automatically triggered - can be implemented later
- **Sprite flip**: Enemy sprites will be flipped horizontally, need to ensure this doesn't affect other visual elements like cooldown bars
