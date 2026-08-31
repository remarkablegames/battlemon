interface CardOptions {
  x: number
  y: number
  width: number
  height: number
  color: [number, number, number]
}

export function addCard({
  x,
  y,
  width,
  height,
  color: [r, g, b],
}: CardOptions) {
  const card = add([
    rect(width, height, { radius: 12 }),
    pos(x, y),
    color(r, g, b),
    area(),
    anchor('center'),
    scale(1),
  ])

  card.onHover(() => {
    setCursor('pointer')
    card.color = rgb(
      Math.min(r + 30, 255),
      Math.min(g + 30, 255),
      Math.min(b + 30, 255),
    )
    card.scale = vec2(1.02)
  })

  card.onHoverEnd(() => {
    setCursor('default')
    card.color = rgb(r, g, b)
    card.scale = vec2(1)
  })

  card.onDestroy(() => {
    setCursor('default')
  })

  return card
}
