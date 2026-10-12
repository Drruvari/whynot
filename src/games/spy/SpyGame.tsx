import { useEffect, useRef } from "react"
import { GameButton } from "@/components/game/GameButton"
import { GameHeader, GameScreen } from "@/components/game/GameScreen"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { DiscussionClock } from "./components/DiscussionClock"
import { PrivateBallot } from "./components/PrivateBallot"
import { RolePass } from "./components/RolePass"
import { SpyGuess } from "./components/SpyGuess"
import { SpyResults } from "./components/SpyResults"
import { MAX_PLAYERS, MIN_PLAYERS } from "./rules"
import { useSpy } from "./store"
import "./spy.css"

export function SpyGame() {
  const round = useSpy((state) => state.round)
  const start = useSpy((state) => state.start)
  const markSeen = useSpy((state) => state.markSeen)
  const nextViewer = useSpy((state) => state.nextViewer)
  const beginVoting = useSpy((state) => state.beginVoting)
  const vote = useSpy((state) => state.vote)
  const guess = useSpy((state) => state.guess)
  const players = useSession((state) => state.players)
  const lastResult = useRef<string | null>(null)

  // Compatibility with an older shared GameSetupDrawer that doesn't call start().
  useEffect(() => {
    if (!useSpy.getState().round) start()
  }, [start])

  useEffect(() => {
    if (round?.phase !== "result") return
    const key = `${round.roundNumber}:${round.outcome?.winner}`
    if (key === lastResult.current) return
    lastResult.current = key
    haptic("success")
    playSound(round.outcome?.winner === "civilians" ? "spyCaught" : "loser")
  }, [round?.phase, round?.roundNumber, round?.outcome?.winner])

  function startVote() {
    const current = useSpy.getState().round
    if (current?.phase !== "discussion") return
    haptic("success")
    playSound("voteReveal")
    beginVoting()
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="SPY" />
      {!round ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 text-center">
          <h1 className="font-display text-3xl font-black">AGENT CHECK</h1>
          <p className="max-w-xs text-sm text-muted-foreground">You need {MIN_PLAYERS}–{MAX_PLAYERS} players to start.</p>
          <GameButton tone="secret" disabled={players.length < MIN_PLAYERS || players.length > MAX_PLAYERS} onClick={() => start()}>START MISSION</GameButton>
        </div>
      ) : round.phase === "reveal" ? (
        <RolePass key={`${round.roundNumber}:${round.revealIndex}`} round={round} onSeen={markSeen} onNext={nextViewer} />
      ) : round.phase === "discussion" ? (
        <DiscussionClock round={round} onVote={startVote} />
      ) : round.phase === "vote" ? (
        <PrivateBallot key={`${round.roundNumber}:${round.voteIndex}`} round={round} onVote={vote} />
      ) : round.phase === "guess" ? (
        <SpyGuess round={round} onGuess={guess} />
      ) : (
        <SpyResults round={round} onAgain={() => { haptic("tap"); playSound("roundStart"); start() }} />
      )}
    </GameScreen>
  )
}
