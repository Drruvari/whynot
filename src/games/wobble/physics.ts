import * as Matter from "matter-js"
import {
  clampAim, JUNK_COLORS, landingPoints, makeStageQueue, MAX_PIECES,
  PLATFORM_WIDTH, PLATFORM_X, PLATFORM_Y, stageFromTurns, windPower, WORLD_WIDTH,
} from "./rules"
import type { Difficulty, Junk, RunSnapshot, SavedRun } from "./types"

const STEP = 1000 / 60
const FLOOR = PLATFORM_Y

type Piece = { body: Matter.Body; kind: Junk }
type WorldCallbacks = {
  update: (snapshot: RunSnapshot) => void
  finished: (run: SavedRun) => void
  impact: (kind: "land" | "fail" | "stage") => void
}

function createPiece(kind: Junk, x: number, y: number): Matter.Body {
  const opts: Matter.IChamferableBodyDefinition = {
    friction: 0.84, frictionStatic: 1.45, frictionAir: 0.012,
    restitution: 0.025, density: 0.0017, chamfer: { radius: 3 },
  }
  switch (kind) {
    case "crate": return Matter.Bodies.rectangle(x, y, 58, 53, opts)
    case "plank": return Matter.Bodies.rectangle(x, y, 106, 18, opts)
    case "barrel": return Matter.Bodies.rectangle(x, y, 51, 69, { ...opts, chamfer: { radius: 12 } })
    case "wedge": return Matter.Bodies.polygon(x, y, 3, 39, { ...opts, chamfer: { radius: 2 } })
    case "fridge": return Matter.Bodies.rectangle(x, y, 47, 86, opts)
    case "wheel": return Matter.Bodies.circle(x, y, 29, { ...opts, restitution: 0.075 })
    case "brick": return Matter.Bodies.rectangle(x, y, 74, 31, opts)
    case "battery": return Matter.Bodies.rectangle(x, y, 49, 64, opts)
    case "duck": return Matter.Bodies.circle(x, y, 29, { ...opts, restitution: 0.055, density: 0.0012 })
    case "tblock": {
      const top = Matter.Bodies.rectangle(x, y - 15, 94, 23, opts)
      const stem = Matter.Bodies.rectangle(x, y + 19, 27, 51, opts)
      return Matter.Body.create({ parts: [top, stem], friction: 0.9, frictionStatic: 1.5, frictionAir: 0.012, restitution: 0.025 })
    }
  }
}

function polygon(ctx: CanvasRenderingContext2D, points: Matter.Vector[]) {
  if (!points.length) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
}

export class WobbleWorld {
  private readonly canvas: HTMLCanvasElement
  private readonly playerIds: string[]
  private readonly difficulty: Difficulty
  private readonly onUpdate: WorldCallbacks["update"]
  private readonly onFinished: WorldCallbacks["finished"]
  private readonly onImpact: WorldCallbacks["impact"]
  private readonly engine = Matter.Engine.create({
    positionIterations: 9, velocityIterations: 9, constraintIterations: 4,
  })
  private readonly platform: Matter.Body
  private readonly pieces: Piece[] = []
  private queue: Junk[] = makeStageQueue()
  private preview: Matter.Body
  private phase: RunSnapshot["phase"] = "aim"
  private dragging = false
  private previewVisible = false
  private aimX = PLATFORM_X
  private aimY = FLOOR - 115
  private turns = 0
  private playerIndex = 0
  private score = 0
  private height = 0
  private lastPoints = 0
  private stageCleared = false
  private frame = 0
  private fallingFrames = 0
  private stillFrames = 0
  private landedFrames = 0
  private wind = 0
  private reason = ""
  private readonly points: Record<string, number> = {}
  private cameraTop = 0
  private cameraInitialized = false
  private disposed = false

  constructor(canvas: HTMLCanvasElement, playerIds: string[], difficulty: Difficulty, callbacks: WorldCallbacks) {
    this.canvas = canvas
    this.playerIds = [...playerIds]
    this.difficulty = difficulty
    this.onUpdate = callbacks.update
    this.onFinished = callbacks.finished
    this.onImpact = callbacks.impact
    this.engine.gravity.y = 1.05
    this.platform = Matter.Bodies.rectangle(PLATFORM_X, FLOOR, PLATFORM_WIDTH, 26, {
      isStatic: true, friction: 1.4, frictionStatic: 2, restitution: 0.015,
    })
    Matter.Composite.add(this.engine.world, this.platform)
    for (const id of this.playerIds) this.points[id] = 0
    this.preview = createPiece(this.queue[0]!, PLATFORM_X, this.aimY)
  }

  get snapshot(): RunSnapshot {
    return {
      phase: this.phase, turns: this.turns, playerIndex: this.playerIndex,
      score: this.score, height: this.height, lastPoints: this.lastPoints,
      wind: this.wind, junk: this.queue[0] ?? "duck", queue: this.queue.slice(0, 5),
      stage: stageFromTurns(this.turns), stageCleared: this.stageCleared,
      dragging: this.dragging, points: { ...this.points }, reason: this.reason,
    }
  }

  private emit() { if (!this.disposed) this.onUpdate(this.snapshot) }

  private highestY(): number {
    if (this.pieces.length === 0) return FLOOR - 13
    return Math.min(FLOOR - 13, ...this.pieces.map(({ body }) => body.bounds.min.y))
  }

  private worldPoint(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    const inside = rect.width > 0 && rect.height > 0 &&
      clientX >= rect.left && clientX <= rect.right &&
      clientY >= rect.top && clientY <= rect.bottom
    const scale = rect.width > 0 ? WORLD_WIDTH / rect.width : 1
    return {
      inside,
      x: clampAim((clientX - rect.left) * scale),
      y: (clientY - rect.top) * scale + this.cameraTop,
    }
  }

  private movePreview(x: number, y: number) {
    this.aimX = x
    // Pieces always enter from above the existing stack, never materialize inside it.
    this.aimY = Math.min(y, this.highestY() - 78)
    Matter.Body.setPosition(this.preview, { x: this.aimX, y: this.aimY })
  }

  beginDrag(): boolean {
    if (this.disposed || this.phase !== "aim" || this.dragging) return false
    this.dragging = true
    this.previewVisible = false
    this.emit()
    return true
  }

  dragTo(clientX: number, clientY: number) {
    if (!this.dragging || this.phase !== "aim") return
    const point = this.worldPoint(clientX, clientY)
    this.previewVisible = point.inside
    if (point.inside) this.movePreview(point.x, point.y - 35)
  }

  releaseDrag(clientX: number, clientY: number): boolean {
    if (!this.dragging || this.phase !== "aim") return false
    const point = this.worldPoint(clientX, clientY)
    this.dragging = false
    this.previewVisible = false
    if (!point.inside) { this.emit(); return false }
    this.movePreview(point.x, point.y - 35)
    return this.drop()
  }

  cancelDrag() {
    if (!this.dragging) return
    this.dragging = false
    this.previewVisible = false
    this.emit()
  }

  // Keyboard and assistive input: select the highlighted queue tile, then click a place.
  placeAt(clientX: number, clientY: number): boolean {
    if (this.phase !== "aim" || this.dragging) return false
    const point = this.worldPoint(clientX, clientY)
    if (!point.inside) return false
    this.movePreview(point.x, point.y - 35)
    return this.drop()
  }

  private drop(): boolean {
    if (this.phase !== "aim") return false
    const kind = this.queue[0]!
    const body = createPiece(kind, this.aimX, this.aimY)
    Matter.Composite.add(this.engine.world, body)
    this.pieces.push({ body, kind })
    this.phase = "falling"
    this.fallingFrames = 0
    this.stillFrames = 0
    this.stageCleared = false
    this.emit()
    return true
  }

  continue(): boolean {
    if (this.phase !== "landed" || this.disposed) return false
    if (this.pieces.length >= MAX_PIECES) {
      this.end("LEGEND! You stacked every delivery.")
      return true
    }
    this.queue.shift()
    if (!this.queue.length) this.queue = makeStageQueue()
    this.preview = createPiece(this.queue[0]!, PLATFORM_X, FLOOR - 115)
    this.aimX = PLATFORM_X
    this.aimY = FLOOR - 115
    this.phase = "aim"
    this.playerIndex = (this.playerIndex + 1) % this.playerIds.length
    this.stageCleared = false
    this.landedFrames = 0
    this.emit()
    return true
  }

  private end(reason: string) {
    if (this.phase === "over" || this.disposed) return
    this.phase = "over"
    this.dragging = false
    this.reason = reason
    this.onImpact(reason.startsWith("LEGEND!") ? "stage" : "fail")
    this.emit()
    this.onFinished({ score: this.score, height: this.height, turns: this.turns, points: { ...this.points }, endedAt: Date.now() })
  }

  private land() {
    if (this.phase !== "falling") return
    const nextHeight = Math.max(this.height, Math.round(Math.max(0, FLOOR - this.highestY())))
    const duck = this.pieces[this.pieces.length - 1]?.kind === "duck"
    this.lastPoints = landingPoints(nextHeight - this.height, this.turns + 1, duck)
    this.height = nextHeight
    this.score += this.lastPoints
    this.points[this.playerIds[this.playerIndex]!] = (this.points[this.playerIds[this.playerIndex]!] ?? 0) + this.lastPoints
    this.turns++
    this.phase = "landed"
    this.stageCleared = duck
    this.landedFrames = 0
    this.onImpact(duck ? "stage" : "land")
    this.emit()
  }

  update() {
    if (this.disposed || this.phase === "over") return
    this.frame++
    const level = Math.min(2, 0.75 + this.turns * 0.06)
    this.wind = (Math.sin(this.frame * 0.018) * 0.65 + Math.sin(this.frame * 0.037 + 1.4) * 0.35)
      * windPower(this.difficulty) * level

    for (const { body } of this.pieces) {
      Matter.Body.applyForce(body, body.position, { x: this.wind * body.mass * 0.00016, y: 0 })
    }
    Matter.Engine.update(this.engine, STEP)

    if (this.pieces.some(({ body }) =>
      body.position.y > FLOOR + 100 || body.position.x < -85 || body.position.x > WORLD_WIDTH + 85,
    )) {
      this.end("A piece fell off the platform!")
      return
    }

    if (this.phase === "falling") {
      this.fallingFrames++
      const last = this.pieces[this.pieces.length - 1]!.body
      const still = last.speed < 0.65 && last.angularSpeed < 0.025 &&
        this.pieces.every(({ body }) => body.speed < 1.8)
      this.stillFrames = still ? this.stillFrames + 1 : 0
      if (this.fallingFrames >= 55 && this.stillFrames >= 32) {
        this.land()
        return
      }
      // Do not award a landing while a piece is still moving or falling.
      if (this.fallingFrames > 750) {
        this.end("The tower never stopped moving!")
        return
      }
    }
    if (this.phase === "landed" && this.playerIds.length === 1) {
      this.landedFrames++
      if (this.landedFrames > (this.stageCleared ? 110 : 65)) this.continue()
    }
    if (this.frame % 10 === 0) this.emit()
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, height: number) {
    const sky = ctx.createLinearGradient(0, 0, 0, height)
    sky.addColorStop(0, "#73c3ff")
    sky.addColorStop(0.62, "#b1e3f6")
    sky.addColorStop(1, "#d1e4c0")
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, WORLD_WIDTH, height)
    const offset = this.cameraTop * 0.09
    for (const [x, y, s] of [[65, 105, 1], [290, 210, 0.8], [420, 74, 0.65], [165, 385, 0.7]] as const) {
      const cy = y + offset * 0.25
      ctx.fillStyle = "#ffffff92"
      ctx.beginPath()
      ctx.ellipse(x, cy, 62 * s, 17 * s, 0, 0, 2 * Math.PI)
      ctx.ellipse(x - 26 * s, cy - 10 * s, 30 * s, 23 * s, 0, 0, 2 * Math.PI)
      ctx.ellipse(x + 15 * s, cy - 15 * s, 38 * s, 28 * s, 0, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  private drawLandscape(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#9fd59e"
    ctx.beginPath(); ctx.moveTo(-40, FLOOR + 30)
    for (let x = -40; x <= WORLD_WIDTH + 40; x += 20) ctx.lineTo(x, FLOOR - 82 - Math.sin(x * 0.024) * 24 - Math.cos(x * 0.044) * 15)
    ctx.lineTo(WORLD_WIDTH + 40, FLOOR + 130); ctx.lineTo(-40, FLOOR + 130); ctx.fill()
    ctx.fillStyle = "#77ba82"
    ctx.beginPath(); ctx.moveTo(-30, FLOOR + 30)
    for (let x = -30; x <= WORLD_WIDTH + 30; x += 18) ctx.lineTo(x, FLOOR - 45 - Math.sin(x * 0.031 + 2.8) * 15)
    ctx.lineTo(WORLD_WIDTH + 30, FLOOR + 130); ctx.lineTo(-30, FLOOR + 130); ctx.fill()
    // Friendly handmade sheds make the ground position obvious.
    ctx.fillStyle = "#d5726a"
    ctx.fillRect(27, FLOOR - 68, 62, 67)
    ctx.fillStyle = "#8d5a55"
    ctx.beginPath(); ctx.moveTo(18, FLOOR - 68); ctx.lineTo(59, FLOOR - 105); ctx.lineTo(98, FLOOR - 68); ctx.closePath(); ctx.fill()
    ctx.fillStyle = "#f5e9ca"; ctx.fillRect(39, FLOOR - 52, 14, 17); ctx.fillRect(65, FLOOR - 52, 14, 17)
    ctx.fillStyle = "#ab614b"; ctx.fillRect(323, FLOOR - 36, 67, 36)
    ctx.fillStyle = "#765a50"; ctx.beginPath(); ctx.ellipse(356, FLOOR - 36, 35, 15, 0, Math.PI, 2 * Math.PI); ctx.fill()
    ctx.fillStyle = "#9b603e"; ctx.fillRect(-30, FLOOR + 13, WORLD_WIDTH + 60, 170)
    ctx.fillStyle = "#c58a51"
    for (let x = 6; x < WORLD_WIDTH; x += 31) {
      ctx.beginPath(); ctx.ellipse(x, FLOOR + 19 + Math.sin(x) * 3, 19, 6, 0, 0, 2 * Math.PI); ctx.fill()
    }
  }

  private drawPlatform(ctx: CanvasRenderingContext2D) {
    const x = PLATFORM_X - PLATFORM_WIDTH / 2
    ctx.fillStyle = "#514a4b"; ctx.fillRect(x - 4, FLOOR - 18, PLATFORM_WIDTH + 8, 35)
    ctx.fillStyle = "#d3cfb6"; ctx.fillRect(x, FLOOR - 15, PLATFORM_WIDTH, 28)
    ctx.fillStyle = "#b2b2a1"; ctx.fillRect(x, FLOOR + 7, PLATFORM_WIDTH, 6)
    ctx.strokeStyle = "#665e59"; ctx.lineWidth = 2
    for (let i = 1; i < 4; i++) {
      const xx = x + i * PLATFORM_WIDTH / 4
      ctx.beginPath(); ctx.moveTo(xx, FLOOR - 13); ctx.lineTo(xx, FLOOR + 12); ctx.stroke()
    }
    ctx.fillStyle = "#86b46e"
    for (let i = 0; i < 13; i++) {
      const px = x + 13 + ((i * 73) % (PLATFORM_WIDTH - 20))
      const py = FLOOR - 12 + ((i * 19) % 17)
      ctx.beginPath(); ctx.ellipse(px, py, 4, 2.2, 0.2, 0, 2 * Math.PI); ctx.fill()
    }
  }

  private drawPiece(ctx: CanvasRenderingContext2D, { body, kind }: Piece, ghost = false) {
    ctx.save()
    if (ghost) ctx.globalAlpha = 0.65
    const parts = body.parts.length > 1 ? body.parts.slice(1) : [body]
    for (const part of parts) {
      polygon(ctx, part.vertices)
      ctx.fillStyle = JUNK_COLORS[kind]
      ctx.fill()
      ctx.strokeStyle = "#533e48"
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
    ctx.translate(body.position.x, body.position.y)
    ctx.rotate(body.angle)
    ctx.lineCap = "round"
    ctx.strokeStyle = "#634752"
    ctx.lineWidth = 3
    switch (kind) {
      case "crate":
        ctx.strokeRect(-23, -21, 46, 42)
        ctx.beginPath(); ctx.moveTo(-21, -19); ctx.lineTo(21, 19); ctx.moveTo(21, -19); ctx.lineTo(-21, 19); ctx.stroke()
        break
      case "plank":
        ctx.beginPath(); ctx.moveTo(-46, -3); ctx.lineTo(46, -3); ctx.stroke()
        ctx.fillStyle = "#9b6843"; ctx.fillRect(-36, -4, 4, 4); ctx.fillRect(35, -4, 4, 4)
        break
      case "barrel":
        ctx.strokeStyle = "#9a424a"; ctx.lineWidth = 5
        for (const y of [-21, 0, 21]) { ctx.beginPath(); ctx.moveTo(-23, y); ctx.lineTo(23, y); ctx.stroke() }
        ctx.fillStyle = "#ffe39a"; ctx.beginPath(); ctx.arc(0, -10, 5, 0, 2 * Math.PI); ctx.fill()
        break
      case "wedge":
        ctx.fillStyle = "#fbe0aa"; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(-8, 13); ctx.lineTo(8, 13); ctx.closePath(); ctx.fill()
        break
      case "fridge":
        ctx.strokeRect(-18, -37, 36, 69)
        ctx.beginPath(); ctx.moveTo(-18, -4); ctx.lineTo(18, -4); ctx.stroke()
        ctx.fillStyle = "#629b9e"; ctx.fillRect(7, -28, 4, 16); ctx.fillRect(7, 7, 4, 13)
        break
      case "wheel":
        ctx.fillStyle = "#bbbcc5"; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 2 * Math.PI); ctx.fill()
        ctx.fillStyle = "#45445b"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 2 * Math.PI); ctx.fill()
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * 2 * Math.PI
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8); ctx.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); ctx.stroke()
        }
        break
      case "brick":
        ctx.strokeStyle = "#a34649"; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(-35, 1); ctx.lineTo(35, 1); ctx.moveTo(0, -14); ctx.lineTo(0, 1); ctx.moveTo(-17, 1); ctx.lineTo(-17, 14); ctx.moveTo(18, 1); ctx.lineTo(18, 14); ctx.stroke()
        break
      case "battery":
        ctx.fillStyle = "#587e5c"; ctx.fillRect(-16, -37, 11, 6); ctx.fillRect(5, -37, 11, 6)
        ctx.fillStyle = "#fff7c4"; ctx.font = "bold 31px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("⚡", 0, 0)
        break
      case "tblock":
        ctx.fillStyle = "#cf8d49"; ctx.fillRect(-43, -19, 86, 5); ctx.fillRect(-9, 2, 18, 32)
        break
      case "duck":
        ctx.fillStyle = "#fff0a1"; ctx.beginPath(); ctx.arc(4, 8, 18, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#fff2a3"; ctx.beginPath(); ctx.arc(-7, -11, 16, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#40394a"; ctx.beginPath(); ctx.arc(-12, -14, 2.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = "#f58a65"; ctx.beginPath(); ctx.moveTo(-23, -8); ctx.lineTo(-34, -3); ctx.lineTo(-21, 0); ctx.closePath(); ctx.fill()
        ctx.fillStyle = "#f1bd5c"; ctx.beginPath(); ctx.ellipse(11, 9, 9, 6, -0.4, 0, Math.PI * 2); ctx.fill()
        break
    }
    ctx.restore()
  }

  render(reducedMotion = false) {
    const ctx = this.canvas.getContext("2d")
    if (!ctx) return
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (w < 2 || h < 2) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const bw = Math.round(w * dpr)
    const bh = Math.round(h * dpr)
    if (this.canvas.width !== bw || this.canvas.height !== bh) {
      this.canvas.width = bw; this.canvas.height = bh
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const scale = w / WORLD_WIDTH
    const viewH = h / scale
    const baseCamera = FLOOR - viewH * 0.75
    const target = Math.min(baseCamera, this.highestY() - viewH * 0.25)
    if (!this.cameraInitialized) {
      this.cameraTop = target
      this.cameraInitialized = true
    } else if (this.phase !== "aim" || !this.dragging) {
      this.cameraTop += (target - this.cameraTop) * (reducedMotion ? 1 : 0.09)
    }
    ctx.save()
    ctx.scale(scale, scale)
    this.drawBackdrop(ctx, viewH)
    ctx.translate(0, -this.cameraTop)
    this.drawLandscape(ctx)
    // Non-interactive height guide follows the platform, not the camera.
    ctx.textAlign = "left"; ctx.font = "bold 11px monospace"
    for (let y = FLOOR - 82; y > this.cameraTop - 40; y -= 70) {
      ctx.strokeStyle = "#ffffff8a"; ctx.setLineDash([3, 7]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_WIDTH, y); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = "#397c98"; ctx.fillText(`${Math.round((FLOOR - y) / 7)}m`, 8, y - 5)
    }
    this.drawPlatform(ctx)
    for (const piece of this.pieces) this.drawPiece(ctx, piece)
    if (this.phase === "aim" && this.previewVisible) {
      this.drawPiece(ctx, { body: this.preview, kind: this.queue[0]! }, true)
      ctx.strokeStyle = "#ffffffbb"; ctx.lineWidth = 2
      ctx.setLineDash([5, 7]); ctx.beginPath()
      ctx.moveTo(this.aimX, this.aimY + 39); ctx.lineTo(this.aimX, FLOOR - 17); ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.restore()
  }

  dispose() {
    this.disposed = true
    Matter.Composite.clear(this.engine.world, false)
    Matter.Engine.clear(this.engine)
  }
}
