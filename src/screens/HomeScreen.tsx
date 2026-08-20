import { Gear, Plus } from "@phosphor-icons/react"
import { motion } from "motion/react"

import { GameIcon } from "@/components/game/GameIcon"
import { GameSetupDrawer } from "@/components/game/GameSetupDrawer"
import { PlayerToken } from "@/components/game/PlayerToken"
import { FEATURED_GAME, GRID_GAMES } from "@/games/catalog"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { GameDef } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import { useBeerBomb } from "@/store/beer-bomb"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"

const ARCADE_PRESS = { x: 2, y: 2 }

export function HomeScreen() {
  const players = useSession((state) => state.players)
  const openPlayers = useApp((state) => state.openPlayers)
  const goSettings = useApp((state) => state.goSettings)
  const openSetup = useApp((state) => state.openSetup)
  const startGame = useApp((state) => state.startGame)
  const beerBomb = useBeerBomb()
  const roulette = useRoulette()
  const reduceMotion = useGameMotion()

  const continueTarget =
    beerBomb.inProgress &&
    beerBomb.phase !== "night-over" &&
    beerBomb.cells.length > 0
      ? {
          id: "beer-bomb" as const,
          label: `BEER BOMB / R${String(beerBomb.round).padStart(2, "0")}`,
        }
      : roulette.inProgress && roulette.chambers.length > 0
        ? { id: "roulette" as const, label: "ROULETTE" }
        : null

  function selectGame(game: GameDef) {
    haptic("tap")
    playSound("select")
    if (players.length === 0) {
      openPlayers()
      return
    }
    openSetup(game.id)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <header className="flex h-12 items-center justify-between">
        <h1 className="font-display text-[1.65rem] font-extrabold tracking-[0.22em]">
          WHYNOT
        </h1>
        <button
          type="button"
          aria-label="Settings"
          onClick={goSettings}
          className="flex size-11 items-center justify-center text-muted-foreground"
        >
          <Gear weight="fill" size={22} />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="mt-5 font-display text-[2.35rem] leading-[0.92] font-extrabold tracking-tight uppercase">
          What are we
          <br />
          playing?
        </p>

        <div className="mt-6">
          <GameCard
            game={FEATURED_GAME}
            featured
            reduceMotion={Boolean(reduceMotion)}
            onSelect={() => selectGame(FEATURED_GAME)}
          />
        </div>

        {continueTarget ? (
          <button
            type="button"
            onClick={() => {
              haptic("tap")
              playSound("select")
              startGame(continueTarget.id)
            }}
            className="mt-2 flex w-full items-center justify-between bg-elevated p-4 text-left active:translate-[2px]"
          >
            <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Continue
            </span>
            <span className="font-pixel text-sm">{continueTarget.label}</span>
          </button>
        ) : null}

        <div className="mt-2 grid grid-cols-2 gap-2">
          {GRID_GAMES.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              reduceMotion={Boolean(reduceMotion)}
              onSelect={() => selectGame(game)}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={openPlayers}
        className={cn(
          "mt-3 flex min-h-14 w-full items-center gap-3 bg-card px-4 text-left active:translate-[2px]",
          players.length > 0 && "border-l-[3px] border-l-go"
        )}
      >
        {players.length === 0 ? (
          <span className="flex-1 text-sm font-semibold tracking-[0.18em] uppercase">
            Add players
          </span>
        ) : (
          <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
            {players.slice(0, 4).map((player) => (
              <PlayerToken key={player.id} player={player} size="sm" />
            ))}
            {players.length > 4 ? (
              <span className="text-xs text-muted-foreground">
                +{players.length - 4}
              </span>
            ) : null}
          </span>
        )}
        <Plus weight="fill" size={18} className="text-go" />
      </button>

      <GameSetupDrawer />
    </div>
  )
}

function GameCard({
  game,
  featured,
  reduceMotion,
  onSelect,
}: {
  game: GameDef
  featured?: boolean
  reduceMotion: boolean
  onSelect: () => void
}) {
  const accent =
    game.accent === "danger"
      ? "text-danger"
      : game.accent === "secret"
        ? "text-secret"
        : game.accent === "warn"
          ? "text-warn"
          : "text-go"

  return (
    <motion.button
      type="button"
      whileTap={reduceMotion ? undefined : ARCADE_PRESS}
      onClick={onSelect}
      className={cn(
        "game-card flex w-full flex-col bg-card text-left",
        featured ? "min-h-48 justify-between p-5" : "min-h-40 p-4"
      )}
    >
      <GameIcon id={game.id} size={featured ? 48 : 32} className={accent} />
      <span className="mt-auto">
        <span className="mt-6 block font-display text-xl font-extrabold tracking-tight">
          {game.name}
        </span>
        <span
          className={cn(
            "mt-1 block text-xs font-medium tracking-[0.14em] uppercase",
            accent
          )}
        >
          {game.vibe} / {game.players}
        </span>
      </span>
    </motion.button>
  )
}
