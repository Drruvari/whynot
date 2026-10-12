export type Difficulty = "chill" | "breezy" | "chaos"
export type Phase = "aim" | "falling" | "landed" | "over"
export type Junk = "crate" | "plank" | "barrel" | "wedge" | "fridge" | "wheel" | "tblock" | "brick" | "battery" | "duck"

export type RunSnapshot = {
  phase: Phase
  turns: number
  playerIndex: number
  score: number
  height: number
  lastPoints: number
  wind: number
  junk: Junk
  queue: Junk[]
  stage: number
  stageCleared: boolean
  dragging: boolean
  points: Record<string, number>
  reason: string
}

export type SavedRun = {
  score: number
  height: number
  turns: number
  points: Record<string, number>
  endedAt: number
}
