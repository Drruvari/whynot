import { GameButton } from "@/components/game/GameButton"
import type { Player } from "@/lib/types"
import type { RunSnapshot } from "../types"

export function WobbleResults({ snapshot, players, record, bestHeight, onAgain }: {
  snapshot: RunSnapshot
  players: Player[]
  record: number
  bestHeight: number
  onAgain: () => void
}) {
  const legendary = snapshot.reason.startsWith("LEGEND!")
  const ranked = [...players].sort((a, b) => (snapshot.points[b.id] ?? 0) - (snapshot.points[a.id] ?? 0))
  return (
    <div className="wobble-result" role="dialog" aria-modal="true" aria-label={legendary ? "Tower completed" : "Tower collapsed"}>
      <p className="font-pixel text-sm tracking-widest text-[#ffb6a8]">{legendary ? "IMPOSSIBLE TOWER COMPLETE" : "THE TOWER HAS FALLEN"}</p>
      <p className="mt-2 font-display text-4xl font-extrabold tracking-tighter text-white">{legendary ? "LEGEND!" : "TIMBER!"}</p>
      <p className="mt-2 text-sm text-white/80">{snapshot.reason}</p>
      <div className="wobble-result-stats">
        <div><b>{snapshot.score.toLocaleString()}</b><span>POINTS</span></div>
        <div><b>{(snapshot.height / 7).toFixed(1)}m</b><span>HEIGHT</span></div>
        <div><b>{snapshot.turns}</b><span>LANDED</span></div>
      </div>
      <p className="mb-3 text-xs font-bold tracking-widest text-white/60 uppercase">BEST {record.toLocaleString()} PTS · {(bestHeight / 7).toFixed(1)}m</p>
      {ranked.length > 1 ? (
        <div className="max-h-36 w-full overflow-y-auto border-t border-white/20 text-left">
          {ranked.map((player, index) => (
            <div key={player.id} className="flex justify-between border-b border-white/15 py-2 text-sm">
              <span><span className="mr-2 text-white/50">{index + 1}.</span>{player.name}</span>
              <b>{(snapshot.points[player.id] ?? 0).toLocaleString()}</b>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4 w-full"><GameButton onClick={onAgain}>TRY AGAIN</GameButton></div>
    </div>
  )
}
