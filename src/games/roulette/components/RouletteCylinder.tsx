import { motion } from "motion/react"
import { TargetIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

export function RouletteCylinder({
  chambers,
  chamberIndex,
  shotsFired,
  spins,
  spinning,
  disabled,
  reduceMotion,
  onFire,
}: {
  chambers: number
  chamberIndex: number
  shotsFired: number
  spins: number
  spinning: boolean
  disabled: boolean
  reduceMotion: boolean
  onFire: () => void
}) {
  const angle = 360 / Math.max(1, chambers)
  return (
    <div className="roulette-machine relative flex aspect-square w-[min(79vw,19rem,38vh)] max-w-full items-center justify-center"
      role="group" aria-label="Roulette cylinder">
      <span className="roulette-pointer" aria-hidden="true" />
      <motion.div className="roulette-cylinder absolute inset-[7%] rounded-full"
        animate={{ rotate: (reduceMotion ? 0 : spins * 360) - chamberIndex * angle }}
        transition={reduceMotion ? { duration: 0 } : { duration: spinning ? 0.43 : 0.32, ease: [0.15, 0.7, 0.35, 1] }}
        aria-hidden="true">
        {Array.from({ length: chambers }, (_, index) => {
          const spent = index < shotsFired
          return (
            <div key={index} className={cn("roulette-chamber", spent && "roulette-chamber-spent")}
              style={{ transform: `translate(-50%, -50%) rotate(${angle * index}deg) translateY(calc(-1 * min(28vw, 6.65rem, 13.3vh)))` }}>
              <span style={{ transform: `rotate(${-angle * index}deg)` }}>{spent ? "×" : String(index + 1)}</span>
            </div>
          )
        })}
        <div className="roulette-hub absolute inset-[33%] rounded-full" />
      </motion.div>
      <motion.button type="button" disabled={disabled || spinning}
        onClick={onFire}
        whileTap={reduceMotion || disabled || spinning ? undefined : { scale: .91, rotate: -4 }}
        animate={reduceMotion ? undefined : spinning ? { scale: [.96, 1.04, .96] } : { scale: 1 }}
        transition={spinning && !reduceMotion ? { duration: .27, repeat: Infinity } : undefined}
        className="roulette-trigger relative z-10 flex size-[clamp(5.5rem,25vw,7.25rem)] flex-col items-center justify-center rounded-full text-center focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-warn disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={spinning ? "Firing" : "Pull trigger"}>
        <TargetIcon weight="fill" size={29} aria-hidden="true" />
        <span className="font-display text-lg font-black tracking-[.12em]">{spinning ? "..." : "FIRE"}</span>
      </motion.button>
    </div>
  )
}
