import { useRef, useState } from "react"
import { EyeIcon, FingerprintIcon, ShieldCheckIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { SpyData } from "../types"

export function RolePass({
  round, onSeen, onNext,
}: {
  round: SpyData
  onSeen: (playerId: string) => void
  onNext: (playerId: string) => void
}) {
  const player = round.players.find((p) => p.id === round.order[round.revealIndex])!
  const isSpy = player.id === round.spyId
  const [holding, setHolding] = useState(false)
  const startAt = useRef<number | null>(null)
  const reduceMotion = useGameMotion()

  function reveal() {
    if (startAt.current !== null) return
    startAt.current = performance.now()
    setHolding(true)
    haptic("tap")
    playSound("spyReveal")
  }

  function hide() {
    if (startAt.current === null) return
    const duration = performance.now() - startAt.current
    startAt.current = null
    setHolding(false)
    if (duration >= 250) onSeen(player.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-4 overflow-y-auto px-1 pb-2 text-center">
      <div className="mt-3">
        <p className="font-pixel text-sm tracking-widest text-muted-foreground">CLASSIFIED · {round.revealIndex + 1} / {round.order.length}</p>
        <p className="mt-6 font-display text-2xl font-extrabold">PASS THE PHONE TO</p>
        <div className="mt-5 flex justify-center"><PlayerToken player={player} size="lg" className="text-2xl" /></div>
        <p className="mt-4 text-sm text-muted-foreground">Only {player.name} should look at the screen.</p>
      </div>

      <div className={`spy-folder relative flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-4 overflow-hidden px-6 py-8 ${holding ? "spy-folder-open" : ""}`}>
        {holding ? (
          <div className="relative z-10 w-full" aria-live="off">
            {isSpy ? <FingerprintIcon weight="fill" size={54} className="mx-auto text-secret" /> : <ShieldCheckIcon weight="fill" size={54} className="mx-auto text-go" />}
            <p className="mt-5 font-pixel text-sm tracking-widest text-muted-foreground">YOUR ROLE</p>
            <p className={`mt-2 font-display text-4xl font-black ${isSpy ? "text-secret" : "text-go"}`}>{isSpy ? "YOU'RE THE SPY" : "CIVILIAN"}</p>
            <p className="mt-5 text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">CATEGORY: {round.category}</p>
            {isSpy ? (
              <p className="mt-4 text-base font-semibold">You don't know the word. Listen carefully and blend in.</p>
            ) : (
              <><p className="mt-3 break-words font-display text-3xl font-extrabold text-foreground">{round.word}</p><p className="mt-4 text-sm text-muted-foreground">Don't say the word out loud.</p></>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <EyeIcon size={62} weight="duotone" />
            <p className="font-pixel text-xl text-foreground">TOP SECRET</p>
            <p className="text-xs tracking-[0.15em] uppercase">Hold the button below to peek</p>
          </div>
        )}
      </div>

      <div className="w-full space-y-3">
        <motion.button type="button" onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          reveal()
        }} onPointerUp={hide} onPointerCancel={hide} onLostPointerCapture={hide}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (!event.repeat) reveal() } }}
          onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); hide() } }}
          onBlur={hide}
          aria-label="Hold to reveal your secret role"
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          className="flex min-h-16 w-full touch-none items-center justify-center gap-3 bg-secret px-4 font-display text-base font-bold text-white select-none">
          <FingerprintIcon weight="fill" size={26} /> {holding ? "RELEASE TO HIDE" : "HOLD TO REVEAL"}
        </motion.button>
        <GameButton disabled={!round.revealSeen || holding} tone="muted" onClick={() => onNext(player.id)}>
          {round.revealIndex + 1 === round.order.length ? "LET'S TALK" : "PASS TO NEXT"}
        </GameButton>
      </div>
    </div>
  )
}
