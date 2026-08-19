import { cn } from "@/lib/utils"
import type { Player, PlayerSymbol } from "@/lib/types"

const SYMBOLS: Record<PlayerSymbol, string> = {
  circle: "●",
  diamond: "◆",
  triangle: "▲",
  square: "■",
  hex: "⬡",
  star: "★",
}

export function PlayerToken({
  player,
  size = "md",
  showName = true,
  className,
}: {
  player: Player
  size?: "sm" | "md" | "lg"
  showName?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-medium uppercase tracking-wide",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl",
        className
      )}
    >
      <span style={{ color: player.color }} aria-hidden>
        {SYMBOLS[player.symbol]}
      </span>
      {showName ? <span>{player.name}</span> : null}
    </span>
  )
}
