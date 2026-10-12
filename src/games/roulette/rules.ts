import type { RouletteData, RouletteShot } from "./types"

export const MIN_CHAMBERS = 4
export const MAX_CHAMBERS = 8
export const DEFAULT_CHAMBERS = 6
export const DEFAULT_BULLETS = 1
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8

export function clampChambers(input: number): number {
  return Number.isFinite(input)
    ? Math.min(MAX_CHAMBERS, Math.max(MIN_CHAMBERS, Math.round(input)))
    : DEFAULT_CHAMBERS
}

export function clampBullets(input: number, chamberCount: number): number {
  const max = clampChambers(chamberCount) - 1
  return Number.isFinite(input)
    ? Math.min(max, Math.max(1, Math.round(input)))
    : DEFAULT_BULLETS
}

export function suggestedBullets(chambers: number, playerCount: number): number {
  return clampBullets(Math.round(playerCount / 4), chambers)
}

/** Fisher–Yates: each possible loaded-chamber arrangement is equally likely. */
export function loadCylinder(
  chamberCount: number,
  bulletCount: number,
  random: () => number = Math.random
): boolean[] {
  const count = clampChambers(chamberCount)
  const bullets = clampBullets(bulletCount, count)
  const indices = Array.from({ length: count }, (_, index) => index)
  for (let i = count - 1; i > 0; i--) {
    const roll = random()
    const j = Math.min(i, Math.max(0, Math.floor((Number.isFinite(roll) ? roll : 0) * (i + 1))))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const loaded = new Set(indices.slice(0, bullets))
  return indices.map((_, index) => loaded.has(index))
}

export function newRoulette(
  chamberCount: number,
  bulletCount: number,
  playerIds: string[],
  random: () => number = Math.random
): RouletteData | null {
  const ids = [...new Set(playerIds.filter(Boolean))]
  if (ids.length < MIN_PLAYERS || ids.length > MAX_PLAYERS) return null
  const count = clampChambers(chamberCount)
  const bullets = clampBullets(bulletCount, count)
  return {
    inProgress: true,
    phase: "aim",
    chamberCount: count,
    bullets,
    chambers: loadCylinder(count, bullets, random),
    index: 0,
    shotsFired: 0,
    cylinderNumber: 1,
    turnIndex: 0,
    playerIds: ids,
    lastShot: null,
    bangs: {},
    pulls: {},
    totalShots: 0,
  }
}

export function currentShooterId(state: RouletteData): string | undefined {
  return state.playerIds.length > 0
    ? state.playerIds[state.turnIndex % state.playerIds.length]
    : undefined
}

/** A shot is atomic. Multiple taps or out-of-order player IDs are ignored. */
export function fireShot(
  state: RouletteData,
  playerId: string
): { next: RouletteData; shot: RouletteShot | null } {
  if (
    !state.inProgress || state.phase !== "aim" || !playerId ||
    playerId !== currentShooterId(state) ||
    state.chambers.length !== state.chamberCount ||
    state.shotsFired < 0 || state.shotsFired >= state.chamberCount ||
    state.index !== state.shotsFired
  ) return { next: state, shot: null }

  const bang = state.chambers[state.index] === true
  const shot: RouletteShot = {
    playerId,
    bang,
    chamber: state.index + 1,
    cylinder: state.cylinderNumber,
    shotNumber: state.totalShots + 1,
  }
  return {
    next: {
      ...state,
      phase: "result",
      lastShot: shot,
      shotsFired: state.shotsFired + 1,
      index: (state.index + 1) % state.chamberCount,
      totalShots: state.totalShots + 1,
      pulls: { ...state.pulls, [playerId]: (state.pulls[playerId] ?? 0) + 1 },
      bangs: bang
        ? { ...state.bangs, [playerId]: (state.bangs[playerId] ?? 0) + 1 }
        : state.bangs,
    },
    shot,
  }
}

export function willReload(state: RouletteData): boolean {
  return state.phase === "result" && Boolean(
    state.lastShot?.bang || state.shotsFired >= state.chamberCount
  )
}

/** The shooter remains visible until the result is acknowledged. */
export function acknowledgeShot(
  state: RouletteData,
  random: () => number = Math.random
): RouletteData {
  if (state.phase !== "result" || !state.lastShot) return state
  if (willReload(state)) {
    return {
      ...state,
      phase: "aim",
      turnIndex: state.turnIndex + 1,
      cylinderNumber: state.cylinderNumber + 1,
      chambers: loadCylinder(state.chamberCount, state.bullets, random),
      shotsFired: 0,
      index: 0,
      lastShot: null,
    }
  }
  return {
    ...state,
    phase: "aim",
    turnIndex: state.turnIndex + 1,
    lastShot: null,
  }
}
