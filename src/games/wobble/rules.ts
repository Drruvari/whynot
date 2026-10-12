import type { Difficulty, Junk } from "./types"

export const WORLD_WIDTH = 420
export const PLATFORM_X = WORLD_WIDTH / 2
export const PLATFORM_Y = 640
export const PLATFORM_WIDTH = 278
export const PIECES_PER_STAGE = 5
export const MAX_PIECES = 100
export const JUNK: readonly Junk[] = ["crate", "plank", "barrel", "wedge", "fridge", "wheel", "tblock", "brick", "battery"]
export const JUNK_NAMES: Record<Junk, string> = {
  crate: "CRATE", plank: "PLANK", barrel: "BARREL", wedge: "WEDGE",
  fridge: "FRIDGE", wheel: "WHEEL", tblock: "T-BLOCK", brick: "BRICK", battery: "BATTERY", duck: "LUCKY DUCK",
}
export const JUNK_EMOJI: Record<Junk, string> = {
  crate: "📦", plank: "🪵", barrel: "🛢️", wedge: "🔺", fridge: "🧊",
  wheel: "🛞", tblock: "🧩", brick: "🧱", battery: "🔋", duck: "🦆",
}
export const JUNK_COLORS: Record<Junk, string> = {
  crate: "#dd9858", plank: "#f6c46f", barrel: "#f27168", wedge: "#ed9c6b",
  fridge: "#9fe2e1", wheel: "#55546f", tblock: "#ffcc5f", brick: "#d96665", battery: "#9bd5a0", duck: "#ffd659",
}
export function isDifficulty(value: unknown): value is Difficulty {
  return value === "chill" || value === "breezy" || value === "chaos"
}
export function windPower(difficulty: Difficulty): number {
  return difficulty === "chill" ? 0.08 : difficulty === "breezy" ? 0.28 : 0.52
}
export function clampAim(value: number): number {
  return Math.max(20, Math.min(WORLD_WIDTH - 20, value))
}
export function validPlayers(ids: string[]): boolean {
  return ids.length >= 1 && ids.length <= 10 && new Set(ids).size === ids.length && ids.every(Boolean)
}
export function makeStageQueue(random: () => number = Math.random): Junk[] {
  const shuffled = [...JUNK]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const n = Math.max(0, Math.min(0.999999, random()))
    const j = Math.floor(n * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return [...shuffled.slice(0, PIECES_PER_STAGE - 1), "duck"]
}
export function landingPoints(gain: number, turn: number, duck: boolean): number {
  const heightBonus = Math.round(Math.min(145, Math.max(0, gain)) * 2.5)
  const stageBonus = duck ? 300 + Math.floor(turn / PIECES_PER_STAGE) * 50 : 0
  return 80 + heightBonus + stageBonus + Math.min(160, Math.floor(turn / PIECES_PER_STAGE) * 18)
}
export function stageFromTurns(turns: number): number {
  return Math.floor(Math.max(0, turns) / PIECES_PER_STAGE) + 1
}
