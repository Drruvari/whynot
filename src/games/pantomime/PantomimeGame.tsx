import { useEffect, useRef, useState } from "react"
import { GameHeader, GameScreen } from "@/components/game/GameScreen"
import { GameButton } from "@/components/game/GameButton"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { MIME_WORDS } from "./words"

type Phase = "ready" | "acting" | "result"
const DURATIONS = [60, 120, 300, 600] as const
const MAX_DURATION = 120 * 60

export function PantomimeGame() {
  const players = useSession((state) => state.players)
  const [duration, setDuration] = useState(60)
  const [customMinutes, setCustomMinutes] = useState("1")
  const [customSeconds, setCustomSeconds] = useState("0")
  const [phase, setPhase] = useState<Phase>("ready")
  const [turn, setTurn] = useState(0)
  const [used, setUsed] = useState<number[]>([])
  const [wordIndex, setWordIndex] = useState(() => Math.floor(Math.random() * MIME_WORDS.length))
  const [remaining, setRemaining] = useState(60)
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [showWord, setShowWord] = useState(false)
  const deadline = useRef<number | null>(null)
  const actor = players.length ? players[turn % players.length] : undefined
  const eligible = players.filter((p) => p.id !== actor?.id)
  const winner = players.find((p) => p.id === winnerId)
  const timeUp = phase === "acting" && remaining === 0

  useEffect(() => {
    if (phase !== "acting" || deadline.current === null) return
    const tick = () => {
      const next = Math.max(0, Math.ceil((deadline.current! - Date.now()) / 1000))
      setRemaining(next)
      if (next === 0) deadline.current = null
    }
    tick()
    const interval = window.setInterval(tick, 200)
    return () => window.clearInterval(interval)
  }, [phase, turn])

  function setCustomTime(minutes: string, seconds: string) {
    setCustomMinutes(minutes)
    setCustomSeconds(seconds)
    if (minutes.trim() === "" && seconds.trim() === "") return
    const m = Number(minutes || 0)
    const s = Number(seconds || 0)
    if (!Number.isInteger(m) || !Number.isInteger(s) || m < 0 || s < 0 || s > 59) return
    const total = m * 60 + s
    if (total >= 5 && total <= MAX_DURATION) {
      setDuration(total)
      setRemaining(total)
    }
  }

  function begin() {
    if (!actor) return
    deadline.current = Date.now() + duration * 1000
    setRemaining(duration)
    setPhase("acting")
    setShowWord(false)
    haptic("success")
    playSound("roundStart")
  }

  function finish(id: string | null) {
    if (phase !== "acting") return
    deadline.current = null
    setWinnerId(id)
    if (id) setScores((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
    setPhase("result")
    haptic(id ? "success" : "tap")
    playSound(id ? "roundStart" : "click")
  }

  function nextRound() {
    const alreadyUsed = [...used, wordIndex]
    const options = MIME_WORDS.map((_, i) => i).filter((i) => !alreadyUsed.includes(i))
    const pool = options.length ? options : MIME_WORDS.map((_, i) => i)
    const index = pool[Math.floor(Math.random() * pool.length)]
    setUsed(options.length ? [...alreadyUsed] : [])
    setWordIndex(index)
    setTurn((value) => value + 1)
    setRemaining(duration)
    setWinnerId(null)
    setShowWord(false)
    setPhase("ready")
    deadline.current = null
  }

  function reset() {
    setTurn(0)
    setScores({})
    setUsed([])
    setWordIndex(Math.floor(Math.random() * MIME_WORDS.length))
    setRemaining(duration)
    setWinnerId(null)
    setShowWord(false)
    setPhase("ready")
    deadline.current = null
  }

  const clock = `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`

  return (
    <GameScreen>
      <GameHeader title="PANTOMIME" />
      {players.length < 2 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <h1 className="font-display text-3xl font-black">NEED 2+ PLAYERS</h1>
          <p className="text-sm text-muted-foreground">Add players from the home screen to play.</p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2">
          <div className="shrink-0 text-center">
            <p className="font-pixel text-xs tracking-widest text-muted-foreground">ROUND {turn + 1} · ACTOR</p>
            <h1 className="mt-2 break-words font-display text-3xl font-black">{actor?.name}</h1>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto border-2 border-warn/50 bg-card p-4 text-center">
            {phase === "ready" ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <p className="font-display text-2xl font-black">ACT IT OUT!</p>
                <p className="max-w-xs text-sm text-muted-foreground">Pass the phone to {actor?.name}. Only the actor should see the word.</p>
                <div className="w-full border-t border-foreground/15 pt-4">
                  <p className="mb-3 text-xs font-bold tracking-widest text-muted-foreground">ROUND TIMER</p>
                  <div className="grid grid-cols-4 gap-2">
                    {DURATIONS.map((n) => <button key={n} type="button" onClick={() => { setDuration(n); setRemaining(n); setCustomMinutes(String(Math.floor(n / 60))); setCustomSeconds(String(n % 60)) }} className={`min-h-12 border-2 text-sm font-bold ${duration === n ? "border-warn bg-warn text-black" : "border-foreground/20 bg-elevated"}`}>{`${n / 60}m`}</button>)}
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">MIN <input aria-label="Custom timer minutes" type="number" min="0" max="120" inputMode="numeric" value={customMinutes} onChange={(e) => setCustomTime(e.target.value, customSeconds)} className="h-11 w-16 border-2 border-foreground/25 bg-card px-2 text-center text-base font-bold text-foreground" /></label>
                    <span className="font-pixel text-xl">:</span>
                    <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">SEC <input aria-label="Custom timer seconds" type="number" min="0" max="59" inputMode="numeric" value={customSeconds} onChange={(e) => setCustomTime(customMinutes, e.target.value)} className="h-11 w-16 border-2 border-foreground/25 bg-card px-2 text-center text-base font-bold text-foreground" /></label>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Custom: 5 seconds to 120 minutes · Selected: {Math.floor(duration / 60)}m {duration % 60}s</p>
                </div>
                <button type="button" onClick={() => setShowWord((v) => !v)} className="w-full border-2 border-foreground/25 bg-elevated p-4">
                  <p className="text-xs font-bold tracking-widest text-muted-foreground">{showWord ? "YOUR WORD" : "SECRET WORD"}</p>
                  <p className="mt-2 break-words font-display text-2xl font-black">{showWord ? MIME_WORDS[wordIndex].word : "TAP TO REVEAL"}</p>
                  {showWord ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{MIME_WORDS[wordIndex].description}</p> : null}
                </button>
                <p className="text-xs text-muted-foreground">No talking, spelling, or pointing at objects.</p>
              </div>
            ) : phase === "acting" ? (
              <div className="flex flex-1 flex-col gap-3">
                <p className="text-xs font-bold tracking-widest text-muted-foreground">TIME LEFT</p>
                <p className={`font-pixel text-5xl tabular-nums ${remaining <= 10 ? "text-danger" : "text-warn"}`}>{clock}</p>
                <p className="text-sm text-muted-foreground">{timeUp ? "TIME'S UP!" : "First correct guess wins the round. Tap the winner below."}</p>
                <div className="grid grid-cols-2 gap-2">
                  {eligible.map((p) => <button key={p.id} type="button" onClick={() => finish(p.id)} className="min-h-14 border-2 border-foreground/20 bg-elevated p-2 text-sm font-bold">{p.name}</button>)}
                </div>
                <div className="mt-auto pt-3">
                  <button type="button" onClick={() => finish(null)} className="min-h-12 w-full border-2 border-foreground/20 text-sm font-bold">{timeUp ? "NO ONE GUESSED" : "SKIP / NO WINNER"}</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-4">
                <p className="font-pixel text-xs tracking-widest text-muted-foreground">ROUND COMPLETE</p>
                <h2 className="font-display text-3xl font-black">{winner ? `${winner.name} WINS!` : "NO WINNER"}</h2>
                <p className="text-sm text-muted-foreground">The word was</p>
                <p className="break-words font-display text-2xl font-black text-warn">{MIME_WORDS[wordIndex].word}</p>
                <div className="w-full border-t border-foreground/15 pt-4">
                  <p className="mb-2 text-xs font-bold tracking-widest text-muted-foreground">SCORES</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)).map((p) => <span key={p.id} className="bg-elevated px-3 py-2 text-xs font-bold">{p.name}: {scores[p.id] ?? 0}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2">
            {phase === "ready" ? (
              <GameButton tone="go" disabled={!showWord} onClick={begin}>START TIMER</GameButton>
            ) : phase === "result" ? (
              <GameButton tone="go" onClick={nextRound}>NEXT ACTOR</GameButton>
            ) : null}
            <button type="button" onClick={reset} className="min-h-10 w-full text-xs font-bold tracking-widest text-muted-foreground uppercase">Reset game</button>
          </div>
        </div>
      )}
    </GameScreen>
  )
}
