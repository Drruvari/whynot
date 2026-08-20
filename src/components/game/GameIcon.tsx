import {
  BombIcon,
  DetectiveIcon,
  HandPointingIcon,
  QuestionIcon,
  SkullIcon,
  type Icon,
} from "@phosphor-icons/react"

import type { GameId } from "@/lib/types"
import { cn } from "@/lib/utils"

const ICONS: Record<GameId, Icon> = {
  "beer-bomb": BombIcon,
  spy: DetectiveIcon,
  roulette: SkullIcon,
  vote: HandPointingIcon,
  liar: QuestionIcon,
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
