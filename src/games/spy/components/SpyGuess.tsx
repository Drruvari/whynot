import { useState } from "react"
import { EyeIcon, TargetIcon } from "@phosphor-icons/react"
import { GameButton } from "@/components/game/GameButton"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { SpyData } from "../types"

export function SpyGuess({ round, onGuess }: { round: SpyData; onGuess: (word: string) => void }) {
  const [selection, setSelection] = useState<string | null>(null)
  const spy = round.players.find((player) => player.id === round.spyId)!
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-3 overflow-y-auto pb-2 text-center">
      <div className="mt-3"><p className="font-pixel text-xs tracking-widest text-muted-foreground">FINAL CHANCE</p>
        <TargetIcon size={76} weight="fill" className="mx-auto mt-5 text-secret" />
        <h1 className="mt-4 font-display text-3xl font-extrabold">SPY CAUGHT!</h1>
        <p className="mt-3 text-base font-bold">{spy.name}, they found you.</p>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">Guess the secret word and steal the win. One guess only.</p>
      </div>
      <div className="w-full flex-1 space-y-3 py-3">
        <p className="font-pixel text-xs tracking-widest text-muted-foreground">CATEGORY: {round.category.toUpperCase()}</p>
        <div className="grid grid-cols-2 gap-3">
          {round.choices.map((choice, i) => (
            <button type="button" key={choice} onClick={() => { haptic("tap"); setSelection(choice) }} aria-pressed={selection === choice}
              className={`min-h-24 border-2 px-3 py-4 font-display text-sm font-bold break-words ${selection === choice ? "border-secret bg-secret text-white" : "border-border bg-card"}`}>
              <span className="mb-2 block font-pixel text-xs opacity-60">0{i + 1}</span>{choice}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full"><GameButton tone="secret" disabled={!selection} onClick={() => {
        if (!selection) return
        playSound("voteReveal")
        haptic("success")
        onGuess(selection)
      }}><EyeIcon weight="fill" size={20} /> LOCK FINAL GUESS</GameButton></div>
    </div>
  )
}
