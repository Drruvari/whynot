import { useState } from "react"
import { GameButton } from "@/components/game/GameButton"
import { DrawerFooter } from "@/components/ui/drawer"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useWobble } from "../store"
import type { Difficulty } from "../types"

const MODES: Array<{ value: Difficulty; label: string; desc: string }> = [
  { value: "chill", label: "CHILL", desc: "Gentle weather. Focus on your stack." },
  { value: "breezy", label: "BREEZY", desc: "A little crosswind. A lot more suspense." },
  { value: "chaos", label: "CHAOS", desc: "Wilder gusts. Build at your own risk." },
]

export function WobbleSetup({ playerIds, tooManyPlayers, onNeedPlayers, onStarted }: {
  playerIds: string[]
  tooManyPlayers: boolean
  onNeedPlayers: () => void
  onStarted: () => void
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(() => useWobble.getState().difficulty)
  const start = useWobble((state) => state.start)
  const canStart = playerIds.length > 0 && playerIds.length <= 10 && !tooManyPlayers

  function play() {
    if (!canStart) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    if (start(difficulty, playerIds)) {
      haptic("success")
      playSound("roundStart")
      onStarted()
    }
  }

  return (
    <>
      <div className="px-5 pb-3 pt-1">
        <p className="mb-3 text-xs font-semibold tracking-[.2em] text-muted-foreground uppercase">Tower difficulty</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((mode) => (
            <button key={mode.value} type="button" aria-pressed={difficulty === mode.value}
              onClick={() => { setDifficulty(mode.value); playSound("toggle"); haptic("tap") }}
              className={`min-h-12 border-2 px-1 font-pixel text-xs ${difficulty === mode.value ? "border-go bg-go text-black" : "border-border bg-elevated text-foreground"}`}>
              {mode.label}
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-9 text-xs tracking-wide text-muted-foreground">
          {MODES.find((mode) => mode.value === difficulty)?.desc} Drag the glowing item down to drop it.
        </p>
      </div>
      <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <GameButton onClick={play}>
          {tooManyPlayers ? "MAX 10 PLAYERS" : canStart ? "START STACKING" : "ADD A PLAYER"}
        </GameButton>
      </DrawerFooter>
    </>
  )
}
