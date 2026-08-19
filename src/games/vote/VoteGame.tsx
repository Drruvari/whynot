import { useState } from "react"
import { HandPointing } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { PlayerPicker } from "@/components/game/PlayerPicker"
import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
} from "@/components/game/GameScreen"
import { ResultReveal } from "@/components/game/ResultReveal"
import { VOTE_PROMPTS } from "@/games/copy"
import { playSound } from "@/lib/sound"
import { pickRandom } from "@/lib/shuffle"
import { useSession } from "@/store/session"

type VotePhase = "prompt" | "result"

export function VoteGame() {
  const players = useSession((state) => state.players)
  const [phase, setPhase] = useState<VotePhase>("prompt")
  const [prompt, setPrompt] = useState(() => pickRandom(VOTE_PROMPTS))
  const [pickedId, setPickedId] = useState<string | null>(null)
  const picked = players.find((player) => player.id === pickedId)

  function nextPrompt() {
    playSound("roundStart")
    setPrompt(pickRandom(VOTE_PROMPTS))
    setPickedId(null)
    setPhase("prompt")
  }

  if (players.length < 3) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="VOTE" />
      <GamePrompt title={prompt} subtitle="one tap. no take-backs." />
      <GameArea className="items-stretch">
        <PlayerPicker
          players={players}
          selectedId={pickedId}
          onSelect={(id) => {
            setPickedId(id)
            setPhase("result")
          }}
        />
      </GameArea>
      <GameButton tone="muted" onClick={nextPrompt}>
        SKIP
      </GameButton>

      <ResultReveal
        open={phase === "result"}
        tone="warn"
        icon={<HandPointing weight="fill" size={72} />}
        title="VOTED"
        name={picked?.name}
        detail="DRINK 1"
        caption="the table has spoken"
        actionLabel="NEXT"
        onContinue={nextPrompt}
      />
    </GameScreen>
  )
}
