import { create } from "zustand"
import { persist } from "zustand/middleware"

import { pickRandom, shuffle } from "@/lib/shuffle"
import { identityMigrate } from "@/store/persist"

export type BeerCell = {
  id: string
  bomb: boolean
  opened: boolean
}

export type BeerBombPhase = "play" | "result" | "round-over" | "night-over"

type LastHit = {
  playerId: string
  kind: "safe" | "bomb"
  drinks: number
}

type BeerBombState = {
  inProgress: boolean
  phase: BeerBombPhase
  round: number
  totalRounds: number
  bombCount: number
  cells: BeerCell[]
  turnIndex: number
  lastHit: LastHit | null
  streakPlayerId: string | null
  streakCount: number
  bombHits: Record<string, number>
  drinks: Record<string, number>
  start: (bombCount: number) => void
  pick: (cellId: string, playerId: string) => void
  continueAfterResult: () => void
  nextRound: () => void
  abandon: () => void
}

const BEER_COUNT = 10

function deal(bombCount: number): BeerCell[] {
  const bombIndexes = new Set(
    shuffle(Array.from({ length: BEER_COUNT }, (_, index) => index)).slice(
      0,
      bombCount
    )
  )

  return Array.from({ length: BEER_COUNT }, (_, index) => ({
    id: crypto.randomUUID(),
    bomb: bombIndexes.has(index),
    opened: false,
  }))
}

export const useBeerBomb = create<BeerBombState>()(
  persist(
    (set, get) => ({
      inProgress: false,
      phase: "play",
      round: 1,
      totalRounds: 6,
      bombCount: 2,
      cells: [],
      turnIndex: 0,
      lastHit: null,
      streakPlayerId: null,
      streakCount: 0,
      bombHits: {},
      drinks: {},
      start: (bombCount) => {
        set({
          inProgress: true,
          phase: "play",
          round: 1,
          bombCount,
          cells: deal(bombCount),
          turnIndex: 0,
          lastHit: null,
          streakPlayerId: null,
          streakCount: 0,
          bombHits: {},
          drinks: {},
        })
      },
      pick: (cellId, playerId) => {
        const state = get()
        const cell = state.cells.find((item) => item.id === cellId)

        if (!cell || cell.opened || state.phase !== "play") {
          return
        }

        const cells = state.cells.map((item) =>
          item.id === cellId ? { ...item, opened: true } : item
        )

        if (cell.bomb) {
          const sips = pickRandom([1, 2, 2, 3])
          const streakPlayerId = playerId
          const streakCount =
            state.streakPlayerId === playerId ? state.streakCount + 1 : 1

          set({
            cells,
            lastHit: {
              playerId,
              kind: "bomb",
              drinks: sips,
            },
            phase: "result",
            streakPlayerId,
            streakCount,
            bombHits: {
              ...state.bombHits,
              [playerId]: (state.bombHits[playerId] ?? 0) + 1,
            },
            drinks: {
              ...state.drinks,
              [playerId]: (state.drinks[playerId] ?? 0) + sips,
            },
          })
          return
        }

        const remaining = cells.filter((item) => !item.opened)

        set({
          cells,
          lastHit: { playerId, kind: "safe", drinks: 0 },
          turnIndex: state.turnIndex + 1,
          phase: remaining.length === 0 ? "round-over" : "play",
        })
      },
      continueAfterResult: () => {
        const state = get()
        const remaining = state.cells.filter((cell) => !cell.opened)
        const bombsLeft = remaining.filter((cell) => cell.bomb).length

        if (remaining.length === 0 || bombsLeft === 0) {
          set({ phase: "round-over" })
          return
        }

        set({
          phase: "play",
          turnIndex: state.turnIndex + 1,
          lastHit: null,
        })
      },
      nextRound: () => {
        const state = get()

        if (state.round >= state.totalRounds) {
          set({ phase: "night-over", inProgress: false })
          return
        }

        set({
          phase: "play",
          round: state.round + 1,
          cells: deal(state.bombCount),
          lastHit: null,
        })
      },
      abandon: () => {
        set({
          inProgress: false,
          phase: "play",
          cells: [],
          lastHit: null,
        })
      },
    }),
    { name: "whynot-beer-bomb", version: 1, migrate: identityMigrate }
  )
)
