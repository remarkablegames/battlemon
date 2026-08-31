import { addButton } from './button'

function createSwapCooldownText() {
  return add([
    text('', { size: 20 }),
    pos(30, height() - 130),
    color(100, 255, 100),
    anchor('center'),
    fixed(),
  ])
}

type Button = ReturnType<typeof addButton>
type CooldownText = ReturnType<typeof createSwapCooldownText>

export interface TouchControls {
  swapButton: Button
  abilityButton: Button
  swapCooldownText: CooldownText
}

const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 64

export function createTouchControls(): TouchControls {
  // swap button (bottom-left)
  const swapButton = addButton({
    x: 30,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [60, 100, 200],
    label: 'Swap',
    isFixed: true,
  })

  // ability button (bottom-right)
  const abilityButton = addButton({
    x: width() - 30,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [200, 80, 60],
    label: 'Ability',
    isFixed: true,
  })

  // swap cooldown indicator
  const swapCooldownText = createSwapCooldownText()

  return { swapButton, abilityButton, swapCooldownText }
}

export function updateSwapCooldown(
  textObj: CooldownText,
  cooldown: number,
): void {
  if (cooldown > 0) {
    textObj.text = `Swap: ${cooldown.toFixed(1)}s`
    textObj.color = rgb(255, 100, 100)
  } else {
    textObj.text = 'Swap ready'
    textObj.color = rgb(100, 255, 100)
  }
}

export function destroyTouchControls(controls: TouchControls): void {
  destroy(controls.swapButton)
  destroy(controls.abilityButton)
  destroy(controls.swapCooldownText)
}
