import { useCallback, useEffect, useRef, useState } from "react"
import { GameButton } from "@/components/game/GameButton"
import { GameHeader, GameScreen } from "@/components/game/GameScreen"
import { useGameMotion } from "@/hooks/use-game-motion"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useSession } from "@/store/session"
import { PieceQueue } from "./components/PieceQueue"
import { WobbleCanvas } from "./components/WobbleCanvas"
import { WobbleResults } from "./components/WobbleResults"
import { WobbleWorld } from "./physics"
import { JUNK_NAMES, validPlayers } from "./rules"
import { useWobble } from "./store"
import type { RunSnapshot, SavedRun } from "./types"
import "./wobble.css"

export function WobbleGame() {
  const players = useSession((state) => state.players)
  const playerIds = useWobble((state) => state.playerIds)
  const sessionId = useWobble((state) => state.sessionId)
  const difficulty = useWobble((state) => state.difficulty)
  const bestScore = useWobble((state) => state.bestScore)
  const bestHeight = useWobble((state) => state.bestHeight)
  const start = useWobble((state) => state.start)
  const finish = useWobble((state) => state.finish)
  const reduceMotion = Boolean(useGameMotion())
  const worldRef = useRef<WobbleWorld | null>(null)
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null)
  const validCrew = validPlayers(playerIds) && playerIds.every((id) => players.some((p) => p.id === id))
  const current = snapshot ? players.find((p) => p.id === playerIds[snapshot.playerIndex]) : null
  const nextPlayer = snapshot ? players.find((p) => p.id === playerIds[(snapshot.playerIndex + 1) % playerIds.length]) : null

  useEffect(() => {
    if (playerIds.length === 0 && players.length > 0 && players.length <= 10) {
      start(difficulty, players.map((player) => player.id))
    }
  }, [playerIds.length, players, start, difficulty])

  const onWorld = useCallback((world: WobbleWorld | null) => { worldRef.current = world }, [])
  const onUpdate = useCallback((value: RunSnapshot) => { setSnapshot(value) }, [])
  const onFinished = useCallback((value: SavedRun) => { finish(value) }, [finish])
  const onImpact = useCallback((kind: "land" | "fail" | "stage") => {
    playSound(kind === "land" ? "safe" : kind === "stage" ? "roundStart" : "bomb")
    haptic(kind === "fail" ? "bomb" : "success")
  }, [])

  const startDrag = useCallback(() => worldRef.current?.beginDrag() ?? false, [])
  const moveDrag = useCallback((x: number, y: number) => worldRef.current?.dragTo(x, y), [])
  const releaseDrag = useCallback((x: number, y: number) => {
    const placed = worldRef.current?.releaseDrag(x, y)
    if (placed) { haptic("tap"); playSound("click") }
  }, [])
  const cancelDrag = useCallback(() => worldRef.current?.cancelDrag(), [])
  const placeOnCanvas = useCallback((x: number, y: number) => {
    if (worldRef.current?.placeAt(x, y)) { haptic("tap"); playSound("click") }
  }, [])

  function again() {
    setSnapshot(null)
    start(difficulty, [...playerIds])
    playSound("roundStart")
  }

  if (!validCrew) {
    return (
      <GameScreen>
        <GameHeader title="WOBBLE LAB" />
        <div className="m-auto w-full max-w-sm space-y-5 text-center">
          <p className="font-display text-2xl font-bold">CREW MISSING</p>
          <p className="text-sm text-muted-foreground">Choose your players to begin a new tower.</p>
          <GameButton disabled={players.length < 1 || players.length > 10}
            onClick={() => start(difficulty, players.map((p) => p.id))}>START A RUN</GameButton>
        </div>
      </GameScreen>
    )
  }

  const phase = snapshot?.phase ?? "aim"
  const instruction = phase === "falling" ? "HOLD YOUR BREATH..."
    : phase === "landed" && snapshot?.stageCleared ? "STAGE CLEARED!"
    : phase === "landed" ? `+${snapshot?.lastPoints ?? 0} POINTS!`
    : `YOUR MOVE${current ? `, ${current.name}` : ""}!`
  const hint = phase === "aim" ? `DRAG THE ${JUNK_NAMES[snapshot?.junk ?? "crate"]} INTO THE SCENE`
    : phase === "falling" ? "WAIT FOR THE PIECE TO SETTLE"
    : phase === "landed" && playerIds.length === 1 ? "NEXT PIECE COMING UP"
    : phase === "landed" ? `PASS TO ${nextPlayer?.name ?? "NEXT PLAYER"}` : ""

  return (
    <GameScreen className="wobble-screen">
      <GameHeader title="WOBBLE LAB" />
      <div className="wobble-scoreboard">
        <div><span>SCORE</span><b>{(snapshot?.score ?? 0).toLocaleString()}</b></div>
        <div><span>HEIGHT</span><b>{((snapshot?.height ?? 0) / 7).toFixed(1)}m</b></div>
        <div><span>STAGE</span><b>{snapshot?.stage ?? 1}</b></div>
      </div>
      <PieceQueue
        queue={snapshot?.queue ?? []} phase={phase} dragging={snapshot?.dragging ?? false}
        onStart={startDrag} onMove={moveDrag} onRelease={releaseDrag} onCancel={cancelDrag}
      />
      <div className="wobble-instruction" aria-live="polite">
        <strong>{instruction}</strong>
        <span>{hint}</span>
      </div>
      <div className="wobble-stage">
        <WobbleCanvas
          sessionId={sessionId} playerIds={playerIds} difficulty={difficulty}
          reduceMotion={reduceMotion} onWorld={onWorld} onUpdate={onUpdate}
          onFinished={onFinished} onImpact={onImpact} onPlace={placeOnCanvas}
        />
        {snapshot?.phase === "landed" && snapshot.stageCleared && (
          <div className="wobble-stage-banner" aria-live="polite">
            <span>★ DELIVERY COMPLETE ★</span>
            <strong>STAGE {snapshot.stage}</strong>
          </div>
        )}
        {snapshot?.phase === "over" && (
          <WobbleResults snapshot={snapshot}
            players={players.filter((p) => playerIds.includes(p.id))}
            record={Math.max(bestScore, snapshot.score)}
            bestHeight={Math.max(bestHeight, snapshot.height)} onAgain={again} />
        )}
      </div>
      <div className="wobble-bottom">
        {phase === "landed" && playerIds.length > 1 && (
          <GameButton onClick={() => { worldRef.current?.continue(); playSound("select") }}>
            PASS TO {nextPlayer?.name ?? "NEXT PLAYER"}
          </GameButton>
        )}
        <p className="wobble-footer">{snapshot?.turns ?? 0} PLACED · BEST {bestScore.toLocaleString()} · {difficulty.toUpperCase()} MODE</p>
      </div>
    </GameScreen>
  )
}
