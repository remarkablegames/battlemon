import type { Monster } from './monster'

export interface TeamOverlayOptions {
  title: string
  subtitle?: string
  onSelect?: (monster: Monster) => void
  rowRightText?: (monster: Monster) => string
  showHpBar?: boolean
  showXpBar?: boolean
}
