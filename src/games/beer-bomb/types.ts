/** Types owned by Beer Bomb. Other games should not import these. */
export type BeerBombPhase = "play" | "result" | "round-over" | "night-over"

export type BeerCell = {
  id: string
  bomb: boolean
  opened: boolean
}

export type BeerBombHit = {
  playerId: string
  kind: "safe" | "bomb"
  drinks: number
}

export type BeerBombData = {
  inProgress: boolean
  phase: BeerBombPhase
  round: number
  totalRounds: number
  bombCount: number
  cells: BeerCell[]
  /** Frozen at game start so later changes to the session cannot change turns. */
  playerIds: string[]
  turnIndex: number
  lastHit: BeerBombHit | null
  streakPlayerId: string | null
  streakCount: number
  bombHits: Record<string, number>
  drinks: Record<string, number>
}
