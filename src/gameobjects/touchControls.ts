import { addButton } from './button'

function createSwapCooldownText() {
  return add([
    styledText('', {
      size: 20,
      fill: WHITE,
      outline: { color: BLACK, width: 2 },
    }),
    pos(80, height() - 130),
    anchor('center'),
    fixed(),
  ])
}

type Button = ReturnType<typeof addButton>
type CooldownText = ReturnType<typeof createSwapCooldownText>

export interface TouchControls {
  swapButton: Button
  abilityButton: Button
  itemsButton: Button
  swapCooldownText: CooldownText
}

const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 64

export function createTouchControls(): TouchControls {
  // swap button (bottom-left)
  const swapButton = addButton({
    x: 80,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [60, 100, 200],
    label: 'Swap',
    isFixed: true,
  })

  // ability button (bottom-right)
  const abilityButton = addButton({
    x: width() - 80,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [200, 80, 60],
    label: 'Ability',
    isFixed: true,
  })

  // items button (bottom-center)
  const itemsButton = addButton({
    x: center().x,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [80, 160, 80],
    label: 'Items',
    isFixed: true,
  })

  // swap cooldown indicator
  const swapCooldownText = createSwapCooldownText()

  return { swapButton, abilityButton, itemsButton, swapCooldownText }
}

export function updateSwapCooldown(
  textObj: CooldownText,
  cooldown: number,
): void {
  textObj.text = cooldown > 0 ? `Swap: ${cooldown.toFixed(1)}s` : 'Swap ready'
  textObj.setStyle({
    fill: cooldown > 0 ? rgb(255, 100, 100) : rgb(255, 255, 255),
  })
}

export function destroyTouchControls(controls: TouchControls): void {
  destroy(controls.swapButton)
  destroy(controls.abilityButton)
  destroy(controls.itemsButton)
  destroy(controls.swapCooldownText)
}
