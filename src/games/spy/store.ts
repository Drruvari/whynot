import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useSession } from "@/store/session"
import type { Player } from "@/lib/types"
import {
  beginVote, castVote, DEFAULT_DISCUSSION_SECONDS,
  guessWord, markRoleSeen, newSpyRound, nextRole,
} from "./rules"
import type { SpyData } from "./types"

type SpyStore = {
  round: SpyData | null
  discussionSeconds: number
  start: (players?: Player[], seconds?: number) => boolean
  markSeen: (playerId: string) => void
  nextViewer: (playerId: string) => void
  beginVoting: () => void
  vote: (voterId: string, targetId: string) => void
  guess: (word: string) => void
  reset: () => void
}

/** One persistent store owned by Spy; no Spy logic in global state. */
export const useSpy = create<SpyStore>()(
  persist(
    (set, get) => ({
      round: null,
      discussionSeconds: DEFAULT_DISCUSSION_SECONDS,
      start: (players = useSession.getState().players, seconds = get().discussionSeconds) => {
        const next = newSpyRound(players, seconds, get().round)
        if (!next) return false
        set({ round: next, discussionSeconds: next.discussionSeconds })
        return true
      },
      markSeen: (playerId) => set((state) => ({
        round: state.round ? markRoleSeen(state.round, playerId) : null,
      })),
      nextViewer: (playerId) => set((state) => ({
        round: state.round ? nextRole(state.round, playerId) : null,
      })),
      beginVoting: () => set((state) => ({
        round: state.round ? beginVote(state.round) : null,
      })),
      vote: (voterId, targetId) => set((state) => ({
        round: state.round ? castVote(state.round, voterId, targetId) : null,
      })),
      guess: (word) => set((state) => ({
        round: state.round ? guessWord(state.round, word) : null,
      })),
      reset: () => set({ round: null }),
    }),
    {
      name: "whynot-spy",
      version: 1,
      partialize: (state) => ({
        round: state.round,
        discussionSeconds: state.discussionSeconds,
      }),
      migrate: () => ({ round: null, discussionSeconds: DEFAULT_DISCUSSION_SECONDS }),
    }
  )
)
