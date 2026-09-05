import './battle'
import './gameOver'
import './postBattle'
import './preload'
import './tame'
import './shop'
import './starter'
import './title'
import './upgrade'
import './waveStart'

import { SCENE } from '../constants'

export function start() {
  go(SCENE.PRELOAD)
}
