import { useState } from "react"
import { Minus, Plus } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { GameIcon } from "@/components/game/GameIcon"
import { FEATURED_GAME, getGame } from "@/games/catalog"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
import { useBeerBomb } from "@/store/beer-bomb"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"

function suggestedBombs(playerCount: number) {
  return Math.min(4, Math.max(1, Math.ceil(playerCount / 3)))
}

export function GameSetupDrawer() {
  const setupGameId = useApp((state) => state.setupGameId)
  const closeSetup = useApp((state) => state.closeSetup)
  const startGame = useApp((state) => state.startGame)
  const openPlayers = useApp((state) => state.openPlayers)
  const soundOn = useApp((state) => state.soundOn)
  const setSoundOn = useApp((state) => state.setSoundOn)
  const players = useSession((state) => state.players)
  const startBeerBomb = useBeerBomb((state) => state.start)
  const startRoulette = useRoulette((state) => state.start)
  const [bombs, setBombs] = useState(2)
  const [chambers, setChambers] = useState(6)
  const [bullets, setBullets] = useState(1)
  const [seededFor, setSeededFor] = useState<string | null>(null)

  const game = setupGameId ? getGame(setupGameId) : undefined
  const enoughPlayers = game ? players.length >= game.minPlayers : false
  const tooManyPlayers = game ? players.length > game.maxPlayers : false

  if (setupGameId !== seededFor) {
    setSeededFor(setupGameId)
    if (setupGameId) {
      const playerCount = useSession.getState().players.length
      const beer = useBeerBomb.getState()
      const roulette = useRoulette.getState()
      setBombs(beer.bombCount > 0 ? beer.bombCount : suggestedBombs(playerCount))
      setChambers(roulette.chamberCount || 6)
      setBullets(
        Math.min(roulette.bullets || 1, (roulette.chamberCount || 6) - 1)
      )
    }
  }

  function play() {
    if (!game) {
      return
    }

    if (tooManyPlayers) {
      haptic("warn")
      playSound("error")
      openPlayers()
      return
    }

    if (!enoughPlayers) {
      haptic("warn")
      playSound("error")
      openPlayers()
      return
    }

    if (game.id === "beer-bomb") {
      startBeerBomb(bombs)
    }

    if (game.id === "roulette") {
      startRoulette(chambers, Math.min(bullets, chambers - 1))
    }

    haptic("success")
    playSound("roundStart")
    startGame(game.id)
  }

  const accentText =
    game?.accent === "danger"
      ? "text-danger"
      : game?.accent === "secret"
        ? "text-secret"
        : game?.accent === "warn"
          ? "text-warn"
          : "text-go"

  return (
    <Drawer
      open={setupGameId !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeSetup()
        }
      }}
      showSwipeHandle
    >
      <DrawerContent className="rounded-none bg-card">
        {game ? (
          <>
            <DrawerHeader className="px-5 pt-2 text-left">
              <GameIcon id={game.id} size={40} className="text-foreground" />
              <DrawerTitle className="font-display text-3xl font-extrabold tracking-tight">
                {game.name}
              </DrawerTitle>
              <DrawerDescription className="text-xs font-medium tracking-[0.14em] uppercase">
                {game.vibe} / {game.players}
              </DrawerDescription>
            </DrawerHeader>

            <div className="mx-5 mt-4 bg-elevated px-4 py-3">
              <p className="text-sm/relaxed">{game.howTo}</p>
              {game.tip ? (
                <p className="mt-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Tip: {game.tip}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-5 px-5 py-6">
              <button
                type="button"
                onClick={openPlayers}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Players
                </span>
                <span
                  className={cn(
                    "font-pixel text-lg",
                    tooManyPlayers && "text-danger"
                  )}
                >
                  {players.length}
                </span>
              </button>

              {game.id === "beer-bomb" ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    Bombs
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="flex size-11 items-center justify-center bg-elevated"
                      onClick={() => setBombs((value) => Math.max(1, value - 1))}
                    >
                      <Minus weight="fill" size={16} />
                    </button>
                    <span
                      className={cn(
                        "w-6 text-center font-pixel text-2xl",
                        accentText
                      )}
                    >
                      {bombs}
                    </span>
                    <button
                      type="button"
                      className="flex size-11 items-center justify-center bg-elevated"
                      onClick={() => setBombs((value) => Math.min(4, value + 1))}
                    >
                      <Plus weight="fill" size={16} />
                    </button>
                  </div>
                </div>
              ) : null}

              {game.id === "roulette" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                      Chambers
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex size-11 items-center justify-center bg-elevated"
                        onClick={() =>
                          setChambers((value) => Math.max(4, value - 1))
                        }
                      >
                        <Minus weight="fill" size={16} />
                      </button>
                      <span
                        className={cn(
                          "w-6 text-center font-pixel text-2xl",
                          accentText
                        )}
                      >
                        {chambers}
                      </span>
                      <button
                        type="button"
                        className="flex size-11 items-center justify-center bg-elevated"
                        onClick={() =>
                          setChambers((value) => Math.min(8, value + 1))
                        }
                      >
                        <Plus weight="fill" size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                      Bullets
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="flex size-11 items-center justify-center bg-elevated"
                        onClick={() =>
                          setBullets((value) => Math.max(1, value - 1))
                        }
                      >
                        <Minus weight="fill" size={16} />
                      </button>
                      <span
                        className={cn(
                          "w-6 text-center font-pixel text-2xl",
                          accentText
                        )}
                      >
                        {bullets}
                      </span>
                      <button
                        type="button"
                        className="flex size-11 items-center justify-center bg-elevated"
                        onClick={() =>
                          setBullets((value) =>
                            Math.min(chambers - 1, value + 1)
                          )
                        }
                      >
                        <Plus weight="fill" size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Punishments
                </span>
                <span className="bg-elevated px-3 py-1 font-pixel text-xs tracking-wider">
                  MIXED
                </span>
              </div>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Sound
                </span>
                <Switch
                  checked={soundOn}
                  onCheckedChange={setSoundOn}
                  size="default"
                />
              </label>
            </div>

            <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <GameButton
                tone={game.id === FEATURED_GAME.id ? "danger" : "go"}
                onClick={play}
              >
                {!game.ready
                  ? "SOON"
                  : tooManyPlayers
                    ? `TOO MANY (MAX ${game.maxPlayers})`
                    : enoughPlayers
                      ? "PLAY"
                      : `NEED ${game.minPlayers}`}
              </GameButton>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
