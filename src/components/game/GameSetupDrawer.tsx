import { useState } from "react"
import { Minus, Plus } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { GameIcon } from "@/components/game/GameIcon"
import { FEATURED_GAME, getGame } from "@/games/catalog"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
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

  const game = setupGameId ? getGame(setupGameId) : undefined
  const enoughPlayers = game ? players.length >= game.minPlayers : false

  function play() {
    if (!game) {
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

            <div className="flex flex-col gap-5 px-5 py-6">
              <button
                type="button"
                onClick={openPlayers}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
                  Players
                </span>
                <span className="font-pixel text-lg">{players.length}</span>
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
                    <span className="w-6 text-center font-pixel text-2xl">
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
                      <span className="w-6 text-center font-pixel text-2xl">
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
                      <span className="w-6 text-center font-pixel text-2xl">
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
                {game.ready
                  ? enoughPlayers
                    ? "PLAY"
                    : `NEED ${game.minPlayers}`
                  : "SOON"}
              </GameButton>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
