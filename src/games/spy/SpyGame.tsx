import { useEffect, useState } from "react"
import { GameButton } from "@/components/game/GameButton"
import { GameHeader, GameScreen } from "@/components/game/GameScreen"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { DiscussionClock } from "./components/DiscussionClock"
import { RolePass } from "./components/RolePass"
import { MAX_PLAYERS, MIN_PLAYERS } from "./rules"
import { useSpy } from "./store"
import "./spy.css"

export function SpyGame() {
  const round = useSpy((state) => state.round)
  const start = useSpy((state) => state.start)
  const markSeen = useSpy((state) => state.markSeen)
  const nextViewer = useSpy((state) => state.nextViewer)
  const players = useSession((state) => state.players)
  const [revealed, setRevealed] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    if (!useSpy.getState().round) start()
  }, [start])

  function newRound() {
    setRevealed(false)
    setConfirmReset(false)
    haptic("success")
    playSound("roundStart")
    start()
  }

  function resetRound() {
    setConfirmReset(false)
    setRevealed(false)
    // A reset discards the current secret and starts with a fresh deal.
    start()
    haptic("tap")
  }

  return (
    <GameScreen>
      <GameHeader title="SPY" />
      {!round ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
          <h1 className="font-display text-3xl font-black">AGENT CHECK</h1>
          <p className="max-w-xs text-sm text-muted-foreground">You need {MIN_PLAYERS}–{MAX_PLAYERS} players.</p>
          <GameButton tone="secret" disabled={players.length < MIN_PLAYERS || players.length > MAX_PLAYERS} onClick={newRound}>START MISSION</GameButton>
        </div>
      ) : confirmReset ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <h1 className="font-display text-2xl font-black">RESET THIS ROUND?</h1>
          <p className="max-w-xs text-sm text-muted-foreground">The current roles and secret word will be discarded. Everyone must peek at their new role.</p>
          <div className="w-full space-y-3">
            <GameButton tone="secret" onClick={resetRound}>YES, DEAL NEW ROLES</GameButton>
            <GameButton tone="muted" onClick={() => setConfirmReset(false)}>CANCEL</GameButton>
          </div>
        </div>
      ) : round.phase === "reveal" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <RolePass key={`${round.roundNumber}:${round.revealIndex}`} round={round} onSeen={markSeen} onNext={nextViewer} />
          <button type="button" onClick={() => setConfirmReset(true)} className="mt-2 min-h-10 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Reset round</button>
        </div>
      ) : !revealed ? (
        <DiscussionClock round={round} onReveal={() => { setRevealed(true); haptic("success"); playSound("spyCaught") }} onReset={() => setConfirmReset(true)} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <p className="font-pixel text-xs tracking-widest text-muted-foreground">ROUND {round.roundNumber} · CASE CLOSED</p>
          <h1 className="font-display text-3xl font-black">THE SPY WAS</h1>
          <p className="font-display text-3xl font-extrabold text-secret">{round.players.find((p) => p.id === round.spyId)?.name}</p>
          <div className="w-full bg-card px-5 py-6">
            <p className="font-pixel text-xs tracking-widest text-muted-foreground">SECRET WORD · {round.category}</p>
            <p className="mt-3 font-display text-2xl font-bold">{round.word}</p>
          </div>
          <div className="w-full space-y-3">
            <GameButton tone="secret" onClick={newRound}>NEW ROUND</GameButton>
            <GameButton tone="muted" onClick={() => setConfirmReset(true)}>RESET ROUND</GameButton>
          </div>
        </div>
      )}
    </GameScreen>
  )
}
