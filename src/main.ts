import kaplay from 'kaplay'

kaplay({
  width: 540,
  height: 960,
  letterbox: true,
  stretch: true,
  background: [20, 24, 36],
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
