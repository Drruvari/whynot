import { MinusIcon, PlusIcon } from "@phosphor-icons/react"
import { useState } from "react"

import { GameButton } from "@/components/game/GameButton"
import { DrawerFooter } from "@/components/ui/drawer"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import {
  MAX_CHAMBERS,
  MIN_CHAMBERS,
  clampBullets,
  clampChambers,
  suggestedBullets,
} from "../rules"
import { useRoulette } from "../store"

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4">
      <span className="text-sm font-medium tracking-[.14em] text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          className="flex size-11 items-center justify-center bg-elevated disabled:opacity-40"
          onClick={() => {
            haptic("tap")
            onChange(Math.max(min, value - 1))
          }}
        >
          <MinusIcon weight="fill" size={16} />
        </button>
        <output className="w-6 text-center font-pixel text-2xl text-warn">
          {value}
        </output>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          className="flex size-11 items-center justify-center bg-elevated disabled:opacity-40"
          onClick={() => {
            haptic("tap")
            onChange(Math.min(max, value + 1))
          }}
        >
          <PlusIcon weight="fill" size={16} />
        </button>
      </div>
    </div>
  )
}

export function RouletteSetup({
  playerIds,
  tooManyPlayers,
  onNeedPlayers,
  onStarted,
}: {
  playerIds: string[]
  tooManyPlayers: boolean
  onNeedPlayers: () => void
  onStarted: () => void
}) {
  const start = useRoulette((state) => state.start)
  const [chambers, setChambers] = useState(() =>
    clampChambers(useRoulette.getState().chamberCount)
  )
  const [bullets, setBullets] = useState(() => {
    const saved = useRoulette.getState()
    return saved.inProgress
      ? clampBullets(saved.bullets, saved.chamberCount)
      : suggestedBullets(saved.chamberCount, playerIds.length)
  })
  const enoughPlayers = playerIds.length >= 2 && !tooManyPlayers

  function setChamberCount(next: number) {
    setChambers(next)
    setBullets((old) => clampBullets(old, next))
  }

  function play() {
    if (!enoughPlayers) {
      haptic("warn")
      playSound("error")
      onNeedPlayers()
      return
    }
    if (start(chambers, bullets, playerIds)) {
      haptic("success")
      playSound("roundStart")
      onStarted()
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 px-5 pt-1">
        <Stepper
          label="Chambers"
          value={chambers}
          min={MIN_CHAMBERS}
          max={MAX_CHAMBERS}
          onChange={setChamberCount}
        />
        <Stepper
          label="Loaded"
          value={bullets}
          min={1}
          max={chambers - 1}
          onChange={setBullets}
        />
        <p className="mt-2 text-xs/relaxed tracking-wide text-muted-foreground">
          {bullets === 1
            ? "One nasty surprise. Every safe click builds suspense."
            : `${bullets} surprises in ${chambers} chambers. Maximum mayhem.`}{" "}
          A hit resets the cylinder.
        </p>
      </div>
      <DrawerFooter className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <GameButton onClick={play}>
          {tooManyPlayers
            ? "TOO MANY (MAX 8)"
            : enoughPlayers
              ? "LOAD & PLAY"
              : "NEED 2 PLAYERS"}
        </GameButton>
      </DrawerFooter>
    </>
  )
}
