import { Skull } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { motion } from "motion/react"

import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
  GameStatus,
} from "@/components/game/GameScreen"
import { ResultReveal } from "@/components/game/ResultReveal"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { cn } from "@/lib/utils"
import { wait } from "@/lib/wait"
import { useRoulette } from "@/store/roulette"
import { useSession } from "@/store/session"

export function RouletteGame() {
  const players = useSession((state) => state.players)
  const reduceMotion = useGameMotion()
  const {
    phase,
    chambers,
    index,
    turnIndex,
    lastBang,
    fire,
    continueAfterResult,
    inProgress,
    start,
    chamberCount,
    bullets,
  } = useRoulette()
  const [spinning, setSpinning] = useState(false)
  const player = players[turnIndex % Math.max(players.length, 1)]

  useEffect(() => {
    if (inProgress && chambers.length === 0) {
      start(chamberCount, bullets)
    }
  }, [bullets, chamberCount, chambers.length, inProgress, start])

  async function pull() {
    if (!player || phase !== "aim" || spinning || chambers.length === 0) {
      return
    }

    setSpinning(true)
    haptic("tap")
    playSound("click")
    if (!reduceMotion) {
      await wait(280)
    }
    fire(player.id)
    const bang = useRoulette.getState().lastBang
    if (bang) {
      haptic("bomb")
      playSound("bomb")
    } else {
      haptic("success")
      playSound("safe")
    }
    setSpinning(false)
  }

  if (players.length < 2) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="ROULETTE" />
      <GamePrompt title={`${player.name}'s turn`} subtitle="pull the trigger" />
      <GameArea>
        <div className="relative flex size-64 items-center justify-center">
          {chambers.map((_, chamberIndex) => {
            const angle = (360 / Math.max(chambers.length, 1)) * chamberIndex
            const current = chamberIndex === index

            return (
              <div
                key={chamberIndex}
                className={cn(
                  "absolute top-1/2 left-1/2 size-9 -translate-x-1/2",
                  current ? "bg-warn" : "bg-card"
                )}
                style={{ transform: `rotate(${angle}deg) translateY(-108px)` }}
              />
            )
          })}
          <motion.button
            type="button"
            whileTap={reduceMotion || spinning ? undefined : { x: 2, y: 2 }}
            onClick={() => void pull()}
            className="relative z-10 flex size-28 items-center justify-center bg-danger font-display text-xl font-extrabold text-white"
          >
            FIRE
          </motion.button>
        </div>
      </GameArea>
      <GameStatus footer={`${chamberCount} CHAMBERS`}>
        CHAMBER {chambers.length === 0 ? 0 : index + 1}
      </GameStatus>

      <ResultReveal
        open={phase === "result"}
        tone={lastBang ? "danger" : "go"}
        icon={<Skull weight="fill" size={72} />}
        title={lastBang ? "BANG" : "CLICK"}
        name={player.name}
        detail={lastBang ? "DRINK 3" : "SAFE"}
        caption={lastBang ? "spin it again" : "pass the phone"}
        onContinue={continueAfterResult}
      />
    </GameScreen>
  )
}
