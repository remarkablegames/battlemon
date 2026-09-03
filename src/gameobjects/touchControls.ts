import { addButton } from './button'

type Button = ReturnType<typeof addButton>

export interface TouchControls {
  abilityButton: Button
  itemsButton: Button
  destroy: () => void
}

const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 64

export function addTouchControls(): TouchControls {
  const abilityButton = addButton({
    x: (width() * 2) / 3,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [200, 80, 60],
    label: 'Ability',
    isFixed: true,
  })

  const itemsButton = addButton({
    x: width() / 3,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [80, 160, 80],
    label: 'Items',
    isFixed: true,
  })

  return {
    abilityButton,
    itemsButton,
    destroy: () => {
      destroy(abilityButton)
      destroy(itemsButton)
    },
  }
}
