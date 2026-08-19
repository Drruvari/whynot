import { BeerStein, Bomb, Check, Crown } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
  GameStatus,
} from "@/components/game/GameScreen"
import { GameButton } from "@/components/game/GameButton"
import { ResultReveal } from "@/components/game/ResultReveal"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { cn } from "@/lib/utils"
import { useBeerBomb, type BeerCell } from "@/store/beer-bomb"
import { useSession } from "@/store/session"

const ROWS = [
  [0, 1, 2],
  [3, 4, 5, 6],
  [7, 8, 9],
] as const

export function BeerBombGame() {
  const players = useSession((state) => state.players)
  const reduceMotion = useGameMotion()
  const {
    phase,
    round,
    totalRounds,
    cells,
    turnIndex,
    lastHit,
    bombHits,
    drinks,
    pick,
    continueAfterResult,
    nextRound,
    start,
    bombCount,
    inProgress,
  } = useBeerBomb()
  const [shaking, setShaking] = useState(false)
  const [safeFlash, setSafeFlash] = useState(false)

  useEffect(() => {
    if (inProgress && cells.length === 0) {
      start(bombCount)
    }
  }, [bombCount, cells.length, inProgress, start])

  const player = players[turnIndex % Math.max(players.length, 1)]
  const remaining = cells.filter((cell) => !cell.opened)
  const bombsLeft = remaining.filter((cell) => cell.bomb).length
  const bombsFound = cells.filter((cell) => cell.opened && cell.bomb).length
  const hitPlayer = players.find((item) => item.id === lastHit?.playerId)
  const ranked = players
    .map((item) => ({
      player: item,
      hits: bombHits[item.id] ?? 0,
      drinks: drinks[item.id] ?? 0,
    }))
    .sort((a, b) => b.hits - a.hits)
  const magnet = ranked[0]
  const luckiest = [...ranked].sort((a, b) => a.hits - b.hits)[0]
  const thirstiest = [...ranked].sort((a, b) => b.drinks - a.drinks)[0]

  async function handlePick(cell: BeerCell) {
    if (!player || cell.opened || phase !== "play" || shaking) {
      return
    }

    if (cell.bomb) {
      haptic("bomb")
      playSound("bomb")
      if (!reduceMotion) {
        setShaking(true)
        await wait(520)
        setShaking(false)
      }
      pick(cell.id, player.id)
      return
    }

    haptic("success")
    playSound("safe")
    setSafeFlash(true)
    window.setTimeout(() => setSafeFlash(false), 420)
    pick(cell.id, player.id)
  }

  if (players.length < 2) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="BEER BOMB" />

      {phase === "play" ? (
        <>
          <GamePrompt title={`${player.name}'s turn`} subtitle="pick a beer" />
          <GameArea>
            <motion.div
              className="flex w-full flex-col items-center gap-4"
              animate={
                shaking && !reduceMotion
                  ? { x: [0, -16, 18, -12, 10, -6, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.5 }}
            >
              {ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-4">
                  {row.map((index) => {
                    const cell = cells[index]
                    if (!cell) {
                      return null
                    }

                    return (
                      <BeerButton
                        key={cell.id}
                        cell={cell}
                        reduceMotion={Boolean(reduceMotion)}
                        onPick={() => handlePick(cell)}
                      />
                    )
                  })}
                </div>
              ))}
            </motion.div>
          </GameArea>
          <GameStatus
            footer={`ROUND ${String(round).padStart(2, "0")} / ${String(totalRounds).padStart(2, "0")}`}
          >
            {remaining.length} LEFT / BOMB {bombsLeft}
          </GameStatus>
        </>
      ) : null}

      {phase === "round-over" ? (
        <>
          <GamePrompt
            title={`Round ${String(round).padStart(2, "0")}`}
            subtitle="shuffle the beers"
          />
          <GameArea>
            <div className="text-center">
              <p className="font-pixel text-5xl">CLEAR</p>
              <p className="mt-3 font-pixel text-xl text-muted-foreground">
                {bombsFound} BOMB{bombsFound === 1 ? "" : "S"} HIT
              </p>
            </div>
          </GameArea>
          <GameButton
            onClick={() => {
              playSound("roundStart")
              nextRound()
            }}
          >
            {round >= totalRounds ? "NIGHT OVER" : "NEXT ROUND"}
          </GameButton>
        </>
      ) : null}

      {phase === "night-over" ? (
        <>
          <GamePrompt title="Night over" />
          <GameArea>
            <div className="flex w-full flex-col gap-4 text-center">
              <Crown weight="fill" size={48} className="mx-auto text-go" />
              {magnet ? (
                <Award label="BOMB MAGNET" playerName={magnet.player.name} detail={`${magnet.hits} BOMBS`} />
              ) : null}
              {luckiest && luckiest.player.id !== magnet?.player.id ? (
                <Award
                  label="LUCKIEST"
                  playerName={luckiest.player.name}
                  detail={`${luckiest.hits} BOMBS`}
                />
              ) : null}
              {thirstiest && thirstiest.drinks > 0 ? (
                <Award
                  label="THIRSTIEST"
                  playerName={thirstiest.player.name}
                  detail={`${thirstiest.drinks} SIPS`}
                />
              ) : null}
            </div>
          </GameArea>
          <GameButton
            tone="danger"
            onClick={() => {
              playSound("roundStart")
              start(bombCount)
            }}
          >
            PLAY AGAIN
          </GameButton>
        </>
      ) : null}

      <AnimatePresence>
        {safeFlash ? (
          <motion.p
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center font-pixel text-6xl text-go"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            SAFE
          </motion.p>
        ) : null}
      </AnimatePresence>

      <ResultReveal
        open={phase === "result" && lastHit?.kind === "bomb"}
        icon={<Bomb weight="fill" size={72} />}
        title="BOMB!"
        name={hitPlayer?.name}
        detail={lastHit ? `DRINK ${lastHit.drinks}` : undefined}
        caption="unlucky bro"
        onContinue={() => continueAfterResult()}
      />
    </GameScreen>
  )
}

function Award({
  label,
  playerName,
  detail,
}: {
  label: string
  playerName: string
  detail: string
}) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="font-pixel text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-extrabold uppercase">
        {playerName}
      </p>
      <p className="font-pixel text-lg text-danger">{detail}</p>
    </div>
  )
}

function BeerButton({
  cell,
  reduceMotion,
  onPick,
}: {
  cell: BeerCell
  reduceMotion: boolean
  onPick: () => void
}) {
  return (
    <motion.button
      type="button"
      disabled={cell.opened}
      whileTap={reduceMotion || cell.opened ? undefined : { x: 2, y: 2 }}
      animate={
        cell.opened
          ? { scale: 0.84, opacity: 0.28 }
          : { scale: 1, opacity: 1 }
      }
      onClick={onPick}
      className={cn(
        "flex size-[4.6rem] items-center justify-center rounded-full",
        cell.opened ? "bg-elevated" : "bg-card"
      )}
    >
      {cell.opened ? (
        cell.bomb ? (
          <Bomb weight="fill" size={28} className="text-danger" />
        ) : (
          <Check weight="fill" size={28} className="text-go" />
        )
      ) : (
        <BeerStein weight="fill" size={30} />
      )}
    </motion.button>
  )
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}
