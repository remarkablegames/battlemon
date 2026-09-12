import { FONT, SCENE, STAT, TYPE } from '../constants'
import {
  addButton,
  addCard,
  addEnemyPreview,
  addMiniHpBar,
  addSoundToggle,
  addTooltip,
} from '../gameobjects'
import { runState } from '../state'
import {
  initHoverGate,
  monsterHeightMultiplier,
  playMusic,
  spawnWave,
} from '../utils'

const CARD_SPACING = 108
const CARD_START_Y = 268
const CARD_CONTENT_OFFSET_X = -20

scene(SCENE.WAVE_START, () => {
  initHoverGate()
  const { playerTeam, wave } = runState
  playMusic('journey')
  addSoundToggle()

  // generate enemy team for this wave if not already set
  if (runState.enemyTeam.length === 0) {
    runState.enemyTeam = spawnWave(wave)
  }

  const aliveIndices = playerTeam
    .map((monster, index) => ({ monster, i: index }))
    .filter(({ monster }) => monster.isAlive)

  const selected: number[] = []

  add([
    text(`Wave ${String(wave)}`, { size: 36 }),
    pos(center().x, 60),
    anchor('center'),
    color(255, 220, 100),
  ])

  const subtitle = add([
    text(`Select up to ${String(STAT.BATTLE_TEAM_SIZE)} monsters`, {
      size: 22,
    }),
    pos(center().x, 95),
    anchor('center'),
    color(200, 200, 200),
  ])

  function updateSubtitle() {
    subtitle.text = `Select up to ${String(STAT.BATTLE_TEAM_SIZE)} monsters (${String(selected.length)}/${String(STAT.BATTLE_TEAM_SIZE)})`
  }

  addEnemyPreview(runState.enemyTeam, { label: 'Enemies', y: 175 })

  const cards: ReturnType<typeof addCard>[] = []
  const borders: ReturnType<typeof addBorder>[] = []
  const orderLabels: ReturnType<typeof addOrderLabel>[] = []

  function addBorder(x: number, y: number) {
    return add([
      rect(488, 98, { radius: 14, fill: false }),
      pos(x, y),
      anchor('center'),
      outline(0, rgb(100, 200, 100)),
      z(1),
    ])
  }

  function addOrderLabel(x: number, y: number) {
    return add([
      text('', { size: 46, font: FONT.SECONDARY }),
      pos(x, y),
      anchor('center'),
      color(WHITE),
    ])
  }

  aliveIndices.forEach(({ monster, i }, displayIdx) => {
    const x = center().x
    const y = CARD_START_Y + displayIdx * CARD_SPACING

    const border = addBorder(x, y)
    borders.push(border)

    const card = addCard({
      x,
      y,
      width: 480,
      height: 90,
      color: [40, 40, 60],
    })
    cards.push(card)

    const monsterSprite = add([
      sprite(monster.spriteId, {
        height: 64 * monsterHeightMultiplier(monster.spriteId),
        animSpeed: STAT.ANIM_SPEED,
      }),
      pos(x - 160 + CARD_CONTENT_OFFSET_X, y),
      anchor('center'),
    ])
    monsterSprite.play('idle')

    // monster name
    add([
      text(`${monster.name} Lv${String(monster.level)}`, { size: 24 }),
      pos(x - 100 + CARD_CONTENT_OFFSET_X, y - 18),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    // monster stats
    add([
      text(
        `ATK ${String(monster.baseStats.attack)} | DEF ${String(monster.baseStats.defense)} | SPD ${String(monster.baseStats.speed)}`,
        { size: 22 },
      ),
      pos(x - 100 + CARD_CONTENT_OFFSET_X, y + 6),
      anchor('left'),
      color(180, 180, 180),
    ])

    // monster health
    addMiniHpBar({
      x: x - 100 + CARD_CONTENT_OFFSET_X,
      y: y + 22,
      width: 200,
      height: 10,
      monster,
      showHpText: true,
    })

    const orderLabel = addOrderLabel(x + 200 + CARD_CONTENT_OFFSET_X, y)
    orderLabels.push(orderLabel)

    const tooltipIcon = addTooltip(x + 235 + CARD_CONTENT_OFFSET_X, y, monster)

    card.onClick(() => {
      if (tooltipIcon.hasPoint(mousePos())) return

      const selIdx = selected.indexOf(i)
      if (selIdx >= 0) {
        // deselect — remove from selected and shift order
        selected.splice(selIdx, 1)
        border.outline.width = 0
        orderLabel.text = ''
        card.color = rgb(40, 40, 60)
      } else if (selected.length < STAT.BATTLE_TEAM_SIZE) {
        // select
        selected.push(i)
        border.outline.width = 4
        orderLabel.text = String(selected.length)
        card.color = rgb(60, 60, 90)
      }
      // update order labels for all selected cards
      selected.forEach((playerIdx, order) => {
        const displayIdxOfSelected = aliveIndices.findIndex(
          (a) => a.i === playerIdx,
        )
        if (displayIdxOfSelected >= 0) {
          orderLabels[displayIdxOfSelected].text = String(order + 1)
        }
      })
      updateSubtitle()
      startButton.setDisabled(selected.length === 0)
    })
  })

  const startButton = addButton({
    x: center().x,
    y: height() - 60,
    width: 200,
    height: 56,
    color: [60, 180, 80],
    label: 'Start Battle',
    isFixed: true,
    disabled: true,
    sound: 'start',
  })

  startButton.onClick(() => {
    runState.battleRoster = [...selected]
    runState.activePlayerIndex = 0
    go(SCENE.BATTLE)
  })
})
