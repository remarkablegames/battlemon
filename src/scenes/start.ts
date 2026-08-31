import './arena'
import './gameOver'
import './preload'
import './starter'
import './upgrade'
import './waveStart'

import { SCENE } from '../constants'
import { addButton } from '../gameobjects'
import { loadBestWave, resetRunState } from '../state'

scene(SCENE.START, () => {
  resetRunState()
  loadBestWave()

  add([
    text('Battlemon', { size: 36 }),
    pos(center().add(0, -80)),
    anchor('center'),
    color(255, 200, 50),
  ])

  add([
    text('Build. Battle. Evolve.', { size: 16 }),
    pos(center().add(0, -30)),
    anchor('center'),
    color(200, 200, 200),
  ])

  const startButton = addButton({
    x: center().x,
    y: center().y + 50,
    width: 100,
    height: 64,
    color: [60, 180, 80],
    label: 'Start',
    labelSize: 20,
  })

  startButton.onClick(() => {
    go(SCENE.STARTER)
  })
})

export function start() {
  go(SCENE.PRELOAD)
}
