import { create } from "zustand"
import { persist } from "zustand/middleware"

import { useSession } from "@/store/session"
import {
  DEFAULT_BULLETS,
  DEFAULT_CHAMBERS,
  acknowledgeShot,
  clampBullets,
  clampChambers,
  fireShot,
  loadCylinder,
  newRoulette,
} from "./rules"
import type { RouletteData, RouletteShot } from "./types"

export type { RoulettePhase, RouletteShot } from "./types"

type RouletteStore = RouletteData & {
  /** Player IDs can be omitted by the pre-refactor setup drawer. */
  start: (chambers: number, bullets: number, playerIds?: string[]) => boolean
  fire: (playerId: string) => RouletteShot | null
  continueAfterResult: () => void
  abandon: () => void
}

const initial: RouletteData = {
  inProgress: false,
  phase: "aim",
  chamberCount: DEFAULT_CHAMBERS,
  bullets: DEFAULT_BULLETS,
  chambers: [],
  index: 0,
  shotsFired: 0,
  cylinderNumber: 1,
  turnIndex: 0,
  playerIds: [],
  lastShot: null,
  bangs: {},
  pulls: {},
  totalShots: 0,
}

/** Previous saves advanced the turn before revealing a safe shot.
 * Give those saves a fresh cylinder rather than misattribute the old result.
 */
function migrateLegacy(saved: unknown): RouletteData {
  const old =
    saved && typeof saved === "object" ? (saved as Partial<RouletteData>) : {}
  const ids = useSession.getState().players.map((player) => player.id)
  const count = clampChambers(old.chamberCount ?? DEFAULT_CHAMBERS)
  const bullets = clampBullets(old.bullets ?? DEFAULT_BULLETS, count)
  const resumed = old.inProgress === true && ids.length >= 2 && ids.length <= 8
  return {
    ...initial,
    inProgress: resumed,
    chamberCount: count,
    bullets,
    playerIds: ids,
    chambers: resumed ? loadCylinder(count, bullets) : [],
    turnIndex:
      Number.isInteger(old.turnIndex) && (old.turnIndex ?? 0) >= 0
        ? old.turnIndex!
        : 0,
    bangs: old.bangs && typeof old.bangs === "object" ? old.bangs : {},
  }
}

export const useRoulette = create<RouletteStore>()(
  persist(
    (set, get) => ({
      ...initial,
      start: (
        chambers,
        bullets,
        playerIds = useSession.getState().players.map((p) => p.id)
      ) => {
        const game = newRoulette(chambers, bullets, playerIds)
        if (!game) return false
        set(game)
        return true
      },
      fire: (playerId) => {
        const { next, shot } = fireShot(get(), playerId)
        if (shot) set(next)
        return shot
      },
      continueAfterResult: () => {
        const current = get()
        const next = acknowledgeShot(current)
        if (next !== current) set(next)
      },
      abandon: () => {
        const { chamberCount, bullets } = get()
        set({ ...initial, chamberCount, bullets })
      },
    }),
    {
      name: "whynot-roulette", // preserve old localStorage key
      version: 2,
      migrate: (saved) => migrateLegacy(saved),
      partialize: (state) => ({
        inProgress: state.inProgress,
        phase: state.phase,
        chamberCount: state.chamberCount,
        bullets: state.bullets,
        chambers: state.chambers,
        index: state.index,
        shotsFired: state.shotsFired,
        cylinderNumber: state.cylinderNumber,
        turnIndex: state.turnIndex,
        playerIds: state.playerIds,
        lastShot: state.lastShot,
        bangs: state.bangs,
        pulls: state.pulls,
        totalShots: state.totalShots,
      }),
    }
  )
)
