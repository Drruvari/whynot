import { create } from "zustand"
import { persist } from "zustand/middleware"

import { identityMigrate } from "@/store/persist"
import { useSession } from "@/store/session"
import { MAX_PLAYERS, MIN_PLAYERS, acknowledgeResult, advanceRound, freshGame, selectBeer } from "./rules"
import type { BeerBombData, BeerBombHit } from "./types"

export type { BeerCell, BeerBombPhase } from "./types"

type BeerBombStore = BeerBombData & {
  start: (bombCount: number, playerIds: string[]) => boolean
  pick: (cellId: string, playerId: string) => BeerBombHit | null
  continueAfterResult: () => void
  nextRound: () => void
  abandon: () => void
}

const defaults: BeerBombData = {
  inProgress: false,
  phase: "play",
  round: 1,
  totalRounds: 6,
  bombCount: 2,
  cells: [],
  playerIds: [],
  turnIndex: 0,
  lastHit: null,
  streakPlayerId: null,
  streakCount: 0,
  bombHits: {},
  drinks: {},
}

export const useBeerBomb = create<BeerBombStore>()(
  persist(
    (set, get) => ({
      ...defaults,
      start: (bombCount, playerIds) => {
        const uniqueIds = [...new Set(playerIds.filter(Boolean))]
        if (uniqueIds.length < MIN_PLAYERS || uniqueIds.length > MAX_PLAYERS) return false
        set(freshGame(bombCount, uniqueIds))
        return true
      },
      pick: (cellId, playerId) => {
        const { next, hit } = selectBeer(get(), cellId, playerId)
        if (hit) set(next)
        return hit
      },
      continueAfterResult: () => set((state) => acknowledgeResult(state)),
      nextRound: () => set((state) => advanceRound(state)),
      abandon: () => set({ ...defaults, bombCount: get().bombCount }),
    }),
    {
      // Keep the previous key to preserve round history when upgrading.
      name: "whynot-beer-bomb",
      version: 1,
      migrate: identityMigrate,
      // Old saves had no playerIds; fall back to the current session in the UI.
      merge: (saved, current) => ({
        ...current,
        ...(saved && typeof saved === "object" ? saved : {}),
        playerIds: Array.isArray((saved as Partial<BeerBombData> | null)?.playerIds)
          ? (saved as BeerBombData).playerIds
          : (saved as Partial<BeerBombData> | null)?.inProgress
            ? useSession.getState().players.map((player) => player.id)
            : [],
      }),
      partialize: (state) => ({
        inProgress: state.inProgress,
        phase: state.phase,
        round: state.round,
        totalRounds: state.totalRounds,
        bombCount: state.bombCount,
        cells: state.cells,
        playerIds: state.playerIds,
        turnIndex: state.turnIndex,
        lastHit: state.lastHit,
        streakPlayerId: state.streakPlayerId,
        streakCount: state.streakCount,
        bombHits: state.bombHits,
        drinks: state.drinks,
      }),
    }
  )
)
