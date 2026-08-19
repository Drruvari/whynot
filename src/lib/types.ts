export type PlayerSymbol =
  | "circle"
  | "diamond"
  | "triangle"
  | "square"
  | "hex"
  | "star"

export type Player = {
  id: string
  name: string
  color: string
  symbol: PlayerSymbol
}

export type GameId = "beer-bomb" | "spy" | "roulette" | "vote" | "liar"

export type Screen = "home" | "settings" | "play"

export type MotionPref = "system" | "full" | "reduced"

export type GameDef = {
  id: GameId
  name: string
  vibe: string
  players: string
  minPlayers: number
  maxPlayers: number
  ready: boolean
  featured?: boolean
  accent: "go" | "danger" | "secret" | "warn"
}
