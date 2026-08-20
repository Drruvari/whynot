import { useState } from "react"
import { HandPointingIcon, TrophyIcon } from "@phosphor-icons/react"

import { GameButton } from "@/components/game/GameButton"
import { PlayerPicker } from "@/components/game/PlayerPicker"
import { PlayerToken } from "@/components/game/PlayerToken"
import {
  GameArea,
  GameHeader,
  GamePrompt,
  GameScreen,
} from "@/components/game/GameScreen"
import { ResultReveal } from "@/components/game/ResultReveal"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { useVote } from "@/store/vote"

type VotePhase = "prompt" | "result"

export function VoteGame() {
  const players = useSession((state) => state.players)
  const drawPrompt = useVote((state) => state.drawPrompt)
  const recordVote = useVote((state) => state.recordVote)
  const tally = useVote((state) => state.tally)
  const [phase, setPhase] = useState<VotePhase>("prompt")
  const [prompt, setPrompt] = useState(() => drawPrompt())
  const [pickedId, setPickedId] = useState<string | null>(null)
  const picked = players.find((player) => player.id === pickedId)

  const [leaderId, leaderCount] =
    Object.entries(tally).sort((a, b) => b[1] - a[1])[0] ?? []
  const leader = players.find((player) => player.id === leaderId)

  function nextPrompt() {
    playSound("roundStart")
    setPrompt(drawPrompt())
    setPickedId(null)
    setPhase("prompt")
  }

  if (players.length < 3) {
    return null
  }

  return (
    <GameScreen className="relative">
      <GameHeader title="VOTE" />

      {leader && leaderCount ? (
        <div className="flex items-center justify-center gap-1.5 pb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          <TrophyIcon weight="fill" size={14} className="text-warn" />
          <PlayerToken player={leader} size="sm" />
          <span>× {leaderCount}</span>
        </div>
      ) : null}

      <GamePrompt title={prompt} subtitle="one tap. no take-backs." />
      <GameArea className="items-stretch">
        <PlayerPicker
          players={players}
          selectedId={pickedId}
          onSelect={(id) => {
            setPickedId(id)
            recordVote(id)
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
        icon={<HandPointingIcon weight="fill" size={72} />}
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
