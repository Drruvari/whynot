import { CrownIcon, SparkleIcon } from "@phosphor-icons/react"
import { GameArea, GamePrompt, GameStatus } from "@/components/game/GameScreen"
import { GameButton } from "@/components/game/GameButton"
import type { Player } from "@/lib/types"
import { playSound } from "@/lib/sound"

export function NightResults({
  players,
  bombHits,
  drinks,
  onAgain,
}: {
  players: Player[]
  bombHits: Record<string, number>
  drinks: Record<string, number>
  onAgain: () => void
}) {
  const ranked = players.map((player) => ({
    player,
    hits: bombHits[player.id] ?? 0,
    sips: drinks[player.id] ?? 0,
  }))
  const magnet = [...ranked].sort((a, b) => b.hits - a.hits)[0]
  const lucky = [...ranked].sort((a, b) => a.hits - b.hits)[0]
  const sips = [...ranked].sort((a, b) => b.sips - a.sips)[0]

  return (
    <>
      <GamePrompt title="THAT'S A WRAP" subtitle="six rounds of questionable choices" />
      <GameArea className="overflow-y-auto py-2">
        <div className="flex w-full max-w-sm flex-col gap-3 text-center">
          <CrownIcon weight="fill" size={48} className="mx-auto text-go" aria-hidden="true" />
          {magnet && <Award label="BOMB MAGNET" name={magnet.player.name} detail={`${magnet.hits} BOMBS`} tone="danger" />}
          {lucky && lucky.player.id !== magnet?.player.id && (
            <Award label="LUCKY DUCK" name={lucky.player.name} detail={`${lucky.hits} BOMBS`} tone="go" />
          )}
          {sips && <Award label="TOTAL DAMAGE" name={sips.player.name} detail={`${sips.sips} SIPS`} tone="warn" />}
        </div>
      </GameArea>
      <GameStatus footer="You can always play without alcohol.">
        <span className="inline-flex items-center gap-2"><SparkleIcon weight="fill" size={18} /> THE NIGHT SURVIVED</span>
      </GameStatus>
      <GameButton tone="danger" onClick={() => { playSound("roundStart"); onAgain() }}>
        PLAY AGAIN
      </GameButton>
    </>
  )
}

function Award({label, name, detail, tone}: {
  label: string
  name: string
  detail: string
  tone: "danger" | "go" | "warn"
}) {
  return (
    <div className="border-l-4 border-l-current bg-card px-4 py-3 text-left" style={{color: `var(--${tone})`}}>
      <p className="font-pixel text-xs">{label}</p>
      <p className="mt-1 truncate font-display text-xl font-extrabold text-foreground uppercase">{name}</p>
      <p className="font-pixel text-sm">{detail}</p>
    </div>
  )
}
