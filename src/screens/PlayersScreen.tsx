import { useState } from "react"
import { PlusIcon, XIcon } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import { haptic } from "@/lib/haptic"
import { useApp } from "@/store/app"
import { useSession } from "@/store/session"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

export function PlayersDrawer() {
  const open = useApp((state) => state.playersOpen)
  const closePlayers = useApp((state) => state.closePlayers)
  const players = useSession((state) => state.players)
  const addPlayer = useSession((state) => state.addPlayer)
  const removePlayer = useSession((state) => state.removePlayer)
  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)

  function submit() {
    const player = addPlayer(name)
    if (!player) {
      haptic("warn")
      return
    }
    haptic("success")
    setName("")
    setAdding(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closePlayers()
          setAdding(false)
        }
      }}
      showSwipeHandle
    >
      <DrawerContent className="rounded-none bg-card">
        <DrawerHeader className="px-5 pt-2 text-left">
          <DrawerTitle className="font-display text-2xl font-extrabold tracking-tight">
            WHO'S PLAYING?
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex max-h-[50dvh] flex-col gap-2 overflow-y-auto px-5 py-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex min-h-14 items-center justify-between bg-elevated px-4"
            >
              <PlayerToken player={player} />
              <button
                type="button"
                aria-label={`Remove ${player.name}`}
                onClick={() => {
                  haptic("tap")
                  removePlayer(player.id)
                }}
                className="flex size-11 items-center justify-center text-muted-foreground"
              >
                <XIcon weight="fill" size={18} />
              </button>
            </div>
          ))}

          {adding || players.length === 0 ? (
            <form
              className="flex min-h-14 items-center gap-2 bg-elevated px-4"
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <input
                autoFocus
                value={name}
                maxLength={12}
                placeholder="NAME"
                onChange={(event) => setName(event.target.value)}
                className="h-12 min-w-0 flex-1 bg-transparent text-lg font-semibold tracking-wide uppercase outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="text-sm font-semibold tracking-wide text-go uppercase"
              >
                Add
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex min-h-14 items-center justify-center gap-2 bg-elevated text-sm font-semibold tracking-[0.16em] text-muted-foreground uppercase"
            >
              <PlusIcon weight="fill" size={16} />
              Add player
            </button>
          )}
        </div>

        <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <GameButton disabled={players.length < 2} onClick={closePlayers}>
            {players.length < 2 ? "NEED 2" : "LET'S GO"}
          </GameButton>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
