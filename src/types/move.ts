export type MoveKind = 'basic' | 'nuke' | 'heal' | 'buff' | 'debuff'

export interface MoveDef {
  id: string
  name: string
  kind: MoveKind
  power: number
  cooldown: number
  description: string
}
