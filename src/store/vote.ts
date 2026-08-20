import { create } from "zustand"
import { persist } from "zustand/middleware"

import { VOTE_PROMPTS } from "@/games/copy"
import { shuffle } from "@/lib/shuffle"
import { identityMigrate } from "@/store/persist"

type VoteState = {
  deck: number[]
  deckIndex: number
  tally: Record<string, number>
  drawPrompt: () => string
  recordVote: (playerId: string) => void
  reset: () => void
}

function freshDeck() {
  return shuffle(VOTE_PROMPTS.map((_, index) => index))
}

export const useVote = create<VoteState>()(
  persist(
    (set, get) => ({
      deck: freshDeck(),
      deckIndex: 0,
      tally: {},
      drawPrompt: () => {
        let { deck, deckIndex } = get()

        if (deckIndex >= deck.length) {
          deck = freshDeck()
          deckIndex = 0
        }

        const promptIndex = deck[deckIndex]
        set({ deck, deckIndex: deckIndex + 1 })
        return VOTE_PROMPTS[promptIndex]
      },
      recordVote: (playerId) => {
        const tally = get().tally
        set({ tally: { ...tally, [playerId]: (tally[playerId] ?? 0) + 1 } })
      },
      reset: () => set({ deck: freshDeck(), deckIndex: 0, tally: {} }),
    }),
    { name: "whynot-vote", version: 1, migrate: identityMigrate }
  )
)
