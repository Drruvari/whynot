import {
  Bomb,
  Detective,
  HandPointing,
  Question,
  Skull,
  type Icon,
} from "@phosphor-icons/react"

import type { GameId } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICONS: Record<GameId, Icon> = {
  "beer-bomb": Bomb,
  spy: Detective,
  roulette: Skull,
  vote: HandPointing,
  liar: Question,
}

export function GameIcon({
  id,
  size = 32,
  className,
}: {
  id: GameId
  size?: number
  className?: string
}) {
  const Icon = ICONS[id]

  return <Icon weight="fill" size={size} className={cn("shrink-0", className)} />
}
