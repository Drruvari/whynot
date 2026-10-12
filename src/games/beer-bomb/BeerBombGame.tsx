import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRightIcon, BombIcon, CheckCircleIcon } from "@phosphor-icons/react"

import { GameArea, GameHeader, GamePrompt, GameScreen, GameStatus } from "@/components/game/GameScreen"
import { GameButton } from "@/components/game/GameButton"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { BeerBoard } from "./components/BeerBoard"
import { BombReveal } from "./components/BombReveal"
import { NightResults } from "./components/NightResults"
import { useBeerBomb } from "./store"
import { BEER_COUNT, isRoundClear } from "./rules"
import "./beer-bomb.css"

const SAFE_LINES = ["CLEAN!", "PHEW!", "NICE PICK!", "SAFE!", "NOT TODAY!"] as const

export function BeerBombGame() {
  const players = useSession((state) => state.players)
  const reduceMotion = useGameMotion()
  const phase = useBeerBomb((state) => state.phase)
  const round = useBeerBomb((state) => state.round)
  const totalRounds = useBeerBomb((state) => state.totalRounds)
  const cells = useBeerBomb((state) => state.cells)
  const turnIndex = useBeerBomb((state) => state.turnIndex)
  const playerIds = useBeerBomb((state) => state.playerIds)
  const lastHit = useBeerBomb((state) => state.lastHit)
  const streakCount = useBeerBomb((state) => state.streakCount)
  const bombHits = useBeerBomb((state) => state.bombHits)
  const drinks = useBeerBomb((state) => state.drinks)
  const bombCount = useBeerBomb((state) => state.bombCount)
  const pick = useBeerBomb((state) => state.pick)
  const nextRound = useBeerBomb((state) => state.nextRound)
  const continueAfterResult = useBeerBomb((state) => state.continueAfterResult)
  const start = useBeerBomb((state) => state.start)
  const [safeToast, setSafeToast] = useState(0)

  useEffect(() => {
    if (!safeToast) return
    const timeout = window.setTimeout(() => setSafeToast(0), 700)
    return () => window.clearTimeout(timeout)
  }, [safeToast])

  // Legacy saved games may have no playerIds. Current games snapshot the turn order.
  const order = playerIds?.length ? playerIds : players.map((player) => player.id)
  const currentId = order.length ? order[turnIndex % order.length] : undefined
  const player = players.find((item) => item.id === currentId)
  const hitPlayer = players.find((item) => item.id === lastHit?.playerId)
  const remaining = cells.filter((cell) => !cell.opened).length
  const bombsRemaining = cells.filter((cell) => cell.bomb && !cell.opened).length
  const bombsFound = cells.filter((cell) => cell.bomb && cell.opened).length

  function handlePick(cellId: string) {
    if (!player || phase !== "play") return
    // Store validates the current turn and cell, including back-to-back taps.
    const hit = pick(cellId, player.id)
    if (!hit) return
    if (hit.kind === "bomb") {
      haptic("bomb")
      playSound("bomb")
      return
    }
    haptic("success")
    playSound("safe")
    setSafeToast((count) => count + 1)
  }

  function again() {
    start(bombCount, order)
  }

  if (players.length < 2 || !player && phase === "play" || cells.length !== BEER_COUNT && phase !== "night-over") {
    return (
      <GameScreen>
        <GameHeader title="BEER BOMB" />
        <GameArea><p className="text-center font-pixel text-sm text-muted-foreground">THIS GAME NEEDS ITS ORIGINAL PLAYERS. EXIT AND START A NEW GAME.</p></GameArea>
      </GameScreen>
    )
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="BEER BOMB" />
      {phase === "play" && player ? (
        <>
          <GamePrompt title={`${player.name}'S TURN`} subtitle="pick a beer. hope for the best." />
          <GameArea className="relative flex-col gap-5">
            <motion.p key={`round-${round}`} initial={reduceMotion ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="font-pixel text-sm tracking-[.12em] text-amber-500/90">ROUND {round} / {totalRounds}</motion.p>
            <BeerBoard cells={cells} disabled={phase !== "play"} reduceMotion={Boolean(reduceMotion)} onPick={(cell) => handlePick(cell.id)} />
            <p className="text-center text-xs font-semibold tracking-[.17em] text-muted-foreground uppercase">no takebacks. no peeking.</p>
          </GameArea>
          <GameStatus footer={`${remaining} UNOPENED · ${bombsFound} FOUND`}>
            <span className="inline-flex items-center gap-2"><BombIcon weight="fill" size={19} className="text-danger" /> {bombsRemaining} BOMBS LEFT</span>
          </GameStatus>
        </>
      ) : null}

      {phase === "result" ? (
        <>
          <GamePrompt title="UH OH" subtitle="the beer fought back" />
          <GameArea><BeerBoard cells={cells} disabled reduceMotion={Boolean(reduceMotion)} onPick={() => {}} /></GameArea>
          <GameStatus>{bombsRemaining} BOMBS LEFT</GameStatus>
        </>
      ) : null}

      {phase === "round-over" ? (
        <>
          <GamePrompt title={`ROUND ${round} CLEARED`} subtitle="somehow you're still here" />
          <GameArea>
            <motion.div initial={reduceMotion ? false : { scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
              <CheckCircleIcon weight="fill" size={72} className="text-go" aria-hidden="true" />
              <p className="font-pixel text-4xl">DEFUSED!</p>
              <p className="font-pixel text-sm text-muted-foreground">{bombsFound} BOMBS FOUND · {BEER_COUNT - remaining} BEERS OPENED</p>
              {isRoundClear(cells) && <p className="max-w-64 text-sm text-muted-foreground">New beers, new hiding spots. Everyone keeps their score.</p>}
            </motion.div>
          </GameArea>
          <GameButton onClick={() => { playSound(round === totalRounds ? "winner" : "roundStart"); nextRound() }}>
            <span className="inline-flex items-center gap-2">{round >= totalRounds ? "SEE THE RESULTS" : "RESHUFFLE & GO"}<ArrowRightIcon weight="bold" size={20} /></span>
          </GameButton>
        </>
      ) : null}

      {phase === "night-over" ? (
        <NightResults players={players.filter((item) => order.includes(item.id))} bombHits={bombHits} drinks={drinks} onAgain={again} />
      ) : null}

      <AnimatePresence>
        {safeToast > 0 && phase === "play" ? (
          <motion.div key={safeToast} aria-live="polite" role="status" className="beer-bomb-safe-feedback pointer-events-none absolute inset-x-6 top-[20%] z-10 flex justify-center"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: .8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}>
            <span className="bg-go px-6 py-3 font-pixel text-xl text-primary-foreground shadow-2xl">{SAFE_LINES[(round + turnIndex) % SAFE_LINES.length]}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <BombReveal hit={phase === "result" ? lastHit : null} playerName={hitPlayer?.name ?? "UNKNOWN PLAYER"}
        round={round} streakCount={streakCount} onContinue={continueAfterResult} />
    </GameScreen>
  )
}
