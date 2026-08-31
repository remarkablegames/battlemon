import './arena'
import './gameOver'
import './preload'
import './starter'
import './title'
import './upgrade'
import './waveStart'

import { SCENE } from '../constants'

export function start() {
  go(SCENE.PRELOAD)
}
