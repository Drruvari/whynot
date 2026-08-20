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

const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`

const SOUNDS: Record<SoundId, string> = {
  click: asset("audio/ui/click.ogg"),
  select: asset("audio/ui/select.ogg"),
  back: asset("audio/ui/back.ogg"),
  toggle: asset("audio/ui/toggle.ogg"),
  error: asset("audio/ui/error.ogg"),
  safe: asset("audio/game/safe.ogg"),
  warning: asset("audio/game/warning.ogg"),
  bomb: asset("audio/game/bomb.ogg"),
  winner: asset("audio/game/winner.ogg"),
  loser: asset("audio/game/loser.ogg"),
  tick: asset("audio/game/countdown-tick.ogg"),
  tickFinal: asset("audio/game/countdown-final.ogg"),
  roundStart: asset("audio/game/round-start.ogg"),
  voteLock: asset("audio/game/vote-lock.ogg"),
  voteReveal: asset("audio/game/vote-reveal.ogg"),
  spyReveal: asset("audio/spy/reveal.ogg"),
  spyCaught: asset("audio/spy/caught.ogg"),
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
