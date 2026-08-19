import { motion } from "motion/react"

import { PlayerToken } from "@/components/game/PlayerToken"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { Player } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PlayerPicker({
  players,
  selectedId,
  onSelect,
}: {
  players: Player[]
  selectedId?: string | null
  onSelect: (id: string) => void
}) {
  const reduceMotion = useGameMotion()

  return (
    <div className="flex w-full flex-col gap-2">
      {players.map((player) => {
        const selected = player.id === selectedId

        return (
          <motion.button
            key={player.id}
            type="button"
            whileTap={reduceMotion ? undefined : { x: 2, y: 2 }}
            onClick={() => {
              haptic("tap")
              playSound("select")
              onSelect(player.id)
            }}
            className={cn(
              "flex min-h-16 items-center px-4 text-left",
              selected ? "bg-elevated outline-2 outline-go" : "bg-card"
            )}
          >
            <PlayerToken player={player} />
          </motion.button>
        )
      })}
    </div>
  )
}
