import type { ReactNode } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useGameMotion } from "@/hooks/use-game-motion"

export function GameButton({
  children,
  className,
  tone = "go",
  disabled,
  onClick,
}: {
  children: ReactNode
  className?: string
  tone?: "go" | "danger" | "secret" | "muted"
  disabled?: boolean
  onClick?: () => void
}) {
  const reduceMotion = useGameMotion()

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={reduceMotion || disabled ? undefined : { x: 2, y: 2 }}
      onClick={() => {
        if (disabled) {
          return
        }

        haptic("tap")
        playSound("click")
        onClick?.()
      }}
      className={cn(
        "flex min-h-16 w-full items-center justify-center px-6 text-lg font-semibold tracking-[0.16em] uppercase disabled:opacity-40",
        tone === "go" && "bg-go text-primary-foreground",
        tone === "danger" && "bg-danger text-white",
        tone === "secret" && "bg-secret text-white",
        tone === "muted" && "bg-elevated text-foreground",
        className
      )}
    >
      {children}
    </motion.button>
  )
}
