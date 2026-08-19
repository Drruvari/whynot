import { useBeerBomb } from "@/store/beer-bomb"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"
import { useApp } from "@/store/app"

export function resetAllGames() {
  useBeerBomb.getState().abandon()
  useRoulette.getState().abandon()
}

export function endNight() {
  resetAllGames()
  useSession.getState().clearPlayers()
  useApp.getState().goHome()
}
