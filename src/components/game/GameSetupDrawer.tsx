
import { GameButton } from "@/components/game/GameButton"
import { GameIcon } from "@/components/game/GameIcon"
import { getGame } from "@/games/catalog"
import { WobbleSetup } from "@/games/wobble/components/WobbleSetup"
import { SpySetup } from "@/games/spy/components/SpySetup"
import { RouletteSetup } from "@/games/roulette/components/RouletteSetup"
import { BeerBombSetup } from "@/games/beer-bomb/components/BeerBombSetup"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { cn } from "@/lib/utils"
import { useApp } from "@/store/app"
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

  const game = setupGameId ? getGame(setupGameId) : undefined
  const enoughPlayers = game ? players.length >= game.minPlayers : false
  const tooManyPlayers = game ? players.length > game.maxPlayers : false

  function play() {
    if (!game) {
      return
    }

    if (tooManyPlayers || !enoughPlayers) {
      haptic("warn")
      playSound("error")
      openPlayers()
      return
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



              {game.id !== "beer-bomb" && game.id !== "wobble" ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">Punishments</span>
                  <span className="bg-elevated px-3 py-1 font-pixel text-xs tracking-wider">MIXED</span>
                </div>
              ) : null}

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

            {game.id === "beer-bomb" ? (
              <BeerBombSetup
                key={setupGameId}
                playerIds={players.map((player) => player.id)}
                tooManyPlayers={tooManyPlayers}
                onNeedPlayers={openPlayers}
                onStarted={() => startGame("beer-bomb")}
              />
            ) : game.id === "roulette" ? (
              <RouletteSetup
                key={setupGameId}
                playerIds={players.map((player) => player.id)}
                tooManyPlayers={tooManyPlayers}
                onNeedPlayers={openPlayers}
                onStarted={() => startGame("roulette")}
              />
            ) : game.id === "spy" ? (
              <SpySetup
                key={setupGameId}
                tooManyPlayers={tooManyPlayers}
                onNeedPlayers={openPlayers}
                onStarted={() => startGame("spy")}
              />
            ) : game.id === "wobble" ? (
              <WobbleSetup key={setupGameId} playerIds={players.map((p) => p.id)} tooManyPlayers={tooManyPlayers} onNeedPlayers={openPlayers} onStarted={() => startGame("wobble")} />
            ) : (
              <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <GameButton tone="go" onClick={play}>
                  {!game.ready
                    ? "SOON"
                    : tooManyPlayers
                      ? `TOO MANY (MAX ${game.maxPlayers})`
                      : enoughPlayers
                        ? "PLAY"
                        : `NEED ${game.minPlayers}`}
                </GameButton>
              </DrawerFooter>
            )}
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}
