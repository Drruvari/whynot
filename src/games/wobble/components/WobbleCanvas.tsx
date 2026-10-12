import { useEffect, useRef } from "react"
import { WobbleWorld } from "../physics"
import type { Difficulty, RunSnapshot, SavedRun } from "../types"

type Props = {
  sessionId: number
  playerIds: string[]
  difficulty: Difficulty
  reduceMotion: boolean
  onWorld: (world: WobbleWorld | null) => void
  onUpdate: (snapshot: RunSnapshot) => void
  onFinished: (run: SavedRun) => void
  onImpact: (kind: "land" | "fail" | "stage") => void
  onPlace: (clientX: number, clientY: number) => void
}

export function WobbleCanvas({
  sessionId, playerIds, difficulty, reduceMotion,
  onWorld, onUpdate, onFinished, onImpact, onPlace,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const callbacks = useRef({ onWorld, onUpdate, onFinished, onImpact })
  callbacks.current = { onWorld, onUpdate, onFinished, onImpact }
  const idsKey = playerIds.join("\u0000")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !idsKey || sessionId < 1) return
    const world = new WobbleWorld(canvas, idsKey.split("\u0000"), difficulty, {
      update: (value) => callbacks.current.onUpdate(value),
      finished: (value) => callbacks.current.onFinished(value),
      impact: (value) => callbacks.current.onImpact(value),
    })
    callbacks.current.onWorld(world)
    callbacks.current.onUpdate(world.snapshot)
    let raf = 0
    let prior = 0
    let accumulated = 0
    let alive = true
    const tick = (time: number) => {
      if (!alive) return
      if (!document.hidden) {
        const elapsed = prior ? Math.min(64, time - prior) : 0
        accumulated += elapsed
        let steps = 0
        while (accumulated >= 1000 / 60 && steps < 4) {
          world.update()
          accumulated -= 1000 / 60
          steps++
        }
        world.render(reduceMotion)
      } else {
        accumulated = 0
      }
      prior = time
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      callbacks.current.onWorld(null)
      world.dispose()
    }
  }, [sessionId, idsKey, difficulty, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className="wobble-canvas"
      aria-label="Tower building playfield. Drag the first piece from the top row here, or click where you want it to fall."
      role="button"
      tabIndex={0}
      onPointerUp={(event) => {
        // This handles optional click/tap-to-place. Drag gestures originate in PieceQueue.
        if (event.pointerType === "mouse" && event.button !== 0) return
        onPlace(event.clientX, event.clientY)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          const rect = event.currentTarget.getBoundingClientRect()
          onPlace(rect.left + rect.width / 2, rect.top + rect.height * 0.3)
        }
      }}
    />
  )
}
