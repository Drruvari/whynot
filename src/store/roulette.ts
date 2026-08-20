import { create } from "zustand"
import { persist } from "zustand/middleware"

import { shuffle } from "@/lib/shuffle"
import { identityMigrate } from "@/store/persist"

export type RoulettePhase = "aim" | "result" | "spin"

type RouletteState = {
  inProgress: boolean
  phase: RoulettePhase
  chamberCount: number
  bullets: number
  chambers: boolean[]
  index: number
  turnIndex: number
  lastBang: boolean
  bangs: Record<string, number>
  start: (chamberCount: number, bullets: number) => void
  fire: (playerId: string) => void
  continueAfterResult: () => void
  abandon: () => void
}

function deal(chamberCount: number, bullets: number) {
  const loaded = new Set(
    shuffle(Array.from({ length: chamberCount }, (_, index) => index)).slice(
      0,
      bullets
    )
  )

  return Array.from({ length: chamberCount }, (_, index) => loaded.has(index))
}

export const useRoulette = create<RouletteState>()(
  persist(
    (set, get) => ({
      inProgress: false,
      phase: "aim",
      chamberCount: 6,
      bullets: 1,
      chambers: [],
      index: 0,
      turnIndex: 0,
      lastBang: false,
      bangs: {},
      start: (chamberCount, bullets) => {
        set({
          inProgress: true,
          phase: "aim",
          chamberCount,
          bullets,
          chambers: deal(chamberCount, bullets),
          index: 0,
          turnIndex: 0,
          lastBang: false,
          bangs: {},
        })
      },
      fire: (playerId) => {
        const state = get()

        if (state.phase !== "aim" || state.chambers.length === 0) {
          return
        }

        const bang = Boolean(state.chambers[state.index])
        const nextIndex = (state.index + 1) % state.chamberCount
        const remaining = state.chambers.map((loaded, index) =>
          index === state.index ? false : loaded
        )
        const liveLeft = remaining.some(Boolean)

        set({
          lastBang: bang,
          phase: "result",
          index: nextIndex,
          chambers: remaining,
          bangs: bang
            ? { ...state.bangs, [playerId]: (state.bangs[playerId] ?? 0) + 1 }
            : state.bangs,
          turnIndex: bang || !liveLeft ? state.turnIndex : state.turnIndex + 1,
        })
      },
      continueAfterResult: () => {
        const state = get()
        const liveLeft = state.chambers.some(Boolean)
        const empty = state.chambers.every((loaded) => !loaded)

        if (state.lastBang || empty || !liveLeft) {
          set({
            phase: "aim",
            chambers: deal(state.chamberCount, state.bullets),
            index: 0,
            turnIndex: state.turnIndex + 1,
            lastBang: false,
          })
          return
        }

        set({ phase: "aim", lastBang: false })
      },
      abandon: () => {
        set({
          inProgress: false,
          phase: "aim",
          chambers: [],
          lastBang: false,
        })
      },
    }),
    { name: "whynot-roulette", version: 1, migrate: identityMigrate }
  )
)
