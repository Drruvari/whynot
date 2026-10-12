import { create } from "zustand"
import { persist } from "zustand/middleware"
import { identityMigrate } from "@/store/persist"
import { isDifficulty, validPlayers } from "./rules"
import type { Difficulty, SavedRun } from "./types"

type WobbleStore = {
  difficulty: Difficulty
  playerIds: string[]
  sessionId: number
  bestScore: number
  bestHeight: number
  lastRun: SavedRun | null
  start: (difficulty: Difficulty, ids: string[]) => boolean
  finish: (run: SavedRun) => void
  resetSession: () => void
}

export const useWobble = create<WobbleStore>()(
  persist(
    (set) => ({
      difficulty: "breezy",
      playerIds: [],
      sessionId: 0,
      bestScore: 0,
      bestHeight: 0,
      lastRun: null,
      start: (difficulty, ids) => {
        if (!isDifficulty(difficulty) || !validPlayers(ids)) return false
        set((previous) => ({
          difficulty,
          playerIds: [...ids],
          sessionId: previous.sessionId + 1,
          lastRun: null,
        }))
        return true
      },
      finish: (run) => set((previous) => ({
        bestScore: Math.max(previous.bestScore, run.score),
        bestHeight: Math.max(previous.bestHeight, run.height),
        lastRun: run,
      })),
      resetSession: () => set({ playerIds: [], lastRun: null }),
    }),
    {
      name: "whynot-wobble",
      version: 1,
      migrate: identityMigrate,
      partialize: (state) => ({
        difficulty: state.difficulty,
        bestScore: state.bestScore,
        bestHeight: state.bestHeight,
      }),
    },
  ),
)
