import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { Player, PlayerSymbol } from "@/lib/types"
import { identityMigrate } from "@/store/persist"

const PLAYER_COLORS = [
  "#C8F542",
  "#5CE1E6",
  "#FF6B9D",
  "#FF8A3D",
  "#A78BFA",
  "#F5D547",
  "#FF5C5C",
  "#7DD3FC",
]

const PLAYER_SYMBOLS: PlayerSymbol[] = [
  "circle",
  "diamond",
  "triangle",
  "square",
  "hex",
  "star",
]

function createPlayer(name: string, index: number): Player {
  return {
    id: crypto.randomUUID(),
    name,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    symbol: PLAYER_SYMBOLS[index % PLAYER_SYMBOLS.length],
  }
}

type SessionState = {
  players: Player[]
  addPlayer: (name: string) => Player | null
  removePlayer: (id: string) => void
  clearPlayers: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      players: [],
      addPlayer: (rawName) => {
        const name = rawName.trim().slice(0, 12)

        if (!name) {
          return null
        }

        if (
          get().players.some(
            (player) => player.name.toLowerCase() === name.toLowerCase()
          )
        ) {
          return null
        }

        const player = createPlayer(name, get().players.length)
        set({ players: [...get().players, player] })
        return player
      },
      removePlayer: (id) => {
        set({ players: get().players.filter((player) => player.id !== id) })
      },
      clearPlayers: () => {
        set({ players: [] })
      },
    }),
    { name: "whynot-session", version: 1, migrate: identityMigrate }
  )
)
