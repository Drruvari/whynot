import type { PointerEvent } from "react"
import { JUNK_EMOJI, JUNK_NAMES } from "../rules"
import type { Junk, Phase } from "../types"

type Props = {
  queue: Junk[]
  phase: Phase
  dragging: boolean
  onStart: () => boolean
  onMove: (x: number, y: number) => void
  onRelease: (x: number, y: number) => void
  onCancel: () => void
}

export function PieceQueue({ queue, phase, dragging, onStart, onMove, onRelease, onCancel }: Props) {
  const canDrag = phase === "aim" && queue.length > 0

  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (!canDrag || (event.pointerType === "mouse" && event.button !== 0)) return
    if (!onStart()) return
    event.currentTarget.setPointerCapture(event.pointerId)
    onMove(event.clientX, event.clientY)
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) onMove(event.clientX, event.clientY)
  }

  function pointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    onRelease(event.clientX, event.clientY)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function pointerCancel() { onCancel() }

  return (
    <div className="wobble-tray" aria-label="Upcoming pieces">
      <div className="wobble-tray-heading">
        <span>NEXT UP</span>
        <span className="wobble-tray-tip">DRAG THE GLOWING PIECE DOWN ↓</span>
      </div>
      <div className="wobble-queue">
        {queue.map((kind, index) => (
          <button
            key={`${kind}-${index}`}
            type="button"
            disabled={index !== 0 || !canDrag}
            aria-label={index === 0 ? `Drag ${JUNK_NAMES[kind]} onto the platform` : `Upcoming ${JUNK_NAMES[kind]}`}
            className={`wobble-queue-tile ${index === 0 ? "is-current" : ""} ${index === 0 && dragging ? "is-dragging" : ""}`}
            onPointerDown={index === 0 ? pointerDown : undefined}
            onPointerMove={index === 0 ? pointerMove : undefined}
            onPointerUp={index === 0 ? pointerUp : undefined}
            onPointerCancel={index === 0 ? pointerCancel : undefined}
            onLostPointerCapture={index === 0 ? pointerCancel : undefined}
          >
            <span className="wobble-queue-art" aria-hidden="true">{JUNK_EMOJI[kind]}</span>
            <span className="wobble-queue-name">{index === 0 ? "NOW" : kind === "duck" ? "BONUS" : JUNK_NAMES[kind]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
