import { SCENE, STAT, TYPE } from '../constants'
import { addButton } from '../gameobjects'
import { runState } from '../state'

scene(SCENE.POST_BATTLE, () => {
  const { playerTeam, battleXpGains, battleCoinReward, defeatedEnemies } =
    runState

  add([
    text('Battle Complete!', { size: 28 }),
    pos(center().x, 80),
    anchor('center'),
    color(255, 220, 100),
  ])

  // coin reward
  const coinY = 140
  add([
    text(`+${String(battleCoinReward)} coins`, { size: 24 }),
    pos(center().x, coinY),
    anchor('center'),
    color(255, 220, 80),
  ])

  // participating monsters with XP gains
  let startY = 200
  battleXpGains.forEach((gainData, monsterId) => {
    const monster = playerTeam.find(({ id }) => id === monsterId)
    if (!monster) return

    const { xpGained, oldLevel } = gainData

    const rowY = startY

    // monster card
    add([
      rect(480, 80, { radius: 10 }),
      pos(center().x, rowY),
      anchor('center'),
      color(40, 40, 60),
    ])

    // sprite
    add([
      sprite(monster.spriteId, { height: STAT.MONSTER_ICON_HEIGHT }),
      pos(center().x - 200, rowY),
      anchor('center'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // name and level
    add([
      text(`${monster.name} Lv${String(monster.level)}`, { size: 20 }),
      pos(center().x - 140, rowY - 20),
      anchor('left'),
      color(255, 255, 255),
    ])

    // XP text
    add([
      text(`+${String(xpGained)} XP`, { size: 18 }),
      pos(center().x - 140, rowY + 5),
      anchor('left'),
      color(180, 180, 180),
    ])

    // XP bar background
    const xpBarWidth = 200
    const xpBarHeight = 12
    add([
      rect(xpBarWidth, xpBarHeight, { radius: 4 }),
      pos(center().x + 40, rowY + 10),
      anchor('left'),
      color(60, 60, 80),
    ])

    // XP bar fill (animated)
    const oldXp = monster.xp - xpGained
    const oldXpRatio = oldXp / monster.xpToNextLevel
    const newXpRatio = monster.xp / monster.xpToNextLevel

    const xpFill = add([
      rect(0, xpBarHeight, { radius: 4 }),
      pos(center().x + 40, rowY + 10),
      anchor('left'),
      color(100, 200, 100),
    ])

    let animProgress = 0
    xpFill.onUpdate(() => {
      if (animProgress < 1) {
        animProgress += dt() * 2
        if (animProgress > 1) animProgress = 1
        const currentRatio =
          oldXpRatio + (newXpRatio - oldXpRatio) * animProgress
        xpFill.width = xpBarWidth * Math.min(1, currentRatio)
      }
    })

    // XP text
    add([
      text(`+${String(xpGained)} XP`, { size: 18 }),
      pos(center().x - 140, rowY + 5),
      anchor('left'),
      color(180, 180, 180),
    ])

    // level up notification
    const leveledUp = monster.level > oldLevel
    if (leveledUp) {
      add([
        text('LEVEL UP!', { size: 20 }),
        pos(center().x + 180, rowY - 10),
        anchor('center'),
        color(255, 220, 80),
      ])
    }

    startY += 100
  })

  // continue button
  const continueButton = addButton({
    x: center().x,
    y: height() - 80,
    width: 160,
    height: 56,
    color: [60, 180, 80],
    label: 'Continue',
    labelSize: 20,
    isFixed: true,
  })

  continueButton.onClick(() => {
    // clear battle rewards
    runState.battleXpGains = new Map()
    runState.battleCoinReward = 0

    // go to tame if defeated enemies, otherwise wave start
    if (defeatedEnemies.length > 0) {
      go(SCENE.TAME)
    } else {
      go(SCENE.WAVE_START)
    }
  })
})
