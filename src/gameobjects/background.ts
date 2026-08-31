import { STAT } from '../constants'

export function addBattleBackground() {
  const bg = add([])

  const horizonY = 200
  const screenW = width()
  const screenH = height()

  // --- Sky ---
  bg.add([rect(screenW, horizonY), pos(), color(72, 196, 232)])

  // Sky scanlines
  for (let y = 0; y < horizonY; y += 8) {
    bg.add([rect(screenW, 3), pos(0, y), color(130, 222, 246), opacity(0.8)])
  }

  // Horizon line
  bg.add([rect(screenW, 4), pos(0, horizonY - 2), color(210, 245, 255)])

  // --- Ground / Grass Field ---
  bg.add([
    rect(screenW, screenH - horizonY),
    pos(0, horizonY),
    color(196, 228, 92),
  ])

  // Field scanlines
  for (let y = horizonY; y < screenH; y += 10) {
    bg.add([rect(screenW, 4), pos(0, y), color(172, 210, 72), opacity(0.7)])
  }

  // Helper for grass battle platform
  function addPlatform(
    x: number,
    y: number,
    outerR: number,
    scaleX: number,
    scaleY: number,
  ) {
    // Outer golden/yellow ring
    bg.add([
      circle(outerR),
      pos(x, y),
      scale(scaleX, scaleY),
      anchor('center'),
      color(245, 205, 55),
    ])

    // Mid vibrant grass oval
    bg.add([
      circle(outerR * 0.88),
      pos(x, y),
      scale(scaleX * 0.92, scaleY * 0.88),
      anchor('center'),
      color(70, 165, 60),
    ])

    // Inner darker grass patch
    bg.add([
      circle(outerR * 0.65),
      pos(x, y),
      scale(scaleX * 0.82, scaleY * 0.72),
      anchor('center'),
      color(45, 120, 50),
    ])

    // Grass tuft accents around the platform
    const tuftOffsets = [
      { dx: -outerR * 0.7, dy: -outerR * 0.15 },
      { dx: outerR * 0.6, dy: outerR * 0.1 },
      { dx: -outerR * 0.3, dy: outerR * 0.25 },
      { dx: outerR * 0.2, dy: -outerR * 0.2 },
    ]
    for (const { dx, dy } of tuftOffsets) {
      bg.add([
        rect(4, 7),
        pos(x + dx, y + dy),
        anchor('center'),
        color(35, 95, 40),
      ])
    }
  }

  // Enemy platform (top right)
  addPlatform(STAT.ENEMY_POS.x, STAT.ENEMY_POS.y + 45, 65, 1.8, 0.65)

  // Player platform (bottom left)
  addPlatform(STAT.PLAYER_POS.x, STAT.PLAYER_POS.y + 55, 90, 2.0, 0.7)

  return bg
}
