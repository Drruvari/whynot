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
  const [minutes, setMinutes] = useState(() => useSpy.getState().discussionSeconds / 60)

  function play() {
    if (tooManyPlayers) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    if (!start(undefined, minutes * 60)) {
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
            <button key={option} type="button" aria-pressed={minutes === option / 60}
              onClick={() => { haptic("tap"); setMinutes(option / 60) }}
              className={`min-h-12 font-pixel text-sm transition-colors ${minutes === option / 60 ? "bg-secret text-white" : "bg-elevated text-foreground"}`}>
              {option / 60} MIN
            </button>
          ))}
        </div>
        <label htmlFor="spy-minutes" className="mt-4 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">Custom minutes (1–30)</label>
        <input id="spy-minutes" type="number" inputMode="numeric" min={1} max={30} step={1} value={minutes} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) setMinutes(Math.max(1, Math.min(30, Math.round(value)))) }} className="mt-2 min-h-12 w-full bg-elevated px-4 font-pixel text-lg text-foreground" />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          One spy, one secret word. Civilians know the word. The spy only knows the category.
          Discuss and accuse each other out loud. Reveal the spy when you are ready, then deal a new round.
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
