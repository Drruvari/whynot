import { useApp } from "@/store/app"
import { useBeerBomb } from "@/store/beer-bomb"
import { useLiar } from "@/store/liar"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"
import { useVote } from "@/store/vote"

export function resetAllGames() {
  useBeerBomb.getState().abandon()
  useRoulette.getState().abandon()
  useLiar.getState().reset()
  useVote.getState().reset()
}

export function endNight() {
  resetAllGames()
  useSession.getState().clearPlayers()
  useApp.getState().goHome()
}
