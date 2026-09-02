import 'kaplay-plugin-text/global'

import kaplay from 'kaplay'
import { styledTextPlugin } from 'kaplay-plugin-text'

kaplay({
  width: 540,
  height: 960,
  letterbox: true,
  stretch: true,
  background: [20, 24, 36],
  plugins: [styledTextPlugin],
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
