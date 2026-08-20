import { useState, type ReactNode } from "react"
import { SpeakerHigh, SpeakerSlash, X } from "@phosphor-icons/react"

import { ConfirmDialog } from "@/components/game/ConfirmDialog"
import { cn } from "@/lib/utils"
import { playSound } from "@/lib/sound"
import { useApp } from "@/store/app"

export function GameScreen({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-background px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      {children}
    </div>
  )
}

export function GameHeader({ title }: { title: string }) {
  const soundOn = useApp((state) => state.soundOn)
  const setSoundOn = useApp((state) => state.setSoundOn)
  const exitGame = useApp((state) => state.exitGame)
  const confirmExit = useApp((state) => state.confirmExit)
  const [asking, setAsking] = useState(false)

  function requestExit() {
    playSound("back")
    if (confirmExit) {
      setAsking(true)
      return
    }
    exitGame()
  }

  return (
    <>
      <header className="flex h-[8%] shrink-0 items-center justify-between">
        <button
          type="button"
          aria-label="Exit game"
          onClick={requestExit}
          className="flex size-11 items-center justify-center text-muted-foreground"
        >
          <X weight="fill" size={22} />
        </button>
        <p className="font-display text-sm font-extrabold tracking-[0.22em] text-muted-foreground">
          {title}
        </p>
        <button
          type="button"
          aria-label={soundOn ? "Mute" : "Unmute"}
          onClick={() => {
            const next = !soundOn
            setSoundOn(next)
            if (next) {
              playSound("toggle")
            }
          }}
          className="flex size-11 items-center justify-center text-muted-foreground"
        >
          {soundOn ? (
            <SpeakerHigh weight="fill" size={22} />
          ) : (
            <SpeakerSlash weight="fill" size={22} />
          )}
        </button>
      </header>

      <ConfirmDialog
        open={asking}
        onOpenChange={setAsking}
        title="LEAVE GAME?"
        description="Your current round will stay saved."
        cancelLabel="STAY"
        confirmLabel="LEAVE"
        confirmTone="muted"
        onConfirm={exitGame}
      />
    </>
  )
}

export function GamePrompt({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex h-[12%] shrink-0 flex-col items-center justify-center text-center">
      <h1 className="font-display text-2xl font-extrabold tracking-tight uppercase">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export function GameArea({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  )
}

export function GameStatus({
  children,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex h-[20%] shrink-0 flex-col items-center justify-center gap-2 text-center">
      <p className="font-pixel text-lg tracking-wide text-muted-foreground">
        {children}
      </p>
      {footer ? (
        <p className="font-pixel text-sm text-muted-foreground">{footer}</p>
      ) : null}
    </div>
  )
}
