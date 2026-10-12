export type RoulettePhase = "aim" | "result"

export type RouletteShot = {
  playerId: string
  bang: boolean
  chamber: number
  cylinder: number
  shotNumber: number
}

/** Persisted game data. React animation state is intentionally excluded. */
export type RouletteData = {
  inProgress: boolean
  phase: RoulettePhase
  chamberCount: number
  bullets: number
  chambers: boolean[]
  /** Position of the next chamber; never display its contents. */
  index: number
  shotsFired: number
  cylinderNumber: number
  turnIndex: number
  playerIds: string[]
  lastShot: RouletteShot | null
  bangs: Record<string, number>
  pulls: Record<string, number>
  totalShots: number
}
