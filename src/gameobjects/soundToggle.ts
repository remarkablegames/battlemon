import { ICON } from '../constants'
import { getAudioMuted, sfx, toggleMuted } from '../utils'

const ICON_HEIGHT = 44

export function addSoundToggle() {
  const iconId = (muted: boolean): string =>
    muted ? ICON.SOUND_MUTED : ICON.SOUND_ON

  const toggle = add([
    pos(width() - 45, 45),
    anchor('center'),
    sprite(iconId(getAudioMuted()), { height: ICON_HEIGHT }),
    area(),
    fixed(),
    z(100),
    scale(1),
  ])

  toggle.onHover(() => {
    setCursor('pointer')
    toggle.scale = vec2(1.1)
  })

  toggle.onHoverEnd(() => {
    setCursor('default')
    toggle.scale = vec2(1)
  })

  toggle.onClick(() => {
    sfx('click')
    const muted = toggleMuted()
    toggle.unuse('sprite')
    toggle.use(sprite(iconId(muted), { height: ICON_HEIGHT }))
    toggle.scale = vec2(1)
  })

  toggle.onDestroy(() => {
    setCursor('default')
  })

  return toggle
}
