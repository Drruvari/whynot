import { useEffect, useRef, useState } from "react"
import { ChatCircleDotsIcon, TimerIcon } from "@phosphor-icons/react"
import { GameButton } from "@/components/game/GameButton"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { remainingSeconds } from "../rules"
import type { SpyData } from "../types"

const QUESTIONS = [
  "Where would you find it?",
  "Is it better alone or with friends?",
  "What does it remind you of?",
  "When was the last time you saw one?",
  "Would you pay money for it?",
  "Would you bring it on holiday?",
  "Is it more fun than it looks?",
  "What's the first thing you think of?",
]

export function DiscussionClock({ round, onVote }: { round: SpyData; onVote: () => void }) {
  const [remaining, setRemaining] = useState(() => remainingSeconds(round))
  const lastTick = useRef<number | null>(null)
  useEffect(() => {
    const update = () => {
      const next = remainingSeconds(round)
      setRemaining(next)
      if (next === 0) { onVote(); return }
      if (next <= 5 && next !== lastTick.current) {
        lastTick.current = next
        haptic("tap")
        playSound(next <= 2 ? "tickFinal" : "tick")
      }
    }
    update()
    const interval = window.setInterval(update, 250)
    return () => window.clearInterval(interval)
  }, [round.deadline, round.phase, onVote])

  const minutes = Math.floor(remaining / 60)
  const seconds = String(remaining % 60).padStart(2, "0")
  const progress = Math.min(1, remaining / round.discussionSeconds)
  const prompt = QUESTIONS[(round.roundNumber + Math.floor((round.discussionSeconds - remaining) / 25)) % QUESTIONS.length]

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-3 overflow-y-auto pb-2 text-center">
      <div className="mt-3 flex items-center gap-2 font-pixel text-sm tracking-widest text-muted-foreground"><ChatCircleDotsIcon size={20} /> INTERROGATION</div>
      <div className="flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <p className="font-display text-3xl font-extrabold uppercase">WHO'S FAKING?</p>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">Take turns asking questions. Keep the secret word secret.</p>
        <div className={`spy-clock mt-7 ${remaining <= 10 ? "spy-clock-danger" : ""}`}>
          <TimerIcon weight="fill" size={22} aria-hidden="true" />
          <output aria-label={`${minutes} minutes and ${remaining % 60} seconds remaining`} className="font-pixel text-6xl sm:text-7xl">{minutes}:{seconds}</output>
        </div>
        <div className="mt-4 h-2 w-full max-w-xs bg-elevated" role="progressbar" aria-valuenow={remaining} aria-valuemin={0} aria-valuemax={round.discussionSeconds} aria-label="Discussion time remaining">
          <div className="h-full bg-secret transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-8 w-full bg-card px-5 py-5">
          <p className="font-pixel text-xs tracking-widest text-muted-foreground">ASK SOMEONE</p>
          <p className="mt-3 font-display text-lg font-bold">{prompt}</p>
        </div>
      </div>
      <div className="w-full">
        <p className="mb-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Ready to accuse somebody?</p>
        <GameButton tone="secret" onClick={onVote}>START SECRET VOTE</GameButton>
      </div>
    </div>
  )
}
