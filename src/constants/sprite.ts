import type { SpriteAnims } from 'kaplay'

export interface SpriteConfig {
  id: string
  file: string
  sliceX: number
  sliceY?: number
  sizeMultiplier?: number
  anims: SpriteAnims
}

// Dino spritesheet (single row, 24 frames)
const DINO_COLORS = ['red', 'blue', 'green', 'yellow'] as const

const dinoSprites = (color: (typeof DINO_COLORS)[number]): SpriteConfig[] => {
  const base = `sprites/Dino/Dino_${color[0].toUpperCase()}${color.slice(1)}.png`
  const id = `dino_${color}`
  return [
    {
      id,
      file: base,
      sliceX: 24,
      anims: {
        idle: { frames: [0, 1, 2, 1], loop: true },
        attack: { frames: [11, 12, 13, 17] },
        hurt: { from: 14, to: 16 },
        death: { from: 15, to: 15 },
      },
    },
  ]
}

// Humanoid monsters with a uniform 4-state layout (idle/attack/hurt/death)
const MONSTER_SETUPS = [
  'Dude_Monster',
  'Owlet_Monster',
  'Pink_Monster',
] as const

const monsterSprites = (
  setup: (typeof MONSTER_SETUPS)[number],
): SpriteConfig[] => {
  const id = setup.toLowerCase()
  const base = `sprites/${setup}`
  return [
    {
      id,
      file: `${base}/${setup}_Idle_4.png`,
      sliceX: 4,
      anims: { idle: { from: 0, to: 3, loop: true } },
    },
    {
      id: `${id}_attack`,
      file: `${base}/${setup}_Attack1_4.png`,
      sliceX: 4,
      anims: { attack: { from: 0, to: 3 } },
    },
    {
      id: `${id}_hurt`,
      file: `${base}/${setup}_Hurt_4.png`,
      sliceX: 4,
      anims: { hurt: { from: 0, to: 3 } },
    },
    {
      id: `${id}_death`,
      file: `${base}/${setup}_Death_8.png`,
      sliceX: 8,
      anims: { death: { from: 0, to: 7 } },
    },
  ]
}

// Plant monsters use the last row (sliceY 4) of their sprite sheet
const PLANT_COLORS = ['blue', 'purple', 'red'] as const

const plantSprites = (color: (typeof PLANT_COLORS)[number]): SpriteConfig[] => {
  const id = `plant_${color}`
  const base = `sprites/Plant_${color[0].toUpperCase()}${color.slice(1)}`
  const sizeMultiplier = 1.5
  return [
    {
      id,
      file: `${base}/Plant_Idle_full.png`,
      sliceX: 4,
      sliceY: 4,
      sizeMultiplier,
      anims: { idle: { from: 12, to: 15, loop: true } },
    },
    {
      id: `${id}_attack`,
      file: `${base}/Plant_Attack_full.png`,
      sliceX: 7,
      sliceY: 4,
      sizeMultiplier,
      anims: { attack: { from: 21, to: 27 } },
    },
    {
      id: `${id}_hurt`,
      file: `${base}/Plant_Hurt_full.png`,
      sliceX: 5,
      sliceY: 4,
      sizeMultiplier,
      anims: { hurt: { from: 15, to: 19 } },
    },
    {
      id: `${id}_death`,
      file: `${base}/Plant_Death_full.png`,
      sliceX: 10,
      sliceY: 4,
      sizeMultiplier,
      anims: { death: { from: 30, to: 39 } },
    },
  ]
}

// Slime monsters use the last row (sliceY 4) of their sprite sheet
const SLIME_COLORS = ['blue', 'fire', 'green'] as const

const slimeSprites = (color: (typeof SLIME_COLORS)[number]): SpriteConfig[] => {
  const id = `slime_${color}`
  const base = `sprites/Slime_${color[0].toUpperCase()}${color.slice(1)}`
  const attackFrames: Record<(typeof SLIME_COLORS)[number], number> = {
    blue: 11,
    fire: 9,
    green: 10,
  }

  // attack anim uses the last row (sliceY 4) of the attack sheet
  const sliceY = 4
  const attackRowStart = (sliceY - 1) * attackFrames[color]
  const sizeMultiplier = 2

  return [
    {
      id,
      file: `${base}/Slime_Idle_full.png`,
      sliceX: 6,
      sliceY,
      sizeMultiplier,
      anims: { idle: { from: 18, to: 23, loop: true } },
    },
    {
      id: `${id}_attack`,
      file: `${base}/Slime_Attack_full.png`,
      sliceX: attackFrames[color],
      sliceY,
      sizeMultiplier,
      anims: {
        attack: {
          from: attackRowStart,
          to: attackRowStart + attackFrames[color] - 1,
        },
      },
    },
    {
      id: `${id}_hurt`,
      file: `${base}/Slime_Hurt_full.png`,
      sliceX: 5,
      sliceY,
      sizeMultiplier,
      anims: { hurt: { from: 15, to: 19 } },
    },
    {
      id: `${id}_death`,
      file: `${base}/Slime_Death_full.png`,
      sliceX: 10,
      sliceY,
      sizeMultiplier,
      anims: { death: { from: 30, to: 39 } },
    },
  ]
}

export const SPRITES: SpriteConfig[] = [
  ...DINO_COLORS.flatMap(dinoSprites),
  ...MONSTER_SETUPS.flatMap(monsterSprites),
  ...PLANT_COLORS.flatMap(plantSprites),
  ...SLIME_COLORS.flatMap(slimeSprites),
]
