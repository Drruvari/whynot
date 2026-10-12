import { useState } from "react"
import { LockKeyIcon, UserFocusIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"
import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { SpyData } from "../types"

export function PrivateBallot({ round, onVote }: { round: SpyData; onVote: (voterId: string, targetId: string) => void }) {
  const voterId = round.order[round.voteIndex]
  const voter = round.players.find((player) => player.id === voterId)!
  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const reduceMotion = useGameMotion()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 pb-2 text-center">
      <p className="mt-3 font-pixel text-xs tracking-widest text-muted-foreground">SECRET BALLOT · {round.voteIndex + 1} / {round.order.length}</p>
      {!ready ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
          <UserFocusIcon size={76} className="text-secret" weight="duotone" />
          <div><p className="font-display text-2xl font-extrabold">PASS TO</p><div className="mt-4 flex justify-center"><PlayerToken player={voter} size="lg" className="text-2xl" /></div></div>
          <p className="max-w-xs text-sm text-muted-foreground">Vote in private. Nobody will see your choice until all votes are counted.</p>
          <GameButton tone="secret" onClick={() => { setReady(true); haptic("tap") }}>I'M {voter.name.toUpperCase()}</GameButton>
        </div>
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl font-extrabold uppercase">WHO'S THE SPY?</h1>
            <p className="mt-2 text-sm text-muted-foreground">{voter.name}, choose one suspect. Not yourself.</p>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1" role="group" aria-label="Vote for the spy">
            {round.players.filter((p) => p.id !== voterId).map((player) => (
              <motion.button key={player.id} type="button" aria-pressed={selected === player.id}
                whileTap={reduceMotion ? undefined : { x: 2, y: 2 }}
                onClick={() => { setSelected(player.id); haptic("tap"); playSound("select") }}
                className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left ${selected === player.id ? "bg-secret text-white outline-2 outline-white/60" : "bg-card"}`}>
                <PlayerToken player={player} /> {selected === player.id ? <LockKeyIcon size={20} weight="fill" /> : null}
              </motion.button>
            ))}
          </div>
          <GameButton tone="secret" disabled={!selected} onClick={() => {
            if (!selected) return
            playSound("voteLock")
            haptic("success")
            onVote(voterId, selected)
          }}>LOCK MY VOTE</GameButton>
        </>
      )}
    </div>
  )
}
