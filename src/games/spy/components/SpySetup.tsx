import { useState } from "react"
import { GameButton } from "@/components/game/GameButton"
import { DrawerFooter } from "@/components/ui/drawer"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { DISCUSSION_OPTIONS, MAX_PLAYERS, MIN_PLAYERS } from "../rules"
import { useSpy } from "../store"

export function SpySetup({
  tooManyPlayers,
  onNeedPlayers,
  onStarted,
}: {
  tooManyPlayers: boolean
  onNeedPlayers: () => void
  onStarted: () => void
}) {
  const start = useSpy((state) => state.start)
  const [seconds, setSeconds] = useState(() => useSpy.getState().discussionSeconds)

  function play() {
    if (tooManyPlayers) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    if (!start(undefined, seconds)) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    haptic("success")
    playSound("roundStart")
    onStarted()
  }

  return (
    <>
      <div className="px-5 pt-2">
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">Discussion time</p>
        <div className="grid grid-cols-4 gap-2">
          {DISCUSSION_OPTIONS.map((option) => (
            <button key={option} type="button" aria-pressed={seconds === option}
              onClick={() => { haptic("tap"); setSeconds(option) }}
              className={`min-h-12 font-pixel text-sm transition-colors ${seconds === option ? "bg-secret text-white" : "bg-elevated text-foreground"}`}>
              {option === 90 ? "1:30" : `${option / 60}:00`}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          One spy, one secret word. Civilians know the word. The spy only knows the category.
          Question each other, vote privately, then give the spy one last chance to guess.
        </p>
      </div>
      <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <GameButton tone="secret" onClick={play}>
          {tooManyPlayers ? `MAX ${MAX_PLAYERS} PLAYERS` : `DEAL ROLES · ${MIN_PLAYERS}–${MAX_PLAYERS}`}
        </GameButton>
      </DrawerFooter>
    </>
  )
}
