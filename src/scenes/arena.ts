import { MOVE, SCENE, STAT, TYPE } from '../constants'
import { spawnWave } from '../gameobjects/enemyWave'
import { createHud, destroyHud, updateHud } from '../gameobjects/hud'
import { isTeamDefeated } from '../gameobjects/team'
import {
  createTouchControls,
  destroyTouchControls,
  updateSwapCooldown,
} from '../gameobjects/touchControls'
import { runState } from '../state'
import type { Monster } from '../types'

scene(SCENE.ARENA, () => {
  const { playerTeam, wave, activePlayerIndex } = runState
  const enemyTeam = spawnWave(wave)

  let activePlayerIdx = activePlayerIndex
  let activeEnemyIdx = 0
  let swapCd = 0
  let battleOver = false

  function spawnSprite(
    spriteId: string,
    x: number,
    y: number,
    typeColor: string,
  ) {
    return add([
      sprite(spriteId),
      pos(x, y),
      anchor('center'),
      scale(STAT.MONSTER_SCALE),
      color(rgb(typeColor)),
    ])
  }

  type Sprite = ReturnType<typeof spawnSprite>

  // create visual sprites for player team
  const playerSprites: (Sprite | null)[] = playerTeam.map((monster, i) => {
    if (i === activePlayerIdx) {
      return spawnSprite(
        monster.spriteId,
        STAT.PLAYER_POS.x,
        STAT.PLAYER_POS.y,
        TYPE.TYPE_COLORS[monster.type],
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
    )
  }

  spawnEnemySprite()

  const hud = createHud()
  const controls = createTouchControls()

  function getActivePlayer(): Monster | null {
    const monster = playerTeam[activePlayerIdx]
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

  function dealDamage(
    attacker: Monster,
    defender: Monster,
    power: number,
  ): void {
    const typeMult = TYPE.getTypeMultiplier(attacker.type, defender.type)
    const baseDamage = attacker.baseStats.attack * power
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
    } else if (defender === getActiveEnemy() && enemySprite) {
      enemySprite.color = WHITE
      wait(0.1, () => {
        if (enemySprite) {
          enemySprite.color = rgb(TYPE.TYPE_COLORS[defender.type])
        }
      })
      spawnHitParticles(enemySprite.pos, typeMult)
    }

    if (defender.currentHp <= 0) {
      defender.isAlive = false
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
            ? playerTeam
            : enemyTeam) {
            if (monster.isAlive) {
              monster.currentHp = Math.min(
                monster.maxHp,
                monster.currentHp + monster.maxHp * special.power,
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
      executeMove(attacker, defender, true)
    } else if (attacker.basicCooldown <= 0) {
      executeMove(attacker, defender, false)
    }
  }

  function swapPlayerMonster(toIndex: number): void {
    if (toIndex < 0 || toIndex >= playerTeam.length) return
    if (!playerTeam[toIndex].isAlive) return
    if (toIndex === activePlayerIdx) return
    if (swapCd > 0) return

    // destroy old sprite
    const oldSprite = playerSprites[activePlayerIdx]
    if (oldSprite) {
      destroy(oldSprite)
      playerSprites[activePlayerIdx] = null
    }

    activePlayerIdx = toIndex
    const monster = playerTeam[activePlayerIdx]

    // create new sprite with entry animation
    const newSprite = spawnSprite(
      monster.spriteId,
      STAT.PLAYER_POS.x,
      STAT.PLAYER_POS.y - 50,
      TYPE.TYPE_COLORS[monster.type],
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
  }

  function checkWaveEnd(): void {
    if (battleOver) return

    // check if all enemies defeated
    if (isTeamDefeated(enemyTeam)) {
      battleOver = true
      // find next alive enemy
      wait(0.5, () => {
        destroyHud(hud)
        destroyTouchControls(controls)
        if (enemySprite) destroy(enemySprite)
        for (const s of playerSprites) {
          if (s) destroy(s)
        }
        go(SCENE.UPGRADE)
      })
      return
    }

    // check if all player monsters defeated
    if (isTeamDefeated(playerTeam)) {
      battleOver = true
      wait(0.5, () => {
        destroyHud(hud)
        destroyTouchControls(controls)
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
        spawnEnemySprite()
      }
    }

    // auto-swap if active player is dead
    if (!playerTeam[activePlayerIdx]?.isAlive) {
      const nextAlive = playerTeam.findIndex((monster) => monster.isAlive)
      if (nextAlive >= 0) {
        swapPlayerMonster(nextAlive)
        swapCd = 0 // free swap on death
      }
    }
  }

  // swap button
  controls.swapButton.onClick(() => {
    if (swapCd > 0) return
    // find next alive benched monster
    const aliveIndices = playerTeam
      .map((monster, i) => ({ monster, i }))
      .filter(({ monster, i }) => monster.isAlive && i !== activePlayerIdx)
    if (aliveIndices.length > 0) {
      swapPlayerMonster(aliveIndices[0].i)
    }
  })

  // ability button - force special move
  controls.abilityButton.onClick(() => {
    const player = getActivePlayer()
    const enemy = getActiveEnemy()
    if (!player || !enemy) return
    if (player.specialCooldown <= 0) {
      executeMove(player, enemy, true)
    }
  })

  // main battle loop
  onUpdate(() => {
    if (battleOver) return

    const player = getActivePlayer()
    const enemy = getActiveEnemy()

    // update swap cooldown
    if (swapCd > 0) {
      swapCd = Math.max(0, swapCd - dt())
    }
    updateSwapCooldown(controls.swapCooldownText, swapCd)

    // bench regen
    for (let i = 0; i < playerTeam.length; i++) {
      if (i !== activePlayerIdx && playerTeam[i].isAlive) {
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
