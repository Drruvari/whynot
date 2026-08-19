import { BeerBombGame } from "@/games/beer-bomb/BeerBombGame"
import { LiarGame } from "@/games/liar/LiarGame"
import { RouletteGame } from "@/games/roulette/RouletteGame"
import { SpyGame } from "@/games/spy/SpyGame"
import { VoteGame } from "@/games/vote/VoteGame"
import { getGame } from "@/games/catalog"
import { useApp } from "@/store/app"

export function PlayScreen() {
  const activeGameId = useApp((state) => state.activeGameId)
  const game = activeGameId ? getGame(activeGameId) : undefined

  if (!game) {
    return null
  }

  if (game.id === "beer-bomb") {
    return <BeerBombGame />
  }

  if (game.id === "spy") {
    return <SpyGame />
  }

  if (game.id === "roulette") {
    return <RouletteGame />
  }

  if (game.id === "vote") {
    return <VoteGame />
  }

  if (game.id === "liar") {
    return <LiarGame />
  }

  return null
}
