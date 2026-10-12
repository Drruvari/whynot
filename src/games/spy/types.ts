import type { Player } from "@/lib/types"

export type SpyPhase = "reveal" | "discussion" | "vote" | "guess" | "result"

export type SpyOutcome = {
  accusedId: string | null
  tie: boolean
  spyCaught: boolean
  guess: string | null
  spyGuessed: boolean | null
  winner: "spy" | "civilians"
  tally: Record<string, number>
}

export type SpyData = {
  phase: SpyPhase
  players: Player[]
  order: string[]
  spyId: string
  category: string
  word: string
  choices: string[]
  revealIndex: number
  revealSeen: boolean
  voteIndex: number
  votes: Record<string, string>
  discussionSeconds: number
  deadline: number | null
  outcome: SpyOutcome | null
  roundNumber: number
  scores: Record<string, number>
}
