import { MOVE, SCENE, STAT, TYPE } from '../constants'
import {
  addBattleBackground,
  addHud,
  addTouchControls,
  updateHud,
} from '../gameobjects'
import { runState } from '../state'
import type { ItemDef, Monster } from '../types'
import { isTeamDefeated, spawnWave } from '../utils'

scene(SCENE.ARENA, () => {
  addBattleBackground()

  const { playerTeam, wave, activePlayerIndex, battleRoster } = runState
  const battleTeam = battleRoster.map((i) => playerTeam[i])
  const enemyTeam = spawnWave(wave)
  runState.defeatedEnemies = []

  let activePlayerIdx = activePlayerIndex
  let activeEnemyIdx = 0
  let swapCd = 0
  let battleOver = false

  const COOLDOWN_BAR_WIDTH = 60
  const COOLDOWN_BAR_HEIGHT = 4

  function spawnSprite(
    spriteId: string,
    x: number,
    y: number,
    typeColor: string,
    monster: Monster,
  ) {
    const monsterSprite = add([
      sprite(spriteId),
      pos(x, y),
      anchor('center'),
      scale(STAT.MONSTER_SCALE),
      color(rgb(typeColor)),
      opacity(1),
    ])

    // cooldown bar track
    monsterSprite.add([
      rect(COOLDOWN_BAR_WIDTH, COOLDOWN_BAR_HEIGHT, { radius: 2 }),
      pos(0, 40),
      anchor('center'),
      color(80, 80, 80),
    ])

    // cooldown bar fill
    const fill = monsterSprite.add([
      rect(0, COOLDOWN_BAR_HEIGHT, { radius: 2 }),
      pos(-COOLDOWN_BAR_WIDTH / 2, 40),
      anchor('left'),
      color(rgb(typeColor)),
    ])

    monsterSprite.onUpdate(() => {
      const ratio = 1 - monster.basicCooldown / MOVE.BASIC_ATTACK.cooldown
      fill.width = COOLDOWN_BAR_WIDTH * Math.max(0, Math.min(1, ratio))
    })

    return monsterSprite
  }

  type Sprite = ReturnType<typeof spawnSprite>

  // create visual sprites for battle team
  const playerSprites: (Sprite | null)[] = battleTeam.map((monster, i) => {
    if (i === activePlayerIdx) {
      return spawnSprite(
        monster.spriteId,
        STAT.PLAYER_POS.x,
        STAT.PLAYER_POS.y,
        TYPE.TYPE_COLORS[monster.type],
        monster,
      )
    }
    return null
  })

  // create enemy sprite
  let enemySprite: Sprite | null = null

  function spawnEnemySprite() {
    const enemy = enemyTeam[activeEnemyIdx]
    if (enemySprite) destroy(enemySprite)
    enemySprite = spawnSprite(
      enemy.spriteId,
      STAT.ENEMY_POS.x,
      STAT.ENEMY_POS.y,
      TYPE.TYPE_COLORS[enemy.type],
      enemy,
    )
  }

  spawnEnemySprite()

  const hud = addHud(battleTeam, activePlayerIdx, (teamIdx) => {
    if (itemsOverlay) return
    swapPlayerMonster(teamIdx)
  })
  const controls = addTouchControls()

  function getActivePlayer(): Monster | null {
    const monster = battleTeam[activePlayerIdx]
    return monster.isAlive ? monster : null
  }

  function getActiveEnemy(): Monster | null {
    const monster = enemyTeam[activeEnemyIdx]
    return monster.isAlive ? monster : null
  }

  function spawnHitParticles(
    origin: { x: number; y: number },
    typeMult: number,
  ): void {
    const count = typeMult > 1 ? 8 : 4
    for (let i = 0; i < count; i++) {
      add([
        rect(6, 6),
        pos(origin.x, origin.y),
        color(255, 220, 100),
        anchor('center'),
        lifespan(0.4),
        scale(1),
        move(rand(360), rand(80, 140)),
        opacity(1),
      ])
    }
  }

  function spawnDamageNumber(
    x: number,
    y: number,
    damage: number,
    isCrit: boolean,
    typeMult: number,
  ): void {
    const num = add([
      styledText(String(damage), {
        size: isCrit ? 28 : 20,
        fill: isCrit
          ? rgb(255, 80, 80)
          : typeMult > 1
            ? rgb(255, 220, 80)
            : WHITE,
        outline: { color: BLACK, width: 2 },
      }),
      pos(x, y),
      anchor('center'),
      fixed(),
      lifespan(0.8),
      opacity(1),
    ])

    num.onUpdate(() => {
      num.pos.y -= 60 * dt()
      num.opacity = Math.max(0, num.opacity - dt() * 1.25)
    })

    if (typeMult !== 1) {
      const effText = add([
        styledText(typeMult > 1 ? 'Super effective!' : 'Not effective', {
          size: 20,
          fill: typeMult > 1 ? rgb(255, 220, 80) : rgb(160, 160, 160),
          outline: { color: BLACK, width: 2 },
        }),
        pos(x, y + 24),
        anchor('center'),
        fixed(),
        lifespan(0.8),
        opacity(1),
      ])

      effText.onUpdate(() => {
        effText.pos.y -= 60 * dt()
        effText.opacity = Math.max(0, effText.opacity - dt() * 1.25)
      })
    }
  }

  function playDeathAnimation(s: Sprite): void {
    s.onUpdate(() => {
      s.opacity = Math.max(0, s.opacity - dt() * 2.5)
      s.scale = vec2(s.scale.x - dt() * 7.5)
    })
    wait(0.4, () => {
      destroy(s)
    })
  }

  function dealDamage(
    attacker: Monster,
    defender: Monster,
    power: number,
  ): void {
    const typeMult = TYPE.getTypeMultiplier(attacker.type, defender.type)
    const isBasic = power === MOVE.BASIC_ATTACK.power
    const isCrit = isBasic && Number(rand()) < STAT.CRIT_CHANCE
    const critMult = isCrit ? STAT.CRIT_MULTIPLIER : 1
    const baseDamage = attacker.baseStats.attack * power * critMult
    const defense = defender.baseStats.defense * (1 + defender.defenseBuff)
    const damage = Math.max(1, Math.round((baseDamage * typeMult) / defense))
    defender.currentHp = Math.max(0, defender.currentHp - damage)

    // screen shake on hit
    shake(typeMult > 1 ? 8 : 4)

    // hit flash + particles
    const playerSprite = playerSprites[activePlayerIdx]
    if (defender === getActivePlayer() && playerSprite) {
      playerSprite.color = WHITE
      wait(0.1, () => {
        playerSprite.color = rgb(TYPE.TYPE_COLORS[defender.type])
      })
      spawnHitParticles(playerSprite.pos, typeMult)
      spawnDamageNumber(
        playerSprite.pos.x,
        playerSprite.pos.y - 40,
        damage,
        isCrit,
        typeMult,
      )
    } else if (defender === getActiveEnemy() && enemySprite) {
      enemySprite.color = WHITE
      wait(0.1, () => {
        if (enemySprite) {
          enemySprite.color = rgb(TYPE.TYPE_COLORS[defender.type])
        }
      })
      spawnHitParticles(enemySprite.pos, typeMult)
      spawnDamageNumber(
        enemySprite.pos.x,
        enemySprite.pos.y - 40,
        damage,
        isCrit,
        typeMult,
      )
    }

    if (defender.currentHp <= 0) {
      defender.isAlive = false
      // track defeated enemies for catch/sell
      if (enemyTeam.includes(defender)) {
        runState.defeatedEnemies.push(defender)
      }
      // play death animation on the defender's sprite
      if (defender === getActivePlayer() && playerSprite) {
        playDeathAnimation(playerSprite)
        playerSprites[activePlayerIdx] = null
      } else if (defender === getActiveEnemy() && enemySprite) {
        playDeathAnimation(enemySprite)
        enemySprite = null
      }
    }
  }

  function executeMove(
    attacker: Monster,
    defender: Monster,
    isSpecial: boolean,
  ): void {
    if (isSpecial) {
      const special = MOVE.SPECIAL_MOVES[attacker.type]
      switch (special.kind) {
        case 'nuke':
        case 'debuff':
          dealDamage(attacker, defender, special.power)
          if (special.kind === 'debuff') {
            defender.speedDebuff = 3 // 3 seconds of slow
          }
          break
        case 'buff':
          attacker.defenseBuff = 3 // 3 seconds of defense buff
          break
        case 'heal':
          for (const monster of attacker === getActivePlayer()
            ? battleTeam
            : enemyTeam) {
            if (monster.isAlive) {
              monster.currentHp = Math.min(
                monster.maxHp,
                monster.currentHp + special.power,
              )
            }
          }
          break
      }
      attacker.specialCooldown = special.cooldown
    } else {
      dealDamage(attacker, defender, MOVE.BASIC_ATTACK.power)
      attacker.basicCooldown = MOVE.BASIC_ATTACK.cooldown
    }
  }

  function tryAutoAttack(attacker: Monster, defender: Monster): void {
    if (!attacker.isAlive || !defender.isAlive) return

    // reduce cooldowns
    const speedMult =
      1 + attacker.baseStats.speed / 50 - (attacker.speedDebuff > 0 ? 0.3 : 0)
    if (attacker.basicCooldown > 0) {
      attacker.basicCooldown = Math.max(
        0,
        attacker.basicCooldown - dt() * speedMult,
      )
    }
    if (attacker.specialCooldown > 0) {
      attacker.specialCooldown = Math.max(
        0,
        attacker.specialCooldown - dt() * speedMult,
      )
    }
    if (attacker.speedDebuff > 0) {
      attacker.speedDebuff = Math.max(0, attacker.speedDebuff - dt())
    }
    if (attacker.defenseBuff > 0) {
      attacker.defenseBuff = Math.max(0, attacker.defenseBuff - dt())
    }

    // special move takes priority if ready
    if (attacker.specialCooldown <= 0) {
      const special = MOVE.SPECIAL_MOVES[attacker.type]
      if (special.kind === 'heal') {
        const team = attacker === getActivePlayer() ? battleTeam : enemyTeam
        const needsHeal = team.some(
          (monster) => monster.isAlive && monster.currentHp < monster.maxHp,
        )
        if (needsHeal) {
          executeMove(attacker, defender, true)
        } else if (attacker.basicCooldown <= 0) {
          executeMove(attacker, defender, false)
        }
      } else {
        executeMove(attacker, defender, true)
      }
    } else if (attacker.basicCooldown <= 0) {
      executeMove(attacker, defender, false)
    }
  }

  function swapPlayerMonster(toIndex: number): void {
    if (toIndex < 0 || toIndex >= battleTeam.length) return
    if (!battleTeam[toIndex].isAlive) return
    if (toIndex === activePlayerIdx) return
    if (swapCd > 0) return

    // destroy old sprite
    const oldSprite = playerSprites[activePlayerIdx]
    if (oldSprite) {
      destroy(oldSprite)
      playerSprites[activePlayerIdx] = null
    }

    activePlayerIdx = toIndex
    const monster = battleTeam[activePlayerIdx]

    // create new sprite with entry animation
    const newSprite = spawnSprite(
      monster.spriteId,
      STAT.PLAYER_POS.x,
      STAT.PLAYER_POS.y - 50,
      TYPE.TYPE_COLORS[monster.type],
      monster,
    )
    playerSprites[activePlayerIdx] = newSprite

    // slide in animation
    newSprite.onUpdate(() => {
      if (newSprite.pos.y < STAT.PLAYER_POS.y) {
        newSprite.pos.y = Math.min(
          STAT.PLAYER_POS.y,
          newSprite.pos.y + 200 * dt(),
        )
      }
    })

    swapCd = STAT.SWAP_COOLDOWN
    hud.bench.refresh(activePlayerIdx)
  }

  function checkWaveEnd(): void {
    if (battleOver) return

    // check if all enemies defeated
    if (isTeamDefeated(enemyTeam)) {
      battleOver = true
      // wave clear coin bonus
      runState.coins += 10 + wave * 5
      wait(0.5, () => {
        hud.destroy()
        controls.destroy()
        if (enemySprite) destroy(enemySprite)
        for (const s of playerSprites) {
          if (s) destroy(s)
        }
        go(SCENE.TAME)
      })
      return
    }

    // check if all player monsters defeated
    if (isTeamDefeated(battleTeam)) {
      battleOver = true
      wait(0.5, () => {
        hud.destroy()
        controls.destroy()
        if (enemySprite) destroy(enemySprite)
        for (const s of playerSprites) {
          if (s) destroy(s)
        }
        go(SCENE.GAME_OVER)
      })
      return
    }

    // advance to next enemy if current is dead
    if (!enemyTeam[activeEnemyIdx]?.isAlive) {
      activeEnemyIdx++
      if (
        activeEnemyIdx < enemyTeam.length &&
        enemyTeam[activeEnemyIdx]?.isAlive
      ) {
        wait(0.4, () => {
          spawnEnemySprite()
        })
      }
    }

    // auto-swap if active player is dead
    if (!battleTeam[activePlayerIdx]?.isAlive) {
      const nextAlive = battleTeam.findIndex((monster) => monster.isAlive)
      if (nextAlive >= 0) {
        swapPlayerMonster(nextAlive)
        swapCd = 0 // free swap on death
      }
    }
  }

  // items button - opens inventory overlay
  let itemsOverlay: ReturnType<typeof createItemsOverlay> | null = null

  controls.itemsButton.onClick(() => {
    if (itemsOverlay) return
    if (runState.inventory.length === 0) return
    itemsOverlay = createItemsOverlay()
  })

  function createItemsOverlay() {
    const overlay = add([pos(0, 0), fixed(), z(100)])

    // dim background
    overlay.add([
      rect(width(), height()),
      pos(0, 0),
      color(0, 0, 0),
      opacity(0.7),
    ])

    // panel
    const panelWidth = 400
    const panelHeight = 400
    const panelX = (width() - panelWidth) / 2
    const panelY = (height() - panelHeight) / 2

    overlay.add([
      rect(panelWidth, panelHeight, { radius: 16 }),
      pos(panelX, panelY),
      color(30, 30, 50),
    ])

    overlay.add([
      text('Items', { size: 24 }),
      pos(width() / 2, panelY + 30),
      anchor('center'),
      color(255, 220, 100),
    ])

    // list items
    runState.inventory.forEach((item, i) => {
      const itemY = panelY + 70 + i * 60

      const itemButton = overlay.add([
        rect(panelWidth - 40, 50, { radius: 8 }),
        pos(panelX + 20, itemY),
        color(50, 50, 80),
        area(),
      ])

      overlay.add([
        text(item.label, { size: 20 }),
        pos(panelX + 40, itemY + 25),
        anchor('left'),
        color(WHITE),
      ])

      overlay.add([
        text(item.description, { size: 20 }),
        pos(panelX + 200, itemY + 25),
        anchor('left'),
        color(200, 200, 200),
      ])

      itemButton.onHover(() => {
        setCursor('pointer')
        itemButton.color = rgb(70, 70, 100)
      })

      itemButton.onHoverEnd(() => {
        setCursor('default')
        itemButton.color = rgb(50, 50, 80)
      })

      itemButton.onClick(() => {
        useItem(item, i)
        destroy(overlay)
        itemsOverlay = null
      })
    })

    // close button
    const closeButton = overlay.add([
      rect(100, 40, { radius: 8 }),
      pos(width() / 2, panelY + panelHeight - 30),
      anchor('center'),
      color(80, 80, 80),
      area(),
    ])

    overlay.add([
      text('Close', { size: 20 }),
      pos(width() / 2, panelY + panelHeight - 30),
      anchor('center'),
      color(WHITE),
    ])

    closeButton.onHover(() => {
      setCursor('pointer')
      closeButton.color = rgb(100, 100, 100)
    })

    closeButton.onHoverEnd(() => {
      setCursor('default')
      closeButton.color = rgb(80, 80, 80)
    })

    closeButton.onClick(() => {
      destroy(overlay)
      itemsOverlay = null
    })

    return overlay
  }

  function useItem(item: ItemDef, index: number): void {
    const player = getActivePlayer()
    switch (item.kind) {
      case 'heal_potion':
        if (player) {
          player.currentHp = player.maxHp
        }
        break
      case 'revive': {
        const fainted = battleTeam.find(({ isAlive }) => !isAlive)
        if (fainted) {
          fainted.isAlive = true
          fainted.currentHp = Math.floor(fainted.maxHp * 0.5)
        }
        break
      }
    }
    runState.inventory.splice(index, 1)
  }

  // main battle loop
  onUpdate(() => {
    if (battleOver) return
    if (itemsOverlay) return

    const player = getActivePlayer()
    const enemy = getActiveEnemy()

    // update swap cooldown
    if (swapCd > 0) {
      swapCd = Math.max(0, swapCd - dt())
    }
    hud.bench.setCooldown(swapCd / STAT.SWAP_COOLDOWN)

    // bench regen
    const activeTeamIdx = battleRoster[activePlayerIdx]
    for (let i = 0; i < playerTeam.length; i++) {
      if (i !== activeTeamIdx && playerTeam[i].isAlive) {
        playerTeam[i].currentHp = Math.min(
          playerTeam[i].maxHp,
          playerTeam[i].currentHp + STAT.BENCH_REGEN_RATE * dt(),
        )
      }
    }

    // auto-attack
    if (player && enemy) {
      tryAutoAttack(player, enemy)
      tryAutoAttack(enemy, player)
    }

    // update HUD
    updateHud(hud, player, enemy, wave)

    checkWaveEnd()
  })
})
