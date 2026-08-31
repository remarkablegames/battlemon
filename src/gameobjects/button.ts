interface ButtonOptions {
  x: number
  y: number
  width: number
  height: number
  color: [number, number, number]
  label: string
  labelSize?: number
  isFixed?: boolean
}

export function addButton({
  x,
  y,
  width,
  height,
  color: [r, g, b],
  label,
  labelSize = 18,
  isFixed = false,
}: ButtonOptions) {
  const button = add([
    rect(width, height, { radius: 12 }),
    pos(x, y),
    color(r, g, b),
    area(),
    anchor('center'),
    ...(isFixed ? [fixed()] : []),
  ])

  button.onHover(() => {
    setCursor('pointer')
    button.color = rgb(
      Math.min(r + 30, 255),
      Math.min(g + 30, 255),
      Math.min(b + 30, 255),
    )
  })

  button.onHoverEnd(() => {
    setCursor('default')
    button.color = rgb(r, g, b)
  })

  button.onDestroy(() => {
    setCursor('default')
  })

  button.add([text(label, { size: labelSize }), anchor('center'), color(WHITE)])

  return button
}
