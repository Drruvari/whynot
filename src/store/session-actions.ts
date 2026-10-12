import { useWobble } from "@/games/wobble/store"
import { useApp } from "@/store/app"
import { useBeerBomb } from "@/games/beer-bomb/store"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"

export function resetAllGames() {
  useWobble.getState().resetSession()
  useBeerBomb.getState().abandon()
  useRoulette.getState().abandon()
}

export function endNight() {
  resetAllGames()
  useSession.getState().clearPlayers()
  useApp.getState().goHome()
}

