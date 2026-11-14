import { useState } from "react"
import { EyeIcon, FingerprintIcon, ShieldCheckIcon } from "@phosphor-icons/react"
import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { SpyData } from "../types"
import { SPY_WORD_DETAILS_SQ } from "../word-details-sq"

export function RolePass({
  round, onSeen, onNext,
}: {
  round: SpyData
  onSeen: (playerId: string) => void
  onNext: (playerId: string) => void
}) {
  const player = round.players.find((p) => p.id === round.order[round.revealIndex])!
  const isSpy = player.id === round.spyId
  const details = SPY_WORD_DETAILS_SQ[round.word]
  const [visible, setVisible] = useState(false)
  const [seen, setSeen] = useState(round.revealSeen)

  function showRole() {
    setVisible(true)
    haptic("tap")
    playSound("spyReveal")
    if (!seen) {
      setSeen(true)
      onSeen(player.id)
    }
  }

  function hideRole() {
    setVisible(false)
    haptic("tap")
  }

  function advance() {
    if (!seen || visible) return
    onNext(player.id)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 pb-3 text-center">
      <div className="shrink-0 pt-2">
        <p className="font-pixel text-xs tracking-wider text-muted-foreground">PLAYER {round.revealIndex + 1} OF {round.order.length}</p>
        <div className="mt-3 flex justify-center"><PlayerToken player={player} size="lg" className="text-2xl" /></div>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{visible ? "Read your card privately" : "Pass the phone to this player"}</p>
      </div>

      <div className={`spy-folder relative flex min-h-0 w-full max-w-md flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-5 sm:px-6 ${visible ? "spy-folder-open" : ""}`}>
        {visible ? (
          <div className="w-full space-y-3" aria-live="off">
            <div className="flex items-center justify-center gap-2">
              {isSpy ? <FingerprintIcon weight="fill" size={30} className="text-secret" /> : <ShieldCheckIcon weight="fill" size={30} className="text-go" />}
              <p className="text-xs font-bold tracking-widest text-muted-foreground">YOUR SECRET ROLE</p>
            </div>
            <h2 className={`font-display text-3xl font-black leading-tight sm:text-4xl ${isSpy ? "text-secret" : "text-go"}`}>
              {isSpy ? "YOU ARE THE SPY" : "CIVILIAN"}
            </h2>
            <p className="text-sm font-semibold text-muted-foreground">Category: <span className="text-foreground">{round.category}</span></p>
            {isSpy ? (
              <div className="space-y-3 border-t border-foreground/15 pt-5">
                <p className="text-xl font-bold leading-snug">You do not know the secret word.</p>
                <p className="text-base leading-relaxed text-muted-foreground">Listen to the others, ask questions, and try to blend in.</p>
              </div>
            ) : (
              <div className="space-y-3 border-t border-foreground/15 pt-4">
                <div>
                  <p className="text-xs font-bold tracking-widest text-muted-foreground">SECRET WORD</p>
                  <p className="mt-2 break-words font-display text-3xl font-black leading-tight text-foreground sm:text-4xl">{round.word}</p>
                </div>
                <div lang="sq" className="rounded-md bg-elevated p-4 text-left">
                  <p className="text-xs font-bold tracking-widest text-muted-foreground">SHQIP</p>
                  <p className="mt-1 break-words text-xl font-bold leading-snug text-foreground">{details?.translation ?? round.word}</p>
                  <p className="mt-3 text-xs font-bold tracking-widest text-muted-foreground">PËRSHKRIMI</p>
                  <p className="mt-1 text-base leading-relaxed text-foreground">{details?.description ?? "Përshkrimi nuk është i disponueshëm."}</p>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Keep the word secret.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-5">
            <EyeIcon size={56} weight="duotone" className="text-muted-foreground" />
            <p className="font-display text-2xl font-black">SECRET CARD</p>
            <p className="max-w-xs text-base leading-relaxed text-muted-foreground">Make sure nobody else can see the screen. Tap below to read your role.</p>
          </div>
        )}
      </div>

      <div className="w-full shrink-0 space-y-2">
        {visible ? (
          <GameButton tone="secret" onClick={hideRole}>HIDE MY CARD</GameButton>
        ) : !seen ? (
          <GameButton tone="secret" onClick={showRole}>TAP TO REVEAL</GameButton>
        ) : (
          <>
            <GameButton tone="secret" onClick={advance}>
              {round.revealIndex + 1 === round.order.length ? "START DISCUSSION" : "PASS TO NEXT PLAYER"}
            </GameButton>
            <button type="button" onClick={showRole} className="min-h-11 w-full text-sm font-semibold text-muted-foreground underline underline-offset-4">View my card again</button>
          </>
        )}
        <p className="text-xs text-muted-foreground">{visible ? "Hide your card before passing the phone." : seen ? "Your role is hidden. It is safe to pass the phone." : "Only the named player should reveal this card."}</p>
      </div>
    </div>
  )
}
