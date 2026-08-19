import type { GameDef, GameId } from "@/lib/types"

export const GAMES: GameDef[] = [
  {
    id: "beer-bomb",
    name: "BEER BOMB",
    vibe: "Luck",
    players: "2–10",
    minPlayers: 2,
    maxPlayers: 10,
    ready: true,
    featured: true,
    accent: "danger",
  },
  {
    id: "spy",
    name: "SPY",
    vibe: "Bluff",
    players: "3–10",
    minPlayers: 3,
    maxPlayers: 10,
    ready: true,
    accent: "secret",
  },
  {
    id: "roulette",
    name: "ROULETTE",
    vibe: "Luck",
    players: "2–8",
    minPlayers: 2,
    maxPlayers: 8,
    ready: true,
    accent: "warn",
  },
  {
    id: "vote",
    name: "VOTE",
    vibe: "Chaos",
    players: "3–12",
    minPlayers: 3,
    maxPlayers: 12,
    ready: true,
    accent: "go",
  },
  {
    id: "liar",
    name: "LIAR",
    vibe: "Bluff",
    players: "3–8",
    minPlayers: 3,
    maxPlayers: 8,
    ready: true,
    accent: "secret",
  },
]

export const FEATURED_GAME = GAMES.find((game) => game.featured) ?? GAMES[0]

export const GRID_GAMES = GAMES.filter((game) => !game.featured)

export function getGame(id: GameId) {
  return GAMES.find((game) => game.id === id)
}
