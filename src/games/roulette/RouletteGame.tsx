import { CheckCircleIcon, SkullIcon, TargetIcon } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"

import { GameButton } from "@/components/game/GameButton"
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
import { wait } from "@/lib/wait"
import { useSession } from "@/store/session"
import { RouletteCylinder } from "./components/RouletteCylinder"
import "./roulette.css"
import { currentShooterId, willReload } from "./rules"
import { useRoulette } from "./store"

const SAFE_LINES = [
  "DODGED IT",
  "STILL BREATHING",
  "LUCKY YOU",
  "NOT TODAY",
] as const

export function RouletteGame() {
  const players = useSession((state) => state.players)
  const reduceMotion = useGameMotion()
  const game = useRoulette((state) => state)
  const fire = useRoulette((state) => state.fire)
  const continueAfterResult = useRoulette((state) => state.continueAfterResult)
  const start = useRoulette((state) => state.start)
  const [spinning, setSpinning] = useState(false)
  const [spins, setSpins] = useState(0)
  const locked = useRef(false)
  const generation = useRef(0)

  // Cancel a pending fire when the screen is unmounted (e.g. Exit mid-spin).
  useEffect(
    () => () => {
      generation.current += 1
    },
    []
  )

  const shooterId =
    game.phase === "result" ? game.lastShot?.playerId : currentShooterId(game)
  const shooter = players.find((player) => player.id === shooterId)
  const missingPlayers = game.playerIds.some(
    (id) => !players.some((p) => p.id === id)
  )
  const validGame =
    game.inProgress &&
    game.chambers.length === game.chamberCount &&
    game.playerIds.length >= 2 &&
    !missingPlayers &&
    Boolean(shooter)
  const topHit = Object.entries(game.bangs).sort((a, b) => b[1] - a[1])[0]
  const unlucky = players.find((p) => p.id === topHit?.[0])
  const reload = willReload(game)

  async function pull() {
    if (!validGame || !shooter || game.phase !== "aim" || locked.current) return
    locked.current = true // immediate ref guard, before async animation
    const request = generation.current
    setSpinning(true)
    setSpins((value) => value + 2)
    haptic("tap")
    playSound("click")
    if (!reduceMotion) await wait(440)
    if (request !== generation.current) return
    const shot = fire(shooter.id)
    if (shot) {
      haptic(shot.bang ? "bomb" : "success")
      playSound(shot.bang ? "bomb" : "safe")
    }
    locked.current = false
    setSpinning(false)
  }

  function next() {
    if (reload) playSound("roundStart")
    continueAfterResult()
  }

  if (!validGame) {
    return (
      <GameScreen>
        <GameHeader title="ROULETTE" />
        <GamePrompt title="CYLINDER EMPTY" subtitle="need the original crew?" />
        <GameArea>
          <div className="max-w-xs space-y-5 text-center">
            <p className="text-sm/relaxed text-muted-foreground">
              A round is missing or its players changed. Start a fresh cylinder
              to continue.
            </p>
            <GameButton
              disabled={players.length < 2 || players.length > 8}
              onClick={() =>
                start(
                  game.chamberCount,
                  game.bullets,
                  players.map((p) => p.id)
                )
              }
            >
              NEW CYLINDER
            </GameButton>
          </div>
        </GameArea>
      </GameScreen>
    )
  }

  return (
    <GameScreen>
      <GameHeader title="ROULETTE" />
      <div className="flex items-center justify-center gap-2 pb-1 text-xs font-bold tracking-[.12em] text-muted-foreground uppercase">
        <TargetIcon
          weight="fill"
          size={16}
          className="text-warn"
          aria-hidden="true"
        />
        CYLINDER {game.cylinderNumber} · {game.bullets} LOADED
      </div>
      <GamePrompt
        title={`${shooter!.name}'S TURN`}
        subtitle={
          game.phase === "result"
            ? "verdict time"
            : "what could possibly go wrong?"
        }
      />
      <GameArea className="flex-col gap-3">
        <RouletteCylinder
          chambers={game.chamberCount}
          chamberIndex={game.index}
          shotsFired={game.shotsFired}
          spins={spins}
          spinning={spinning}
          reduceMotion={Boolean(reduceMotion)}
          disabled={game.phase !== "aim"}
          onFire={() => void pull()}
        />
        {unlucky && topHit && topHit[1] > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs tracking-wider text-muted-foreground uppercase">
            <SkullIcon
              weight="fill"
              size={16}
              className="text-danger"
              aria-hidden="true"
            />
            <PlayerToken player={unlucky} size="sm" />{" "}
            <span>HIT {topHit[1]}×</span>
          </div>
        ) : (
          <p className="text-center text-xs font-semibold tracking-[.18em] text-muted-foreground uppercase">
            the next click could be your last
          </p>
        )}
      </GameArea>
      <GameStatus
        footer={`${game.totalShots} TOTAL PULLS · ${game.chamberCount} CHAMBERS`}
      >
        CHAMBER {Math.min(game.chamberCount, game.shotsFired + 1)} /{" "}
        {game.chamberCount}
      </GameStatus>
      <ResultReveal
        open={game.phase === "result"}
        tone={game.lastShot?.bang ? "danger" : "go"}
        icon={
          game.lastShot?.bang ? (
            <SkullIcon weight="fill" size={80} />
          ) : (
            <CheckCircleIcon weight="fill" size={80} />
          )
        }
        title={game.lastShot?.bang ? "BANG!" : "CLICK!"}
        name={shooter!.name}
        detail={game.lastShot?.bang ? "YOU GOT HIT" : "SAFE"}
        caption={
          game.lastShot?.bang
            ? "Take a small sip or do a dare. New cylinder incoming."
            : reload
              ? "Cylinder cleared. Shuffle and pass it on."
              : SAFE_LINES[
                  (game.lastShot?.shotNumber ?? 0) % SAFE_LINES.length
                ] + ". Pass it on."
        }
        actionLabel={reload ? "RELOAD & PASS" : "NEXT PLAYER"}
        onContinue={next}
      />
    </GameScreen>
  )
}
