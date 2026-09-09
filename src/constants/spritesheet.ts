import type { SpriteAnims } from 'kaplay'

export interface SpriteConfig {
  id: string
  file: string
  sliceX: number
  sliceY?: number
  anims: SpriteAnims
}

// Dino spritesheet (single row, 24 frames)
const DINO_COLORS = ['red', 'blue', 'green', 'yellow'] as const

const dinoSprites = (color: (typeof DINO_COLORS)[number]): SpriteConfig[] => {
  const base = `spritesheets/Dino/Dino_${color[0].toUpperCase()}${color.slice(1)}.png`
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
  const base = `spritesheets/${setup}`
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
  const base = `spritesheets/Plant_${color[0].toUpperCase()}${color.slice(1)}`
  return [
    {
      id,
      file: `${base}/Idle/Plant_Idle_full.png`,
      sliceX: 4,
      sliceY: 4,
      anims: { idle: { from: 12, to: 15, loop: true } },
    },
    {
      id: `${id}_attack`,
      file: `${base}/Attack/Plant_Attack_full.png`,
      sliceX: 7,
      sliceY: 4,
      anims: { attack: { from: 21, to: 27 } },
    },
    {
      id: `${id}_hurt`,
      file: `${base}/Hurt/Plant_Hurt_full.png`,
      sliceX: 5,
      sliceY: 4,
      anims: { hurt: { from: 15, to: 19 } },
    },
    {
      id: `${id}_death`,
      file: `${base}/Death/Plant_Death_full.png`,
      sliceX: 10,
      sliceY: 4,
      anims: { death: { from: 30, to: 39 } },
    },
  ]
}

// Slime monsters use the last row (sliceY 4) of their sprite sheet
const SLIME_COLORS = ['blue', 'fire', 'green'] as const

const slimeSprites = (color: (typeof SLIME_COLORS)[number]): SpriteConfig[] => {
  const id = `slime_${color}`
  const base = `spritesheets/Slime_${color[0].toUpperCase()}${color.slice(1)}`
  const attackFrames: Record<(typeof SLIME_COLORS)[number], number> = {
    blue: 11,
    fire: 9,
    green: 10,
  }
  const attackEnd = attackFrames[color] * 4 - 1
  return [
    {
      id,
      file: `${base}/Idle/Slime_Idle_full.png`,
      sliceX: 6,
      sliceY: 4,
      anims: { idle: { from: 18, to: 23, loop: true } },
    },
    {
      id: `${id}_attack`,
      file: `${base}/Attack/Slime_Attack_full.png`,
      sliceX: attackFrames[color],
      sliceY: 4,
      anims: { attack: { from: attackEnd * 4, to: attackEnd * 5 - 1 } },
    },
    {
      id: `${id}_hurt`,
      file: `${base}/Hurt/Slime_Hurt_full.png`,
      sliceX: 5,
      sliceY: 4,
      anims: { hurt: { from: 12, to: 16 } },
    },
    {
      id: `${id}_death`,
      file: `${base}/Death/Slime_Death_full.png`,
      sliceX: 10,
      sliceY: 4,
      anims: { death: { from: 30, to: 39 } },
    },
  ]
}

export const SPRITESHEETS: SpriteConfig[] = [
  ...DINO_COLORS.flatMap(dinoSprites),
  ...MONSTER_SETUPS.flatMap(monsterSprites),
  ...PLANT_COLORS.flatMap(plantSprites),
  ...SLIME_COLORS.flatMap(slimeSprites),
]
