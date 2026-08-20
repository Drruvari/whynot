import { Detective, Target } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
  GameStatus,
} from "@/components/game/GameScreen"
import { PlayerToken } from "@/components/game/PlayerToken"
import { ResultReveal } from "@/components/game/ResultReveal"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { shuffle } from "@/lib/shuffle"
import type { Player } from "@/lib/types"
import { useSession } from "@/store/session"

type SpyPhase = "pass" | "vote" | "result"

function dealSpy(players: Player[]) {
  return {
    spyId: players[Math.floor(Math.random() * Math.max(players.length, 1))]?.id,
    order: shuffle(players),
  }
}

export function SpyGame() {
  const players = useSession((state) => state.players)
  const reduceMotion = useGameMotion()
  const [round, setRound] = useState(() => dealSpy(players))
  const [phase, setPhase] = useState<SpyPhase>("pass")
  const [index, setIndex] = useState(0)
  const [holding, setHolding] = useState(false)
  const [hasLooked, setHasLooked] = useState(false)
  const [voteId, setVoteId] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(8)
  const secondsRef = useRef(seconds)

  const current = round.order[index]
  const spy = players.find((player) => player.id === round.spyId)
  const voted = players.find((player) => player.id === voteId)
  const caught = voteId === round.spyId

  useEffect(() => {
    secondsRef.current = seconds
  }, [seconds])

  useEffect(() => {
    if (phase !== "result") {
      return
    }

    playSound(caught ? "spyCaught" : "loser")
  }, [caught, phase])

  useEffect(() => {
    if (phase !== "vote") {
      return
    }

    const timer = window.setInterval(() => {
      const currentSeconds = secondsRef.current

      if (currentSeconds <= 1) {
        setSeconds(0)
        haptic("warn")
        playSound("voteReveal")
        setPhase("result")
        return
      }

      const next = currentSeconds - 1
      setSeconds(next)
      if (next <= 4) {
        haptic("tap")
        playSound(next <= 2 ? "tickFinal" : "tick")
      }
    }, 1000)

    return () => window.clearInterval(timer)
  }, [phase])

  if (!current || !spy) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="SPY" />

      {phase === "pass" ? (
        <>
          <GamePrompt title="Pass to" />
          <GameArea>
            <PlayerToken player={current} size="lg" className="text-4xl" />
          </GameArea>
          <GameStatus>Nobody else look.</GameStatus>
          <motion.button
            type="button"
            className="min-h-17 bg-secret text-lg font-semibold tracking-[0.16em] text-white uppercase"
            whileTap={reduceMotion ? undefined : { x: 2, y: 2 }}
            onContextMenu={(event) => event.preventDefault()}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId)
              haptic("tap")
              playSound("spyReveal")
              setHolding(true)
              setHasLooked(true)
            }}
            onPointerUp={() => setHolding(false)}
            onPointerCancel={() => setHolding(false)}
          >
            HOLD TO REVEAL
          </motion.button>
          <button
            type="button"
            disabled={!hasLooked}
            className="mt-3 h-12 text-sm font-semibold tracking-wide text-muted-foreground uppercase disabled:opacity-30"
            onClick={() => {
              if (index >= round.order.length - 1) {
                setSeconds(8)
                setPhase("vote")
                return
              }
              setIndex((value) => value + 1)
              setHasLooked(false)
              setHolding(false)
            }}
          >
            {index >= round.order.length - 1 ? "EVERYONE'S IN" : "NEXT PERSON"}
          </button>
          {holding ? (
            <div
              className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center ${
                current.id === round.spyId ? "bg-secret" : "bg-card"
              }`}
            >
              <p className="font-pixel text-6xl font-bold">
                {current.id === round.spyId ? "SPY" : "CIVIL"}
              </p>
              <p className="mt-4 text-sm font-medium tracking-wide text-muted-foreground">
                {current.id === round.spyId
                  ? "Blend in."
                  : `Hi ${current.name}. Stay cool.`}
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      {phase === "vote" ? (
        <>
          <GamePrompt
            title="Who's the spy?"
            subtitle="one tap. no take-backs."
          />
          <GameArea className="items-stretch">
            <div className="flex w-full flex-col gap-3">
              {players.map((player) => (
                <motion.button
                  key={player.id}
                  type="button"
                  whileTap={reduceMotion ? undefined : { x: 2, y: 2 }}
                  onClick={() => {
                    haptic("tap")
                    playSound("voteLock")
                    setVoteId(player.id)
                  }}
                  className={`flex min-h-16 items-center px-4 ${
                    voteId === player.id
                      ? "bg-elevated outline-2 outline-go"
                      : "bg-card"
                  }`}
                >
                  <PlayerToken player={player} />
                </motion.button>
              ))}
            </div>
          </GameArea>
          <p
            className={`text-center font-pixel leading-none ${
              seconds <= 3 ? "text-8xl text-danger" : "text-7xl"
            }`}
          >
            {seconds}
          </p>
        </>
      ) : null}

      <ResultReveal
        open={phase === "result"}
        tone={caught ? "go" : "secret"}
        icon={
          caught ? (
            <Target weight="fill" size={72} />
          ) : (
            <Detective weight="fill" size={72} />
          )
        }
        title={caught ? "CAUGHT" : "SPY"}
        name={caught ? voted?.name : spy.name}
        detail={caught ? "DRINK 0" : "DRINK 2"}
        caption={caught ? "nice read" : `${spy.name} walked free`}
        actionLabel="AGAIN"
        onContinue={() => {
          setRound(dealSpy(players))
          setPhase("pass")
          setIndex(0)
          setVoteId(null)
          setHolding(false)
          setHasLooked(false)
        }}
      />
    </GameScreen>
  )
}
