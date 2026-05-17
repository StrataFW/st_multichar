export interface CharacterSummary {
  charId: number
  stateId: string
  firstName: string
  lastName: string
  gender: string | number
  dateOfBirth?: string
  lastPlayed?: string
  x?: number
  y?: number
  z?: number
  isDead?: boolean
}

export type Appearance = Record<string, unknown>

export interface CharacterFlavor {
  cash?: number
  groupLabel?: string
  dateOfBirth?: string
}

export interface ShowPayload {
  characters: CharacterSummary[]
  appearances: Record<number, Appearance>
  summaries?: Record<number, CharacterFlavor>
  mugshots?: Record<number, string>
  maxSlots: number
  brand: { name: string; tagline: string; version: string }
  confirmByName: boolean
  skipWelcome?: boolean
}
