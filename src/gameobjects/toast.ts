import type { ColorComp } from 'kaplay'

export function addToast({
  message,
  y,
  tint,
}: {
  message: string
  y?: number
  tint?: ColorComp['color']
}) {
  const toast = add([
    text(message, { size: 24 }),
    pos(center().x, y ?? center().y),
    anchor('center'),
    color(tint ?? rgb(100, 255, 100)),
    opacity(1),
    z(200),
  ])

  tween(
    toast.pos.y,
    toast.pos.y - 30,
    1.0,
    (newY) => {
      toast.pos.y = newY
    },
    easings.easeOutQuad,
  )

  tween(
    1,
    0,
    1.0,
    (opacity) => {
      toast.opacity = opacity
    },
    easings.easeOutQuad,
  ).onEnd(() => {
    destroy(toast)
  })

  return toast
}
