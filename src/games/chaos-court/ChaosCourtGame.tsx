import { useEffect, useState } from "react"
import { GameHeader, GameScreen } from "@/components/game/GameScreen"
import { GameButton } from "@/components/game/GameButton"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"

const CASES = [
  "would accidentally become the leader of a cult",
  "would sell the group out for a lifetime supply of pizza",
  "would survive the longest in a zombie apocalypse",
  "would get arrested for something unbelievably stupid",
  "would secretly be a supervillain",
  "would start an international incident on vacation",
  "would lose a million dollars in under an hour",
  "would accidentally join a pyramid scheme",
  "would fake their own disappearance for attention",
  "would become famous for the worst possible reason",
  "would be the first eliminated from a reality show",
  "would accidentally leak a government secret",
  "would fall for an obvious online scam",
  "would get kicked out of a fancy restaurant",
  "would befriend the villain in a horror movie",
  "would bring a suitcase of snacks to a desert island",
  "would accidentally set off a museum alarm",
  "would win an argument using completely made-up facts",
  "would become a dictator if given a tiny amount of power",
  "would get lost inside their own hotel",
  "would try to negotiate with a ghost",
  "would accidentally marry a stranger in Las Vegas",
  "would survive a week with no internet",
  "would forget their own secret identity",
  "would spend their last money on concert tickets",
  "would get banned from an amusement park",
  "would mistake a celebrity for a waiter",
  "would accidentally become an internet meme",
  "would lie about speaking another language",
  "would start a fight with a robot",
  "would become a terrible undercover spy",
  "would get caught cheating at a board game",
  "would believe the moon is made of cheese",
  "would buy a haunted house because it was cheap",
  "would lose their passport five minutes after landing",
  "would try to pet a wild animal",
  "would turn a minor inconvenience into a dramatic speech",
  "would accidentally send a private message to the group chat",
  "would join a pirate crew for the outfits",
  "would steal the spotlight at someone else's wedding",
  "would survive an alien invasion by pure luck",
  "would be fooled by their own prank",
  "would spend three hours choosing a movie",
  "would break a world record nobody cares about",
  "would run for president as a joke and win",
  "would mistake a mannequin for a real person",
  "would get fired on their first day as a detective",
  "would open a suspicious treasure chest immediately",
  "would challenge a professional athlete and genuinely expect to win",
  "would get into an argument with a GPS",
  "would start a conspiracy theory about the group",
  "would secretly have a second life as a magician",
  "would get stuck in an escape room after everyone else leaves",
  "would buy a ridiculous luxury item just to flex",
  "would become a millionaire selling something useless",
  "would accidentally crash a wedding",
  "would try to bribe a referee with candy",
  "would make the worst possible wish to a genie",
  "would panic first during a haunted-house tour",
  "would betray their team in a game show for five euros",
  "would invent a fake holiday and force everyone to celebrate",
  "would get famous for a terrible dance move",
  "would try to flirt their way out of a parking ticket",
  "would get trapped in a revolving door",
  "would forget the plan during a bank-heist movie",
  "would get banned from a library for being too loud",
  "would think they could beat a kangaroo in a fight",
  "would lose a staring contest to a statue",
  "would start a feud with a neighbor over a plant",
  "would accidentally become the mascot of a sports team",
  "would win a talent show with absolutely no talent",
  "would bring a karaoke machine to a camping trip",
  "would become the villain of the friend group",
  "would try to teach a parrot to insult everyone",
  "would spend their entire paycheck on mystery boxes",
  "would be chosen by aliens as Earth's representative",
  "would try to outsmart a lie detector",
  "would get caught sneaking snacks into a cinema",
  "would fake knowing the rules of a complicated game",
  "would accidentally reveal the surprise party",
  "would be the first to touch a mysterious glowing button"
] as const
const TOTAL_ROUNDS = 10
type Phase = "pass" | "accuse" | "defend" | "vote" | "verdict" | "finish"
type Vote = "guilty" | "innocent"
const choose = (max: number) => Math.floor(Math.random() * max)

export function ChaosCourtGame() {
  const players = useSession((state) => state.players)
  const [roster, setRoster] = useState(() => players.map((p) => ({ id: p.id, name: p.name })))
  const [phase, setPhase] = useState<Phase>("pass")
  const [round, setRound] = useState(0)
  const [used, setUsed] = useState<number[]>([])
  const [caseIndex, setCaseIndex] = useState(() => choose(CASES.length))
  const [accused, setAccused] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, Vote>>({})
  const [seconds, setSeconds] = useState(20)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [lastVerdict, setLastVerdict] = useState<Vote>("innocent")
  const [lastVotes, setLastVotes] = useState({ guilty: 0, innocent: 0 })
  const judge = roster[round % roster.length]
  const defendant = roster.find((p) => p.id === accused)
  const voters = roster.filter((p) => p.id !== accused)
  const currentVoter = voters[Object.keys(votes).length]
  const guilty = Object.values(votes).filter((v) => v === "guilty").length
  const innocent = Object.values(votes).filter((v) => v === "innocent").length

  useEffect(() => {
    if (phase !== "defend" || seconds <= 0) return
    const timer = window.setInterval(() => setSeconds((n) => Math.max(0, n - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [phase, seconds])

  function newCase(nextRound: number, previousUsed: number[]) {
    const available = CASES.map((_, i) => i).filter((i) => !previousUsed.includes(i))
    const next = available[choose(available.length)]
    setCaseIndex(next)
    setUsed([...previousUsed, next])
    setRound(nextRound)
    setAccused(null)
    setVotes({})
    setSeconds(20)
    setPhase("pass")
  }

  function start() {
    if (players.length < 3 || players.length > 10) return
    setRoster(players.map((p) => ({ id: p.id, name: p.name })))
    setScores(Object.fromEntries(players.map((p) => [p.id, 0])))
    newCase(0, [])
    haptic("success")
    playSound("roundStart")
  }

  function submitVote(value: Vote) {
    if (!currentVoter || phase !== "vote") return
    const next = { ...votes, [currentVoter.id]: value }
    setVotes(next)
    haptic("tap")
    if (Object.keys(next).length !== voters.length) return
    const yes = Object.values(next).filter((v) => v === "guilty").length
    const no = voters.length - yes
    const verdict = yes > no ? "guilty" : "innocent"
    setLastVerdict(verdict)
    setLastVotes({ guilty: yes, innocent: no })
    setScores((old) => {
      const updated = { ...old }
      // The defendant earns 2 points for convincing the jury of innocence.
      if (verdict === "innocent" && accused) updated[accused] = (updated[accused] ?? 0) + 2
      // Jurors on the winning side earn 1 point each.
      for (const [id, vote] of Object.entries(next)) {
        if (vote === verdict) updated[id] = (updated[id] ?? 0) + 1
      }
      return updated
    })
    playSound("voteReveal")
    setPhase("verdict")
  }

  const button = (label: string, action: () => void) => <GameButton onClick={action}>{label}</GameButton>
  if (roster.length < 3 || roster.length > 10 || !players.some((p) => roster.some((r) => r.id === p.id))) {
    return <GameScreen><GameHeader title="CHAOS COURT" /><div className="flex flex-1 flex-col items-center justify-center gap-5 text-center"><p className="font-display text-2xl font-black">3–10 PLAYERS REQUIRED</p>{button("START NEW GAME", start)}</div></GameScreen>
  }
  return <GameScreen>
    <GameHeader title="CHAOS COURT" />
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto py-4 text-center">
      <p className="font-pixel text-xs tracking-widest text-muted-foreground">{phase === "finish" ? "FINAL RESULTS" : `CASE ${round + 1} / ${TOTAL_ROUNDS}`}</p>
      {phase === "pass" && <>
        <p className="font-display text-3xl font-black">PASS THE PHONE</p>
        <p className="text-lg">To <strong>{judge.name}</strong>, the prosecutor.</p>
        <p className="max-w-xs text-sm text-muted-foreground">Only the prosecutor should see the next screen. Choose someone to accuse!</p>
        {button("I'M READY", () => setPhase("accuse"))}
      </>}
      {phase === "accuse" && <>
        <p className="font-display text-2xl font-black">THE CHARGE</p>
        <p className="max-w-sm bg-card p-5 font-display text-xl font-bold">Who {CASES[caseIndex]}?</p>
        <p className="text-xs text-muted-foreground">Pick anyone except yourself. No changing your mind.</p>
        <div className="grid w-full grid-cols-2 gap-2">{roster.filter((p) => p.id !== judge.id).map((p) => <button type="button" key={p.id} className="min-h-14 bg-elevated p-3 font-bold" onClick={() => { setAccused(p.id); setSeconds(20); setPhase("defend"); haptic("warn"); playSound("warning") }}>{p.name}</button>)}</div>
      </>}
      {phase === "defend" && <>
        <p className="font-display text-3xl font-black text-danger">YOU'RE ACCUSED!</p>
        <p className="text-lg font-bold">{defendant?.name}</p>
        <p className="max-w-sm bg-card p-5 text-xl font-bold">{defendant?.name} {CASES[caseIndex]}.</p>
        <p className="font-pixel text-5xl tabular-nums">{seconds}</p>
        <p className="max-w-xs text-sm text-muted-foreground">Defend yourself out loud. Everyone else can argue against you. Then pass the phone to vote privately.</p>
        {button(seconds ? "END DEFENSE & VOTE" : "TIME'S UP — VOTE", () => { setVotes({}); setPhase("vote") })}
      </>}
      {phase === "vote" && currentVoter && <>
        <p className="font-display text-2xl font-black">SECRET JURY VOTE</p>
        <p className="text-lg">Pass to <strong>{currentVoter.name}</strong></p>
        <p className="max-w-xs text-sm text-muted-foreground">Only {currentVoter.name} should tap. Is {defendant?.name} guilty of the charge?</p>
        <div className="grid w-full grid-cols-2 gap-3">
          <button type="button" onClick={() => submitVote("guilty")} className="min-h-24 bg-danger p-3 font-display text-lg font-black text-white">GUILTY</button>
          <button type="button" onClick={() => submitVote("innocent")} className="min-h-24 bg-go p-3 font-display text-lg font-black text-black">INNOCENT</button>
        </div>
        <p className="font-pixel text-xs text-muted-foreground">{Object.keys(votes).length + 1} / {voters.length} JURORS</p>
      </>}
      {phase === "verdict" && <>
        <p className="font-display text-4xl font-black">{lastVerdict === "guilty" ? "GUILTY!" : "NOT GUILTY!"}</p>
        <p className="text-xl">{defendant?.name}</p>
        <p className="font-pixel text-sm">{lastVotes.guilty} GUILTY · {lastVotes.innocent} INNOCENT</p>
        <p className="max-w-xs text-sm text-muted-foreground">Jurors who backed the verdict get 1 point. An innocent defendant gets 2 points.</p>
        {button(round + 1 === TOTAL_ROUNDS ? "FINAL LEADERBOARD" : "NEXT CASE", () => round + 1 === TOTAL_ROUNDS ? setPhase("finish") : newCase(round + 1, used))}
      </>}
      {phase === "finish" && <>
        <p className="font-display text-3xl font-black">COURT ADJOURNED</p>
        <div className="w-full space-y-2">{[...roster].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)).map((p, i) => <div key={p.id} className="flex items-center justify-between bg-card p-4"><span className="font-bold">{i + 1}. {p.name}</span><span className="font-pixel">{scores[p.id] ?? 0} PTS</span></div>)}</div>
        {button("PLAY AGAIN", start)}
      </>}
    </div>
  </GameScreen>
}
