import './battle'
import './gameOver'
import './postBattle'
import './preload'
import './tame'
import './shop'
import './starter'
import './title'
import './waveStart'

import { SCENE } from '../constants'

export function start() {
  go(SCENE.PRELOAD)
}
