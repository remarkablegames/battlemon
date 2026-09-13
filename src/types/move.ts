export type MoveKind = 'basic' | 'nuke' | 'heal' | 'buff' | 'debuff'

export interface MoveDef {
  id: string
  name: string
  kind: MoveKind
  power: number
  cooldown: number
  description: string
  // heal-only: percent-of-max-HP shrinks by 1/(1 + diminish*(level-1))
  diminish?: number
}
