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
      "10 beers, hidden bombs. Take turns picking one — safe and it's the next player's turn, bomb and you drink.",
    tip: "More bombs = faster, meaner rounds.",
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
    id: "vote",
    name: "VOTE",
    vibe: "Chaos",
    players: "3–12",
    minPlayers: 3,
    maxPlayers: 12,
    ready: true,
    accent: "go",
    howTo:
      "A prompt appears. Point at whoever fits it best. They drink. No arguing allowed.",
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
    howTo:
      "One player reads a claim out loud. Everyone else decides: true, or lying through their teeth?",
  },
]

export const FEATURED_GAME = GAMES.find((game) => game.featured) ?? GAMES[0]

export const GRID_GAMES = GAMES.filter((game) => !game.featured)

export function getGame(id: GameId) {
  return GAMES.find((game) => game.id === id)
}
