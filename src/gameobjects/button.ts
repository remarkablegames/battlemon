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
    rect(width, height),
    pos(x, y),
    color(r, g, b),
    area(),
    anchor('center'),
    ...(isFixed ? [fixed()] : []),
  ])

  button.add([text(label, { size: labelSize }), anchor('center'), color(WHITE)])

  return button
}
