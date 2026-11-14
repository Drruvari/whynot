import { useState } from "react"
import { ArrowRightIcon, EyeIcon, EyeSlashIcon, FingerprintIcon, ShieldCheckIcon } from "@phosphor-icons/react"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import type { SpyData } from "../types"
import { SPY_WORD_DETAILS_SQ } from "../word-details-sq"

export function RolePass({ round, onSeen, onNext }: {
  round: SpyData
  onSeen: (playerId: string) => void
  onNext: (playerId: string) => void
}) {
  const player = round.players.find((p) => p.id === round.order[round.revealIndex])!
  const isSpy = player.id === round.spyId
  const details = SPY_WORD_DETAILS_SQ[round.word]
  const [visible, setVisible] = useState(false)
  const [seen, setSeen] = useState(round.revealSeen)
  const isLast = round.revealIndex === round.order.length - 1

  function reveal() {
    setVisible(true)
    haptic("tap")
    playSound("spyReveal")
    if (!seen) {
      setSeen(true)
      onSeen(player.id)
    }
  }

  function hide() {
    setVisible(false)
    haptic("tap")
  }

  function next() {
    if (!seen || visible) return
    onNext(player.id)
  }

  return (
    <section className="spy-deal">
      <div className="spy-deal-top">
        <div className="spy-deal-progress" aria-label={`Player ${round.revealIndex + 1} of ${round.order.length}`}>
          {round.order.map((id, index) => <span key={id} className={index <= round.revealIndex ? "is-active" : ""} />)}
        </div>
        <p className="spy-deal-step">PLAYER {round.revealIndex + 1} / {round.order.length}</p>
        <h1 className="spy-deal-name">{player.name}</h1>
        <p className="spy-deal-hint">{visible ? "Your eyes only. Read your secret card." : seen ? "Card hidden. Pass the phone when ready." : "Hand the phone to this player."}</p>
      </div>

      <div className={`spy-role-card ${visible ? (isSpy ? "spy-role-card--spy" : "spy-role-card--civilian") : "spy-role-card--locked"}`}>
        {!visible ? (
          <div className="spy-role-locked">
            <div className="spy-role-lock-icon"><FingerprintIcon size={46} weight="duotone" /></div>
            <p className="spy-role-eyebrow">PRIVATE ROLE</p>
            <h2>TOP SECRET</h2>
            <p>Only {player.name} should look.</p>
          </div>
        ) : (
          <div className="spy-role-content">
            <div className="spy-role-heading">
              {isSpy ? <FingerprintIcon size={25} weight="fill" /> : <ShieldCheckIcon size={25} weight="fill" />}
              <span>YOUR ROLE</span>
            </div>
            <h2 className="spy-role-title">{isSpy ? "YOU'RE THE SPY" : "CIVILIAN"}</h2>
            <div className="spy-role-category">CATEGORY <strong>{round.category}</strong></div>
            {isSpy ? (
              <div className="spy-role-spy-message">
                <p className="spy-role-main-message">You don't know the word.</p>
                <p>Listen carefully, ask questions and blend in.</p>
              </div>
            ) : (
              <div className="spy-role-word-section">
                <p className="spy-role-label">SECRET WORD</p>
                <p className="spy-role-word">{round.word}</p>
                <div className="spy-role-translation" lang="sq">
                  <p className="spy-role-label">NË SHQIP</p>
                  <p className="spy-role-albanian">{details?.translation ?? round.word}</p>
                  <div className="spy-role-description">
                    <p className="spy-role-label">PËRSHKRIMI</p>
                    <p>{details?.description ?? "Përshkrimi nuk është i disponueshëm."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="spy-deal-actions">
        {visible ? (
          <button type="button" className="spy-deal-primary" onClick={hide}><EyeSlashIcon size={23} weight="bold" /> HIDE CARD</button>
        ) : !seen ? (
          <button type="button" className="spy-deal-primary" onClick={reveal}><EyeIcon size={23} weight="bold" /> REVEAL MY CARD</button>
        ) : (
          <>
            <button type="button" className="spy-deal-primary" onClick={next}>
              {isLast ? "START DISCUSSION" : "NEXT PLAYER"} <ArrowRightIcon size={23} weight="bold" />
            </button>
            <button type="button" className="spy-deal-secondary" onClick={reveal}>View my card again</button>
          </>
        )}
      </div>
    </section>
  )
}
