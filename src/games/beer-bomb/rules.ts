import type { BeerBombData, BeerBombHit, BeerCell } from "./types"

export const BEER_COUNT = 10
export const MIN_BOMBS = 1
export const MAX_BOMBS = 4
export const DEFAULT_BOMBS = 2
export const TOTAL_ROUNDS = 6
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 10
export const BOARD_ROWS = [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9]] as const

export function clampBombCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_BOMBS
  return Math.min(MAX_BOMBS, Math.max(MIN_BOMBS, Math.round(value)))
}

export function suggestedBombs(playerCount: number): number {
  return clampBombCount(Math.ceil(playerCount / 3))
}

/** Exactly 10 beers, with bomb positions shuffled uniformly. Injectable random for tests. */
export function deal(bombCount: number, random: () => number = Math.random): BeerCell[] {
  const indexes = Array.from({ length: BEER_COUNT }, (_, index) => index)
  for (let index = indexes.length - 1; index > 0; index--) {
    const j = Math.min(index, Math.max(0, Math.floor(random() * (index + 1))))
    ;[indexes[index], indexes[j]] = [indexes[j], indexes[index]]
  }
  const bombs = new Set(indexes.slice(0, clampBombCount(bombCount)))
  return Array.from({ length: BEER_COUNT }, (_, index) => ({
    id: `beer-${index}`,
    bomb: bombs.has(index),
    opened: false,
  }))
}

export function isRoundClear(cells: BeerCell[]): boolean {
  return cells.length > 0 && cells.every((cell) => !cell.bomb || cell.opened)
}

export function freshGame(bombCount: number, playerIds: string[], random = Math.random): BeerBombData {
  return {
    inProgress: true,
    phase: "play",
    round: 1,
    totalRounds: TOTAL_ROUNDS,
    bombCount: clampBombCount(bombCount),
    cells: deal(bombCount, random),
    playerIds: [...playerIds],
    turnIndex: 0,
    lastHit: null,
    streakPlayerId: null,
    streakCount: 0,
    bombHits: {},
    drinks: {},
  }
}

/** Pure transition: invalid, duplicate or out-of-turn selections do nothing. */
export function selectBeer(
  state: BeerBombData,
  cellId: string,
  playerId: string,
  random: () => number = Math.random
): { next: BeerBombData; hit: BeerBombHit | null } {
  const cell = state.cells.find((candidate) => candidate.id === cellId)
  const expected = state.playerIds[state.turnIndex % state.playerIds.length]
  if (
    !state.inProgress || state.phase !== "play" || !cell || cell.opened ||
    !playerId || (state.playerIds.length > 0 && playerId !== expected)
  ) {
    return { next: state, hit: null }
  }

  const cells = state.cells.map((candidate) =>
    candidate.id === cellId ? { ...candidate, opened: true } : candidate
  )

  if (!cell.bomb) {
    const hit: BeerBombHit = { playerId, kind: "safe", drinks: 0 }
    return {
      next: {
        ...state,
        cells,
        lastHit: hit,
        turnIndex: state.turnIndex + 1,
        phase: isRoundClear(cells) ? "round-over" : "play",
      },
      hit,
    }
  }

  // A short, intentionally modest penalty. Players can substitute any non-alcoholic forfeit.
  const drinks = [1, 2, 2, 3][Math.min(3, Math.max(0, Math.floor(random() * 4)))]
  const hit: BeerBombHit = { playerId, kind: "bomb", drinks }
  return {
    next: {
      ...state,
      cells,
      phase: "result",
      lastHit: hit,
      streakPlayerId: playerId,
      streakCount: state.streakPlayerId === playerId ? state.streakCount + 1 : 1,
      bombHits: { ...state.bombHits, [playerId]: (state.bombHits[playerId] ?? 0) + 1 },
      drinks: { ...state.drinks, [playerId]: (state.drinks[playerId] ?? 0) + drinks },
    },
    hit,
  }
}

export function acknowledgeResult(state: BeerBombData): BeerBombData {
  if (state.phase !== "result" || state.lastHit?.kind !== "bomb") return state
  if (isRoundClear(state.cells)) {
    return { ...state, phase: "round-over" }
  }
  return { ...state, phase: "play", turnIndex: state.turnIndex + 1, lastHit: null }
}

export function advanceRound(state: BeerBombData, random = Math.random): BeerBombData {
  if (state.phase !== "round-over") return state
  if (state.round >= state.totalRounds) {
    return { ...state, phase: "night-over", inProgress: false, lastHit: null }
  }
  return {
    ...state,
    phase: "play",
    round: state.round + 1,
    cells: deal(state.bombCount, random),
    lastHit: null,
  }
}
