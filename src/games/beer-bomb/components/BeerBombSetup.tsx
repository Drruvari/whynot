import { useState } from "react"
import { MinusIcon, PlusIcon } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { DrawerFooter } from "@/components/ui/drawer"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useBeerBomb } from "../store"
import { MAX_BOMBS, MIN_BOMBS, clampBombCount, suggestedBombs } from "../rules"

export function BeerBombSetup({
  playerIds,
  tooManyPlayers,
  onNeedPlayers,
  onStarted,
}: {
  playerIds: string[]
  tooManyPlayers: boolean
  onNeedPlayers: () => void
  onStarted: () => void
}) {
  const start = useBeerBomb((state) => state.start)
  const [bombs, setBombs] = useState(() => {
    const saved = useBeerBomb.getState()
    return saved.inProgress ? clampBombCount(saved.bombCount) : suggestedBombs(playerIds.length)
  })
  const enoughPlayers = playerIds.length >= 2 && !tooManyPlayers

  function play() {
    if (!enoughPlayers) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    if (start(bombs, playerIds)) {
      haptic("success")
      playSound("roundStart")
      onStarted()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-5 pt-1">
        <div className="flex min-h-14 items-center justify-between">
          <span className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">Hidden bombs</span>
          <div className="flex items-center gap-3">
            <button aria-label="Fewer bombs" type="button" disabled={bombs <= MIN_BOMBS}
              className="flex size-11 items-center justify-center bg-elevated disabled:opacity-40"
              onClick={() => setBombs((v) => Math.max(MIN_BOMBS, v - 1))}><MinusIcon weight="fill" size={16} /></button>
            <output className="w-6 text-center font-pixel text-2xl text-danger">{bombs}</output>
            <button aria-label="More bombs" type="button" disabled={bombs >= MAX_BOMBS}
              className="flex size-11 items-center justify-center bg-elevated disabled:opacity-40"
              onClick={() => setBombs((v) => Math.min(MAX_BOMBS, v + 1))}><PlusIcon weight="fill" size={16} /></button>
          </div>
        </div>
        <p className="text-xs tracking-wide text-muted-foreground">{bombs === 1 ? "1 sneaky bomb. Maximum suspense." : bombs === 4 ? "4 bombs. Absolute chaos." : `${bombs} bombs hiding in 10 beers.`}</p>
      </div>
      <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <GameButton tone="danger" onClick={play}>
          {tooManyPlayers ? "TOO MANY (MAX 10)" : enoughPlayers ? "LET'S PLAY" : "NEED 2 PLAYERS"}
        </GameButton>
      </DrawerFooter>
    </>
  )
}
