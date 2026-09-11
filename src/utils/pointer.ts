import type { AreaComp, GameObj, KEventController } from 'kaplay'

let pointerMoved = false

export function initHoverGate() {
  onMouseMove(markPointerMoved)
  resetPointerMoved()
}

export function gateHover<T extends GameObj<AreaComp>>(obj: T): T {
  const onHover = obj.onHover.bind(obj)
  obj.onHover = (handler: () => void): KEventController => {
    return onHover(() => {
      if (!pointerMoved) return
      handler()
    })
  }
  return obj
}

function markPointerMoved() {
  pointerMoved = true
}

function resetPointerMoved() {
  pointerMoved = false
}
