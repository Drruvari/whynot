import { useState } from "react"
import { Question } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
} from "@/components/game/GameScreen"
import { ResultReveal } from "@/components/game/ResultReveal"
import { LIAR_CLAIMS } from "@/games/copy"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { pickRandom } from "@/lib/shuffle"
import type { Player } from "@/lib/types"
import { useSession } from "@/store/session"

type LiarPhase = "claim" | "result"

function dealLiar(players: Player[]) {
  return {
    accused: pickRandom(players),
    claim: pickRandom(LIAR_CLAIMS),
  }
}

export function LiarGame() {
  const players = useSession((state) => state.players)
  const [round, setRound] = useState(() => dealLiar(players))
  const [phase, setPhase] = useState<LiarPhase>("claim")
  const [calledLiar, setCalledLiar] = useState(false)
  const accused = round.accused

  function nextClaim() {
    playSound("roundStart")
    setRound(dealLiar(players))
    setCalledLiar(false)
    setPhase("claim")
  }

  function verdict(liar: boolean) {
    haptic(liar ? "warn" : "success")
    playSound(liar ? "warning" : "safe")
    setCalledLiar(liar)
    setPhase("result")
  }

  if (players.length < 3 || !accused) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="LIAR" />
      <GamePrompt title={`${accused.name} claims`} subtitle="believe them?" />
      <GameArea>
        <div className="flex flex-col items-center text-center">
          <PlayerToken player={accused} size="lg" />
          <p className="mt-8 font-display text-3xl/tight font-extrabold tracking-tight">
            {round.claim}
          </p>
        </div>
      </GameArea>
      <div className="grid grid-cols-2 gap-2">
        <GameButton tone="go" onClick={() => verdict(false)}>
          BELIEVE
        </GameButton>
        <GameButton tone="danger" onClick={() => verdict(true)}>
          LIAR
        </GameButton>
      </div>

      <ResultReveal
        open={phase === "result"}
        tone={calledLiar ? "danger" : "go"}
        icon={<Question weight="fill" size={72} />}
        title={calledLiar ? "LIAR" : "TRUE?"}
        name={accused.name}
        detail={calledLiar ? "DRINK 2" : "DRINK 0"}
        caption={
          calledLiar ? "the table didn't buy it" : "fine. we believe you."
        }
        actionLabel="NEXT"
        onContinue={nextClaim}
      />
    </GameScreen>
  )
}
