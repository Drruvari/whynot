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
    howTo:
      "10 mystery beers, 1–4 hidden bombs. Take turns picking. A safe beer passes play; a bomb means a small sip or forfeit. Find every bomb to finish a round.",
    tip: "Six rounds. New hiding spots every round. No takebacks.",
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
    howTo:
      "Everyone gets a secret role except one Spy. Pass the phone, hold to peek, then vote who's faking it.",
    tip: "Spy: ask vague questions. Everyone else: get specific fast.",
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
    howTo:
      "One loaded cylinder, shared between the table. Pull the trigger — if it bangs, you drink and the cylinder resets.",
    tip: "More bullets = shorter fuses.",
  },
  {
    id: "wobble",
    name: "WOBBLE LAB",
    vibe: "Physics",
    players: "1–10",
    minPlayers: 1,
    maxPlayers: 10,
    ready: true,
    accent: "go",
    howTo: "Drop bizarre junk onto a seesaw raft. Stack high, survive the wind, and use two rescue pulses before the whole thing falls apart.",
    tip: "Drag to aim. Rotate before dropping. Pass the phone after each landing.",
  },
]

export const FEATURED_GAME = GAMES.find((game) => game.featured) ?? GAMES[0]

export const GRID_GAMES = GAMES.filter((game) => !game.featured)

export function getGame(id: GameId) {
  return GAMES.find((game) => game.id === id)
}

