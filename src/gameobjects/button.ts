import type { ColorComp, GameObj, RectComp } from 'kaplay'

interface ButtonOptions {
  x: number
  y: number
  width: number
  height: number
  color: [number, number, number]
  label: string
  labelSize?: number
  isFixed?: boolean
  disabled?: boolean
}

const DISABLED_COLOR: [number, number, number] = [60, 60, 60]

interface ButtonStateComp {
  disabled: boolean
  enabledColor: [number, number, number]
}

function buttonState(
  disabled: boolean,
  enabledColor: [number, number, number],
) {
  return {
    id: 'buttonState',
    disabled,
    enabledColor,
    setDisabled(this: GameObj<ButtonStateComp & ColorComp>, value: boolean) {
      this.disabled = value
      const [r, g, b] = value ? DISABLED_COLOR : this.enabledColor
      this.color = rgb(r, g, b)
    },
  }
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
  disabled = false,
}: ButtonOptions) {
  const [ir, ig, ib] = disabled ? DISABLED_COLOR : [r, g, b]
  let cooldownFill: GameObj<RectComp> | null = null

  const button = add([
    rect(width, height, { radius: 12 }),
    pos(x, y),
    color(ir, ig, ib),
    area(),
    anchor('center'),
    scale(1),
    ...(isFixed ? [fixed()] : []),
    buttonState(disabled, [r, g, b]),
    {
      id: 'cooldown',
      setCooldownRatio(ratio: number) {
        if (!cooldownFill) return
        if (ratio <= 0) {
          cooldownFill.hidden = true
        } else {
          cooldownFill.hidden = false
          cooldownFill.height = height * ratio
        }
      },
    },
  ])

  button.onHover(() => {
    if (button.disabled) return
    setCursor('pointer')
    button.color = rgb(
      Math.min(button.enabledColor[0] + 30, 255),
      Math.min(button.enabledColor[1] + 30, 255),
      Math.min(button.enabledColor[2] + 30, 255),
    )
    button.scale = vec2(1.05)
  })

  button.onHoverEnd(() => {
    setCursor('default')
    const [cr, cg, cb] = button.disabled ? DISABLED_COLOR : button.enabledColor
    button.color = rgb(cr, cg, cb)
    button.scale = vec2(1)
  })

  button.onDestroy(() => {
    setCursor('default')
  })

  button.add([text(label, { size: labelSize }), anchor('center'), color(WHITE)])

  // cooldown overlay (dark sweep from bottom to top)
  cooldownFill = button.add([
    rect(width, height, { radius: 12 }),
    pos(0, height / 2),
    anchor('bot'),
    color(0, 0, 0),
    opacity(0.5),
  ])
  cooldownFill.hidden = true

  return button
}
