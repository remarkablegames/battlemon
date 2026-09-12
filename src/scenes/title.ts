import { ICON, SCENE } from '../constants'
import { addButton, addSoundToggle } from '../gameobjects'
import { loadBestWave, resetRunState } from '../state'
import { initHoverGate } from '../utils'

scene(SCENE.TITLE, () => {
  resetRunState()
  loadBestWave()
  initHoverGate()
  addSoundToggle()

  add([sprite(ICON.LOGO), pos(center().add(0, -180)), anchor('center')])

  add([
    text('BATTLEMON', { size: 42 }),
    pos(center().add(0, -65)),
    anchor('center'),
    color(255, 200, 50),
  ])

  add([
    text('Tame. Fight. Level Up.', { size: 24 }),
    pos(center().add(0, -20)),
    anchor('center'),
    color(200, 200, 200),
  ])

  const startButton = addButton({
    x: center().x,
    y: center().y + 50,
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
