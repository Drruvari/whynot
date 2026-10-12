import { BombIcon } from "@phosphor-icons/react"

import { ResultReveal } from "@/components/game/ResultReveal"
import type { BeerBombHit } from "../types"

const TAUNTS = [
  "That one had your name on it.",
  "An impressive lack of luck.",
  "The beer chose violence.",
  "A spectacularly bad decision.",
  "Never trust a smiling beer.",
] as const

export function BombReveal({
  hit,
  playerName,
  streakCount,
  round,
  onContinue,
}: {
  hit: BeerBombHit | null
  playerName: string
  streakCount: number
  round: number
  onContinue: () => void
}) {
  const isBomb = hit?.kind === "bomb"
  const caption = isBomb && streakCount >= 2
    ? `${streakCount} bombs in a row. The curse is real.`
    : TAUNTS[(round + (hit?.drinks ?? 0)) % TAUNTS.length]

  return (
    <ResultReveal
      open={isBomb}
      icon={<BombIcon weight="fill" size={76} />}
      title="BOOM!"
      name={playerName}
      detail={isBomb ? `${hit.drinks} ${hit.drinks === 1 ? "SIP" : "SIPS"}` : undefined}
      caption={caption}
      actionLabel="PASS IT ON"
      onContinue={onContinue}
    />
  )
}
