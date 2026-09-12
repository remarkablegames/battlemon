import { ICON, SCENE } from '../constants'
import { addButton, addSoundToggle } from '../gameobjects'
import { loadBestWave, resetRunState } from '../state'
import { initHoverGate } from '../utils'

const OFFSET_Y = 20

scene(SCENE.TITLE, () => {
  resetRunState()
  loadBestWave()
  initHoverGate()
  addSoundToggle()

  add([
    sprite(ICON.LOGO),
    pos(center().add(0, -180 + OFFSET_Y)),
    anchor('center'),
  ])

  add([
    text('BATTLEMON', { size: 42 }),
    pos(center().add(0, -65 + OFFSET_Y)),
    anchor('center'),
    color(255, 200, 50),
  ])

  add([
    text('Tame. Fight. Level Up.', { size: 28 }),
    pos(center().add(0, -20 + OFFSET_Y)),
    anchor('center'),
    color(200, 200, 200),
  ])

  const startButton = addButton({
    x: center().x,
    y: center().y + 50 + OFFSET_Y,
    width: 100,
    height: 50,
    color: [60, 180, 80],
    label: 'Start',
    sound: 'start',
  })

  startButton.onClick(() => {
    go(SCENE.STARTER)
  })
})
