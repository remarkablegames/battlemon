import { addButton } from './button'

type Button = ReturnType<typeof addButton>

export interface TouchControls {
  itemsButton: Button
  destroy: () => void
}

const BUTTON_WIDTH = 120
const BUTTON_HEIGHT = 64

export function addTouchControls(): TouchControls {
  const itemsButton = addButton({
    x: center().x,
    y: height() - 90,
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    color: [80, 160, 80],
    label: 'Items',
    isFixed: true,
  })

  return {
    itemsButton,
    destroy: () => {
      destroy(itemsButton)
    },
  }
}
