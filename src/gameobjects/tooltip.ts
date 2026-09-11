import { ICON, MOVE, TYPE } from '../constants'
import type { Monster, MoveKind } from '../types'
import { sfx } from '../utils'

const ICON_HEIGHT = 22
const BUBBLE_WIDTH = 310
const BUBBLE_HEIGHT = 100
const BUBBLE_GAP = 10
const BUBBLE_PAD = 14

const KIND_LABELS: Partial<Record<MoveKind, string>> = {
  nuke: 'Attack',
  heal: 'Heal',
  buff: 'Buff',
  debuff: 'Debuff',
}

export function addTooltip(x: number, y: number, monster: Monster) {
  const icon = add([
    sprite(ICON.QUESTION, { height: ICON_HEIGHT }),
    pos(x, y),
    anchor('center'),
    area(),
    z(10),
  ])

  let bubble: ReturnType<typeof addBubble> | null = null

  function showBubble() {
    if (bubble) return
    bubble = addBubble(x, y, monster)
    bubble.onDestroy(() => {
      bubble = null
    })
  }

  function hideBubble() {
    if (bubble) destroy(bubble)
  }

  icon.onHover(() => {
    setCursor('pointer')
    showBubble()
  })

  icon.onHoverEnd(() => {
    setCursor('default')
    hideBubble()
  })

  icon.onClick(() => {
    if (bubble) {
      sfx('close')
      hideBubble()
    } else {
      sfx('open')
      showBubble()
    }
  })

  icon.onDestroy(() => {
    setCursor('default')
    hideBubble()
  })

  return icon
}

function addBubble(x: number, y: number, monster: Monster) {
  const special = MOVE.SPECIAL_MOVES[monster.type]
  const kindLabel = KIND_LABELS[special.kind] ?? special.kind

  const bubbleX = Math.max(
    BUBBLE_PAD,
    Math.min(x - BUBBLE_WIDTH / 2, width() - BUBBLE_WIDTH - BUBBLE_PAD),
  )
  const bubbleY = Math.max(
    BUBBLE_PAD,
    Math.min(y + BUBBLE_GAP, height() - BUBBLE_HEIGHT - BUBBLE_PAD),
  )

  const bubble = add([
    rect(BUBBLE_WIDTH, BUBBLE_HEIGHT, { radius: 12 }),
    pos(bubbleX, bubbleY),
    color(30, 30, 50),
    outline(2, rgb(80, 80, 110)),
    z(50),
  ])

  bubble.add([
    text(`Special: ${special.name}`, { size: 22 }),
    pos(BUBBLE_PAD, BUBBLE_PAD + 8),
    anchor('left'),
    color(255, 220, 100),
  ])

  bubble.add([
    text(
      `${TYPE.TYPE_LABELS[monster.type]} • ${kindLabel} • Cooldown ${String(special.cooldown)}s`,
      { size: 20 },
    ),
    pos(BUBBLE_PAD, BUBBLE_PAD + 38),
    anchor('left'),
    color(rgb(TYPE.TYPE_COLORS[monster.type])),
  ])

  const powerSuffix =
    special.kind === 'nuke' || special.kind === 'debuff'
      ? ` (Power ${String(special.power)})`
      : ''

  bubble.add([
    text(`${special.description}${powerSuffix}`, {
      size: 20,
      width: BUBBLE_WIDTH - BUBBLE_PAD * 2,
    }),
    pos(BUBBLE_PAD, BUBBLE_PAD + 54),
    color(200, 200, 200),
  ])

  return bubble
}
