import 'kaplay-plugin-text/global'

import kaplay from 'kaplay'
import { styledTextPlugin } from 'kaplay-plugin-text'

import { FONT } from './constants'

kaplay({
  font: FONT.PRIMARY,
  width: 540,
  height: 960,
  letterbox: true,
  stretch: true,
  pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
  background: [20, 24, 36],
  plugins: [styledTextPlugin],
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
