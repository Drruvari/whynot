import { DetectiveIcon, TrophyIcon } from "@phosphor-icons/react"
import { GameButton } from "@/components/game/GameButton"
import { PlayerToken } from "@/components/game/PlayerToken"
import type { SpyData } from "../types"

export function SpyResults({ round, onAgain }: { round: SpyData; onAgain: () => void }) {
  const result = round.outcome!
  const spy = round.players.find((p) => p.id === round.spyId)!
  const accused = round.players.find((p) => p.id === result.accusedId)
  const spyWon = result.winner === "spy"
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <div className={`spy-verdict px-5 py-5 text-center ${spyWon ? "spy-verdict-spy" : "spy-verdict-caught"}`}>
        {spyWon ? <DetectiveIcon size={58} weight="fill" className="mx-auto" /> : <TrophyIcon size={58} weight="fill" className="mx-auto" />}
        <p className="mt-3 font-pixel text-xs tracking-widest">ROUND {round.roundNumber} · CASE CLOSED</p>
        <h1 className="mt-3 font-display text-3xl font-black">{spyWon ? "SPY WINS" : "SPY BUSTED"}</h1>
        <p className="mt-3 text-sm font-semibold">
          {result.tie ? "Split vote. Nobody was caught." :
           !result.spyCaught ? `Wrong accusation: ${accused?.name ?? "unknown"}.` :
           result.spyGuessed ? `${spy.name} guessed the word and escaped.` :
           `${spy.name} missed the final guess.`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-left">
        <div className="bg-card px-4 py-3"><p className="font-pixel text-[11px] text-muted-foreground">THE SPY</p><div className="mt-2"><PlayerToken player={spy} /></div></div>
        <div className="bg-card px-4 py-3"><p className="font-pixel text-[11px] text-muted-foreground">THE WORD</p><p className="mt-2 font-display text-base font-bold break-words">{round.word}</p></div>
      </div>
      <div className="bg-card px-4 py-3">
        <p className="font-pixel text-xs tracking-widest text-muted-foreground">THE VOTES</p>
        <div className="mt-3 space-y-3">
          {[...round.players].sort((a, b) => (result.tally[b.id] ?? 0) - (result.tally[a.id] ?? 0)).map((player) => (
            <div key={player.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{player.name}{player.id === round.spyId ? " (SPY)" : ""}</span>
              <div className="h-2 w-24 shrink-0 bg-elevated"><div className="h-2 bg-secret" style={{ width: `${(result.tally[player.id] / round.players.length) * 100}%` }} /></div>
              <span className="w-4 text-right font-pixel text-sm">{result.tally[player.id]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card px-4 py-3">
        <p className="font-pixel text-xs tracking-widest text-muted-foreground">SCOREBOARD</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...round.players].sort((a, b) => (round.scores[b.id] ?? 0) - (round.scores[a.id] ?? 0)).map((player) => (
            <span key={player.id} className="bg-elevated px-3 py-2 text-xs font-semibold">{player.name}: {round.scores[player.id] ?? 0}</span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Spy win +2 · Civilian win +1 each. Penalties are optional: sip, dare, or skip.</p>
      </div>
      <div className="mt-auto pt-1"><GameButton tone={spyWon ? "secret" : "go"} onClick={onAgain}>NEXT MISSION</GameButton></div>
    </div>
  )
}
