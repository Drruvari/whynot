import { BeerSteinIcon, BombIcon, CheckIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import type { BeerCell } from "../types"

export function BeerBoard({
  cells,
  disabled,
  reduceMotion,
  onPick,
}: {
  cells: BeerCell[]
  disabled: boolean
  reduceMotion: boolean
  onPick: (cell: BeerCell) => void
}) {
  return (
    <div className="grid w-full max-w-[25rem] grid-cols-5 justify-items-center gap-1.5 sm:gap-2" role="group" aria-label={`${cells.length} mystery beers`}>
      {cells.map((cell, index) => {
            const locked = disabled || cell.opened
            return (
              <motion.button
                key={cell.id}
                type="button"
                disabled={locked}
                aria-label={cell.opened ? `Beer ${index + 1}, ${cell.bomb ? "bomb" : "safe"}` : `Pick beer ${index + 1}`}
                whileHover={locked || reduceMotion ? undefined : { rotate: index % 2 ? -7 : 7, y: -5 }}
                whileTap={locked || reduceMotion ? undefined : { scale: 0.86, rotate: -6 }}
                animate={{ scale: cell.opened ? 0.92 : 1, opacity: cell.opened ? 0.62 : 1 }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 22 }}
                onClick={() => onPick(cell)}
                className={cn(
                  "beer-bomb-tile relative flex size-[clamp(2.45rem,13vw,3.75rem)] items-center justify-center overflow-hidden rounded-none border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-go",
                  cell.opened ? "border-border bg-elevated" : "border-amber-700/70 bg-amber-300 text-amber-950 shadow-[0_5px_20px_rgba(240,168,50,0.17)]",
                  cell.opened && cell.bomb && "border-danger/40 bg-danger/15 text-danger",
                  cell.opened && !cell.bomb && "border-go/30 bg-go/10 text-go"
                )}
              >
                {cell.opened ? (
                  cell.bomb ? <BombIcon weight="fill" size={26} /> : <CheckIcon weight="bold" size={27} />
                ) : (
                  <>
                    <span className="absolute left-1.5 top-1.5 text-[10px] font-bold opacity-50" aria-hidden="true">{index + 1}</span>
                    <BeerSteinIcon weight="fill" size={33} className={reduceMotion ? "" : "beer-bomb-bob"} aria-hidden="true" />
                  </>
                )}
              </motion.button>
            )
      })}
    </div>
  )
}
