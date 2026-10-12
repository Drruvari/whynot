import { BeerSteinIcon, BombIcon, CheckIcon } from "@phosphor-icons/react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { BOARD_ROWS } from "../rules"
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
    <div className="flex w-full flex-col items-center gap-2.5 sm:gap-3" role="group" aria-label="Ten mystery beers">
      {BOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2.5 sm:gap-3">
          {row.map((index) => {
            const cell = cells[index]
            if (!cell) return null
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
                  "beer-bomb-tile relative flex size-[clamp(3.75rem,18vw,4.9rem)] items-center justify-center overflow-hidden rounded-[1.15rem] border-b-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-go",
                  cell.opened ? "border-border bg-elevated" : "border-amber-700/70 bg-amber-300 text-amber-950 shadow-[0_5px_20px_rgba(240,168,50,0.17)]",
                  cell.opened && cell.bomb && "border-danger/40 bg-danger/15 text-danger",
                  cell.opened && !cell.bomb && "border-go/30 bg-go/10 text-go"
                )}
              >
                {cell.opened ? (
                  cell.bomb ? <BombIcon weight="fill" size={31} /> : <CheckIcon weight="bold" size={33} />
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
      ))}
    </div>
  )
}
