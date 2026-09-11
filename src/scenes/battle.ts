import { ITEM, MOVE, SCENE, STAT, TYPE } from '../constants'
import {
  addBattleBackground,
  addHud,
  addItemCard,
  addMonster,
  addSoundToggle,
  addTouchControls,
  ITEM_ROW_HEIGHT,
  updateHud,
} from '../gameobjects'
import { runState } from '../state'
import type { ItemDef, Monster } from '../types'
import {
  fullHealTeam,
  gainXp,
  isTeamDefeated,
  playDeathAnimation,
  playMusic,
  setSpriteState,
  sfx,
  shakeSprite,
} from '../utils'

scene(SCENE.BATTLE, () => {
  playMusic('battle')
  addBattleBackground()
  addSoundToggle()

  const { playerTeam, wave, activePlayerIndex, battleRoster } = runState
  const battleTeam = battleRoster.map((index) => playerTeam[index])
  const enemyTeam = runState.enemyTeam
  runState.defeatedEnemies = []
  runState.battleXpGains = new Map()
  runState.battleCoinReward = 0

  // track participating monsters
  const participatingMonsterIds = new Set<string>()

  let activePlayerIdx = activePlayerIndex
  let activeEnemyIdx = 0
  let swapCd = 0
  let battleOver = false
  const pendingDeathAnims: Promise<void>[] = []

  type Sprite = ReturnType<typeof addMonster>

  // create visual sprites for battle team
  const playerSprites: (Sprite | null)[] = battleTeam.map((monster, index) => {
    if (index === activePlayerIdx) {
      return addMonster({
        spriteId: monster.spriteId,
        x: STAT.PLAYER_POS.x,
        y: STAT.PLAYER_POS.y,
        monster,
      })
    }
    return null
  })

  // create enemy sprite
  let enemySprite: Sprite | null = null

  function spawnEnemySprite() {
    const enemy = enemyTeam[activeEnemyIdx]
    if (enemySprite) destroy(enemySprite)
    enemySprite = addMonster({
      spriteId: enemy.spriteId,
      x: STAT.ENEMY_POS.x,
      y: STAT.ENEMY_POS.y,
      monster: enemy,
      flipX: true,
    })
    sfx('bushes')
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

  function spawnMoveText(x: number, y: number, name: string): void {
    const moveLabel = add([
      styledText(name, {
        size: 24,
        fill: rgb(255, 220, 100),
        outline: { color: BLACK, width: 2 },
      }),
      pos(x, y),
      anchor('center'),
      fixed(),
      lifespan(1.0),
      opacity(1),
    ])

    moveLabel.onUpdate(() => {
      moveLabel.pos.y -= 40 * dt()
      moveLabel.opacity = Math.max(0, moveLabel.opacity - dt())
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

    let attackMult = 1
    const enrageMult = ITEM.effectFor('temp_boost_enrage')?.attackMult
    const hasteDamageMult = ITEM.effectFor('temp_boost_haste')?.damageMult
    const enemyDebuffMult = ITEM.effectFor(
      'temp_debuff_enemy_attack',
    )?.enemyAttackMult
    if (attacker.attackBuff > 0 && enrageMult) attackMult *= enrageMult
    if (attacker.damageDebuff > 0 && hasteDamageMult)
      attackMult *= hasteDamageMult
    if (attacker.enemyAttackDebuff > 0 && enemyDebuffMult) {
      attackMult *= enemyDebuffMult
    }

    const ironSkinMult = ITEM.effectFor('temp_boost_iron_skin')?.defenseMult
    const defense =
      defender.baseStats.defense *
      (defender.defenseBuff > 0 && ironSkinMult ? ironSkinMult : 1)
    const baseDamage = attacker.baseStats.attack * attackMult * power * critMult
    const damage = Math.max(1, Math.round((baseDamage * typeMult) / defense))
    defender.currentHp = Math.max(0, defender.currentHp - damage)

    // track participation (attacker dealt damage, defender took damage)
    if (battleTeam.includes(attacker)) {
      participatingMonsterIds.add(attacker.id)
    }
    if (battleTeam.includes(defender)) {
      participatingMonsterIds.add(defender.id)
    }

    // shake the defender's sprite on hit
    const defenderSprite =
      defender === getActivePlayer()
        ? playerSprites[activePlayerIdx]
        : enemySprite
    if (defenderSprite) {
      sfx(isCrit ? 'punch' : 'hit')
      if (isCrit) sfx('cut')
      const shakeIntensity = Math.min(12, 3 + (damage / defender.maxHp) * 20)
      shakeSprite(defenderSprite, shakeIntensity)
      if (defender.currentHp > 0) {
        setSpriteState(defenderSprite, defender, 'hurt')
      }
    }

    // hit flash + particles
    const playerSprite = playerSprites[activePlayerIdx]
    if (defender === getActivePlayer() && playerSprite) {
      playerSprite.color = WHITE
      wait(0.1, () => {
        playerSprite.color = WHITE
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
          enemySprite.color = WHITE
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
      sfx('splash')
      // track defeated enemies for catch/sell
      if (enemyTeam.includes(defender)) {
        runState.defeatedEnemies.push(defender)
      }
      // play death animation on the defender's sprite
      if (defender === battleTeam[activePlayerIdx] && playerSprite) {
        setSpriteState(playerSprite, defender, 'death')
        pendingDeathAnims.push(playDeathAnimation(playerSprite))
        playerSprites[activePlayerIdx] = null
      } else if (defender === enemyTeam[activeEnemyIdx] && enemySprite) {
        setSpriteState(enemySprite, defender, 'death')
        pendingDeathAnims.push(playDeathAnimation(enemySprite))
        enemySprite = null
      }
    }
  }

  function executeMove(
    attacker: Monster,
    defender: Monster,
    isSpecial: boolean,
  ): void {
    const attackerSprite =
      attacker === getActivePlayer()
        ? playerSprites[activePlayerIdx]
        : attacker === getActiveEnemy()
          ? enemySprite
          : null
    if (attackerSprite) setSpriteState(attackerSprite, attacker, 'attack')

    if (isSpecial) {
      const special = MOVE.SPECIAL_MOVES[attacker.type]
      const attackerPos =
        attacker === getActivePlayer()
          ? playerSprites[activePlayerIdx]?.pos
          : enemySprite?.pos

      if (attackerPos) {
        spawnMoveText(attackerPos.x, attackerPos.y, special.name)
      }

      switch (special.kind) {
        case 'nuke':
        case 'debuff':
          sfx(attacker.type === 'water' ? 'bubbles' : 'woosh')
          dealDamage(attacker, defender, special.power)
          if (special.kind === 'debuff') {
            defender.speedDebuff = 3 // 3 seconds of slow
          }
          break
        case 'buff':
          sfx('powerup')
          attacker.defenseBuff = 3 // 3 seconds of defense buff
          break
        case 'heal':
          sfx('spray')
          attacker.currentHp = Math.min(
            attacker.maxHp,
            attacker.currentHp + attacker.maxHp * special.power,
          )
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
    const hasteSpeed = ITEM.effectFor('temp_boost_haste')?.speedMult ?? 1
    const ironSkinSpeed = ITEM.effectFor('temp_boost_iron_skin')?.speedMult ?? 1
    const speedMult =
      (1 + attacker.baseStats.speed / 50) *
      (attacker.speedBuff > 0 ? hasteSpeed : 1) *
      (attacker.speedDebuff > 0 ? ironSkinSpeed : 1)
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
        const needsHeal = attacker.currentHp < attacker.maxHp
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
    const newSprite = addMonster({
      spriteId: monster.spriteId,
      x: STAT.PLAYER_POS.x,
      y: STAT.PLAYER_POS.y - 50,
      monster,
    })
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
    sfx('woosh')
  }

  async function finishBattle(toScene: string) {
    await Promise.all(pendingDeathAnims)
    hud.destroy()
    controls.destroy()

    if (enemySprite) {
      enemySprite.destroy()
    }

    for (const playerSprite of playerSprites) {
      if (playerSprite) {
        playerSprite.destroy()
      }
    }

    go(toScene)
  }

  function checkWaveEnd(): void {
    if (battleOver) return

    // check if all enemies defeated
    if (isTeamDefeated(enemyTeam)) {
      battleOver = true

      // calculate XP and coin rewards
      const totalXp = enemyTeam.reduce(
        (sum, enemy) => sum + enemy.level * STAT.XP_BASE,
        0,
      )
      runState.battleCoinReward = enemyTeam.length * 10 + wave * 5

      // distribute XP to participating monsters
      const participantCount = participatingMonsterIds.size
      if (participantCount > 0) {
        const xpPerMonster = Math.floor(totalXp / participantCount)
        for (const monsterId of participatingMonsterIds) {
          const monster = playerTeam.find((m) => m.id === monsterId)
          if (monster) {
            const oldLevel = monster.level
            const oldXpToNextLevel = monster.xpToNextLevel
            gainXp(monster, xpPerMonster)
            runState.battleXpGains.set(monsterId, {
              xpGained: xpPerMonster,
              oldLevel,
              oldXpToNextLevel,
            })
          }
        }
      }

      // add coins
      runState.coins += runState.battleCoinReward

      void finishBattle(SCENE.POST_BATTLE)
      return
    }

    // check if all player monsters defeated
    if (isTeamDefeated(battleTeam)) {
      battleOver = true
      void finishBattle(SCENE.GAME_OVER)
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
    sfx('open')
    itemsOverlay = createItemsOverlay()
  })

  function createItemsOverlay() {
    const overlay = add([pos(), fixed(), z(100)])

    // dim background
    overlay.add([rect(width(), height()), pos(), color(BLACK), opacity(0.7)])

    const items = runState.inventory

    // group items by id
    const groupedItems = new Map<string, { item: ItemDef; count: number }>()
    for (const item of items) {
      const existing = groupedItems.get(item.id)
      if (existing) {
        existing.count++
      } else {
        groupedItems.set(item.id, { item, count: 1 })
      }
    }

    const groupedArray = Array.from(groupedItems.values())

    // panel
    const panelWidth = 400
    const panelHeight = Math.min(
      110 + Math.max(1, groupedArray.length) * ITEM_ROW_HEIGHT,
      height() - 40,
    )
    const panelX = (width() - panelWidth) / 2
    const panelY = 150

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
    groupedArray.forEach(({ item, count }, index) => {
      const itemY = panelY + index * ITEM_ROW_HEIGHT + 55

      addItemCard({
        parent: overlay,
        x: panelX + 20,
        y: itemY,
        width: panelWidth - 40,
        item,
        count,
        onClick: () => {
          const inventoryIndex = runState.inventory.findIndex(
            ({ id }) => id === item.id,
          )
          if (inventoryIndex >= 0) {
            useItem(item, inventoryIndex)
          }
          sfx('close')
          destroy(overlay)
          itemsOverlay = null
        },
      })
    })

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
      sfx('close')
      destroy(overlay)
      itemsOverlay = null
    })

    return overlay
  }

  function useItem(item: ItemDef, index: number): void {
    const player = getActivePlayer()
    switch (item.kind) {
      case 'heal_potion':
        sfx('heal')
        if (player) {
          player.currentHp = player.maxHp
        }
        updateHud(hud, getActivePlayer(), getActiveEnemy(), runState.wave)
        break
      case 'revive': {
        sfx('heal')
        const fainted = battleTeam.find(({ isAlive }) => !isAlive)
        if (fainted) {
          fainted.isAlive = true
          fainted.currentHp = Math.floor(fainted.maxHp * 0.5)
        }
        updateHud(hud, getActivePlayer(), getActiveEnemy(), runState.wave)
        break
      }
      case 'full_heal':
        sfx('heal')
        fullHealTeam(battleTeam)
        updateHud(hud, getActivePlayer(), getActiveEnemy(), runState.wave)
        break
      case 'temp_boost_enrage':
        sfx('powerup')
        if (player && item.effect) {
          player.attackBuff = item.effect.duration
        }
        break
      case 'temp_boost_iron_skin':
        sfx('powerup')
        if (player && item.effect) {
          player.defenseBuff = item.effect.duration
          player.speedDebuff = item.effect.duration
        }
        break
      case 'temp_boost_haste':
        sfx('powerup')
        if (player && item.effect) {
          player.speedBuff = item.effect.duration
          player.damageDebuff = item.effect.duration
        }
        break
      case 'temp_debuff_enemy_attack':
        sfx('powerup')
        if (item.effect) {
          const enemy = getActiveEnemy()
          if (enemy) {
            enemy.enemyAttackDebuff = item.effect.duration
          }
        }
        break
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

    // decay temporary boost timers and apply enrage self-damage
    const enrageEffect = ITEM.effectFor('temp_boost_enrage')
    const allMonsters = [...battleTeam, ...enemyTeam]
    for (const monster of allMonsters) {
      monster.attackBuff = Math.max(0, monster.attackBuff - dt())
      monster.speedBuff = Math.max(0, monster.speedBuff - dt())
      monster.damageDebuff = Math.max(0, monster.damageDebuff - dt())
      monster.enemyAttackDebuff = Math.max(0, monster.enemyAttackDebuff - dt())
      if (monster.attackBuff > 0 && enrageEffect?.selfDamagePerSec) {
        monster.currentHp = Math.max(
          1,
          monster.currentHp - enrageEffect.selfDamagePerSec * dt(),
        )
      }
    }

    // auto-attack
    if (player && enemy) {
      tryAutoAttack(player, enemy)
      tryAutoAttack(enemy, player)
    }

    updateHud(hud, player, enemy, wave)

    checkWaveEnd()
  })
})
