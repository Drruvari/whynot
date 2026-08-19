import { useApp } from "@/store/app"

const PATTERNS = {
  tap: 12,
  success: 24,
  warn: [18, 40, 18],
  bomb: [40, 30, 80, 30, 140],
} as const

export function haptic(kind: keyof typeof PATTERNS) {
  if (typeof navigator === "undefined" || !navigator.vibrate) {
    return
  }

  if (!useApp.getState().hapticsOn) {
    return
  }

  navigator.vibrate(PATTERNS[kind])
}
