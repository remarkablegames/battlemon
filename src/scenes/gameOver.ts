import { SCENE } from '../constants'
import { addButton, addSoundToggle } from '../gameobjects'
import { runState, saveBestWave } from '../state'
import { initHoverGate, playMusic } from '../utils'

scene(SCENE.GAME_OVER, () => {
  initHoverGate()
  const { wave, bestWave } = runState
  saveBestWave(wave)
  playMusic('title')
  addSoundToggle()

  add([
    text('Defeated!', { size: 36 }),
    pos(center().add(0, -120)),
    anchor('center'),
    color(255, 80, 80),
  ])

  add([
    text(`You reached wave ${String(wave)}`, { size: 20 }),
    pos(center().add(0, -50)),
    anchor('center'),
    color(WHITE),
  ])

  add([
    text(`Best: Wave ${String(bestWave)}`, { size: 20 }),
    pos(center().add(0, -15)),
    anchor('center'),
    color(200, 200, 100),
  ])

  const restartButton = addButton({
    x: center().x,
    y: center().y + 60,
    width: 140,
    height: 50,
    color: [60, 180, 80],
    label: 'Restart',
    labelSize: 20,
    sound: 'continue',
  })

  restartButton.onClick(() => {
    go(SCENE.TITLE)
  })
})
