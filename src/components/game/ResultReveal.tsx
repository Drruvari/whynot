import type { ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { GameButton } from "@/components/game/GameButton"
import { useGameMotion } from "@/hooks/use-game-motion"
import { cn } from "@/lib/utils"

export function ResultReveal({
  open,
  tone = "danger",
  icon,
  title,
  name,
  detail,
  caption,
  actionLabel = "CONTINUE",
  onContinue,
}: {
  open: boolean
  tone?: "danger" | "go" | "secret" | "warn"
  icon: ReactNode
  title: string
  name?: string
  detail?: string
  caption?: string
  actionLabel?: string
  onContinue: () => void
}) {
  const reduceMotion = useGameMotion()
  const toneClass =
    tone === "danger"
      ? "bg-danger"
      : tone === "go"
        ? "bg-go text-primary-foreground"
        : tone === "secret"
          ? "bg-secret"
          : "bg-warn text-primary-foreground"

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={cn(
            "absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-white",
            toneClass
          )}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 0.84, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className="text-white">{icon}</div>
            <p className="mt-6 font-pixel text-6xl leading-none font-bold tracking-wide">
              {title}
            </p>
            {name ? (
              <p className="mt-5 font-display text-2xl font-extrabold uppercase">
                {name}
              </p>
            ) : null}
            {detail ? (
              <p className="mt-3 font-pixel text-4xl font-bold">{detail}</p>
            ) : null}
            {caption ? (
              <p className="mt-6 text-base font-medium tracking-wide opacity-80">
                {caption}
              </p>
            ) : null}
          </motion.div>
          <div className="absolute inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))]">
            <GameButton
              tone="muted"
              className="bg-black/30 text-white"
              onClick={onContinue}
            >
              {actionLabel}
            </GameButton>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
