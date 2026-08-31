import kaplay from 'kaplay'

kaplay({
  width: 540,
  height: 960,
  letterbox: true,
  stretch: true,
})

const { start } = await import('./scenes')

start()

// press F1
// debug.inspect = true
