import { create } from "zustand"
import { persist } from "zustand/middleware"

import { identityMigrate } from "@/store/persist"

type LiarState = {
  caught: Record<string, number>
  believed: Record<string, number>
  recordVerdict: (playerId: string, calledLiar: boolean) => void
  reset: () => void
}

export const useLiar = create<LiarState>()(
  persist(
    (set, get) => ({
      caught: {},
      believed: {},
      recordVerdict: (playerId, calledLiar) => {
        const state = get()
        set(
          calledLiar
            ? {
                caught: {
                  ...state.caught,
                  [playerId]: (state.caught[playerId] ?? 0) + 1,
                },
              }
            : {
                believed: {
                  ...state.believed,
                  [playerId]: (state.believed[playerId] ?? 0) + 1,
                },
              }
        )
      },
      reset: () => set({ caught: {}, believed: {} }),
    }),
    { name: "whynot-liar", version: 1, migrate: identityMigrate }
  )
)
