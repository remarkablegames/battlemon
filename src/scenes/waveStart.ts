import { SCENE, TYPE } from '../constants'
import { addButton, addCard, BATTLE_TEAM_SIZE } from '../gameobjects'
import { runState } from '../state'

scene(SCENE.WAVE_START, () => {
  const { playerTeam, wave } = runState

  const aliveIndices = playerTeam
    .map((monster, i) => ({ monster, i }))
    .filter(({ monster }) => monster.isAlive)

  const selected: number[] = []

  add([
    text(`Wave ${String(wave)}`, { size: 28 }),
    pos(center().x, 60),
    anchor('center'),
    color(255, 220, 100),
  ])

  const subtitle = add([
    text(`Select up to ${String(BATTLE_TEAM_SIZE)} monsters`, { size: 20 }),
    pos(center().x, 95),
    anchor('center'),
    color(200, 200, 200),
  ])

  function updateSubtitle() {
    subtitle.text = `Select up to ${String(BATTLE_TEAM_SIZE)} monsters (${String(selected.length)}/${String(BATTLE_TEAM_SIZE)})`
  }

  const cardSpacing = 110
  const startY = 150

  const cards: ReturnType<typeof addCard>[] = []
  const borders: ReturnType<typeof createBorder>[] = []
  const orderLabels: ReturnType<typeof createOrderLabel>[] = []

  function createBorder(x: number, y: number) {
    return add([
      rect(488, 98, { radius: 14 }),
      pos(x, y),
      anchor('center'),
      color(100, 200, 100),
      opacity(0),
    ])
  }

  function createOrderLabel(x: number, y: number) {
    return add([
      text('', { size: 28 }),
      pos(x, y),
      anchor('center'),
      color(100, 255, 100),
    ])
  }

  aliveIndices.forEach(({ monster, i }, displayIdx) => {
    const x = center().x
    const y = startY + displayIdx * cardSpacing

    const border = createBorder(x, y)
    borders.push(border)

    const card = addCard({
      x,
      y,
      width: 480,
      height: 90,
      color: [40, 40, 60],
    })
    cards.push(card)

    add([
      sprite(monster.spriteId),
      pos(x - 160, y),
      anchor('center'),
      scale(2),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(monster.name, { size: 20 }),
      pos(x - 100, y - 20),
      anchor('left'),
      color(rgb(TYPE.TYPE_COLORS[monster.type])),
    ])

    add([
      text(
        `${TYPE.TYPE_LABELS[monster.type]} Lv${String(monster.level)}  HP ${String(Math.ceil(monster.currentHp))}/${String(monster.maxHp)}`,
        { size: 20 },
      ),
      pos(x - 100, y + 10),
      anchor('left'),
      color(180, 180, 180),
    ])

    const orderLabel = createOrderLabel(x + 200, y)
    orderLabels.push(orderLabel)

    card.onClick(() => {
      const selIdx = selected.indexOf(i)
      if (selIdx >= 0) {
        // deselect — remove from selected and shift order
        selected.splice(selIdx, 1)
        border.opacity = 0
        orderLabel.text = ''
        card.color = rgb(40, 40, 60)
      } else if (selected.length < BATTLE_TEAM_SIZE) {
        // select
        selected.push(i)
        border.opacity = 1
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
    labelSize: 20,
    isFixed: true,
    disabled: true,
  })

  startButton.onClick(() => {
    runState.battleRoster = [...selected]
    runState.activePlayerIndex = 0
    go(SCENE.ARENA)
  })
})
