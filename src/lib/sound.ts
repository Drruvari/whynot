import { useApp } from "@/store/app"

export type SoundId =
  | "click"
  | "select"
  | "back"
  | "toggle"
  | "error"
  | "safe"
  | "warning"
  | "bomb"
  | "winner"
  | "loser"
  | "tick"
  | "tickFinal"
  | "roundStart"
  | "voteLock"
  | "voteReveal"
  | "spyReveal"
  | "spyCaught"

const SOUNDS: Record<SoundId, string> = {
  click: "/audio/ui/click.ogg",
  select: "/audio/ui/select.ogg",
  back: "/audio/ui/back.ogg",
  toggle: "/audio/ui/toggle.ogg",
  error: "/audio/ui/error.ogg",
  safe: "/audio/game/safe.ogg",
  warning: "/audio/game/warning.ogg",
  bomb: "/audio/game/bomb.ogg",
  winner: "/audio/game/winner.ogg",
  loser: "/audio/game/loser.ogg",
  tick: "/audio/game/countdown-tick.ogg",
  tickFinal: "/audio/game/countdown-final.ogg",
  roundStart: "/audio/game/round-start.ogg",
  voteLock: "/audio/game/vote-lock.ogg",
  voteReveal: "/audio/game/vote-reveal.ogg",
  spyReveal: "/audio/spy/reveal.ogg",
  spyCaught: "/audio/spy/caught.ogg",
}

const clips = new Map<SoundId, HTMLAudioElement>()

export function preloadSounds() {
  if (typeof window === "undefined" || clips.size > 0) {
    return
  }

  for (const id of Object.keys(SOUNDS) as SoundId[]) {
    const audio = new Audio()
    audio.preload = "auto"
    audio.src = SOUNDS[id]
    clips.set(id, audio)
  }
}

export function playSound(id: SoundId, volumeScale = 1) {
  if (typeof window === "undefined") {
    return
  }

  const { soundOn, soundVolume } = useApp.getState()

  if (!soundOn || soundVolume <= 0) {
    return
  }

  const source = clips.get(id) ?? new Audio(SOUNDS[id])
  const audio = source.cloneNode(true) as HTMLAudioElement
  audio.volume = Math.max(0, Math.min(1, (soundVolume / 100) * volumeScale))
  void audio.play().catch(() => {
    // Ignore autoplay blocks until a gesture unlocks audio.
  })
}
